import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { submitQuiz, getQuiz, runCode, submitCode } from "../services/quizService";

function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = location.state || {};

  const [quizId, setQuizId] = useState(stateData.quizId || null);
  const [questions, setQuestions] = useState(stateData.questions || []);
  const [role, setRole] = useState(stateData.role || "Technical Candidate");
  const [topics, setTopics] = useState(stateData.topics || []);
  const [duration, setDuration] = useState(stateData.duration || 1200);
  const [startTime, setStartTime] = useState(stateData.startTime || null);
  const [monitoringEnabled, setMonitoringEnabled] = useState(stateData.monitoringEnabled ?? true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // MCQ answers: { [qId]: option }
  const [codingAnswers, setCodingAnswers] = useState({}); // Coding answers: { [qId]: { code, language, testResults } }
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Code runner states
  const [isRunningCode, setIsRunningCode] = useState(false);
  const [isTestingCode, setIsTestingCode] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [executionOutput, setExecutionOutput] = useState(null);

  // Proctoring and Monitoring State
  const [monitoringEvents, setMonitoringEvents] = useState([]);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [focusLostCount, setFocusLostCount] = useState(0);
  const [cameraDisconnections, setCameraDisconnections] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraWarning, setCameraWarning] = useState("");

  const [isAssessmentLocked, setIsAssessmentLocked] = useState(false);
  const [lockedReason, setLockedReason] = useState("");

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const submitLockRef = useRef(false);

  // Snapshot refs to eliminate stale closure bugs during async visibilitychange
  const answersRef = useRef(answers);
  const codingAnswersRef = useRef(codingAnswers);
  const monitoringEventsRef = useRef(monitoringEvents);
  const tabSwitchesRef = useRef(tabSwitches);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    codingAnswersRef.current = codingAnswers;
  }, [codingAnswers]);

  useEffect(() => {
    monitoringEventsRef.current = monitoringEvents;
  }, [monitoringEvents]);

  useEffect(() => {
    tabSwitchesRef.current = tabSwitches;
  }, [tabSwitches]);

  // Restore saved assessment data from localStorage if available
  useEffect(() => {
    if (quizId) {
      try {
        const savedSession = localStorage.getItem(`skill_specific_quiz_${quizId}`);
        if (savedSession) {
          const parsed = JSON.parse(savedSession);
          if (parsed.answers) setAnswers(parsed.answers);
          if (parsed.codingAnswers) setCodingAnswers(parsed.codingAnswers);
          if (parsed.monitoringEvents) setMonitoringEvents(parsed.monitoringEvents);
          if (parsed.tabSwitches) setTabSwitches(parsed.tabSwitches);
          if (parsed.focusLostCount) setFocusLostCount(parsed.focusLostCount);
        }
      } catch (err) {
        console.warn("Could not restore local quiz session:", err);
      }
    }
  }, [quizId]);

  // Persist answers & coding states to localStorage
  useEffect(() => {
    if (quizId) {
      try {
        const sessionPayload = {
          answers,
          codingAnswers,
          monitoringEvents,
          tabSwitches,
          focusLostCount,
          cameraDisconnections,
        };
        localStorage.setItem(`skill_specific_quiz_${quizId}`, JSON.stringify(sessionPayload));
      } catch (err) {
        console.warn("Could not persist local quiz session:", err);
      }
    }
  }, [quizId, answers, codingAnswers, monitoringEvents, tabSwitches, focusLostCount, cameraDisconnections]);

  // Fallback: If page reloaded with quizId, fetch assessment data ONCE
  useEffect(() => {
    if ((!questions || questions.length === 0) && quizId) {
      const loadQuiz = async () => {
        try {
          setLoading(true);
          const data = await getQuiz(quizId);
          if (data && data.quiz) {
            setQuestions(data.quiz.questions || []);
            setRole(data.quiz.role || "Technical Candidate");
            setTopics(data.quiz.topics || []);
            setDuration(data.quiz.duration || 1200);
            setStartTime(data.quiz.startTime);
            setMonitoringEnabled(data.quiz.monitoringEnabled ?? true);
          }
        } catch (err) {
          console.error("LOAD QUIZ ERROR:", err);
          setError("Unable to retrieve assessment session.");
        } finally {
          setLoading(false);
        }
      };
      loadQuiz();
    }
  }, [quizId]);

  // Initialize remaining time based on startTime if present
  useEffect(() => {
    if (startTime) {
      const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
      const remaining = Math.max(0, duration - elapsed);
      setTimeLeft(remaining);
    } else {
      setTimeLeft(duration);
    }
  }, [startTime, duration]);

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0 && questions.length > 0) {
      handleAutoSubmit();
      return;
    }

    if (isAssessmentLocked) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, questions.length, isAssessmentLocked]);

  // Proctoring: Webcam stream setup
  useEffect(() => {
    if (!monitoringEnabled) return;

    let isMounted = true;

    const initCamera = async () => {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setCameraWarning("Webcam access not supported on this browser.");
          return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
          audio: false,
        });

        if (isMounted) {
          mediaStreamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setCameraActive(true);
          setCameraWarning("");

          // Monitor track ended (camera disconnection)
          stream.getVideoTracks().forEach((track) => {
            track.onended = () => {
              setCameraActive(false);
              setCameraDisconnections((c) => c + 1);
              setMonitoringEvents((prev) => [
                ...prev,
                { type: "camera_disconnected", eventType: "camera_disconnected", timestamp: new Date().toISOString(), details: "Video track ended" },
              ]);
            };
          });
        }
      } catch (camErr) {
        console.warn("Webcam permission denied or unavailable:", camErr);
        if (isMounted) {
          setCameraActive(false);
          setCameraWarning("Camera inactive. Assessment integrity monitoring active.");
        }
      }
    };

    initCamera();

    return () => {
      isMounted = false;
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [monitoringEnabled]);

  // Proctoring: Tab switch & Window focus loss detection (Auto-Submits immediately on tab switch)
  useEffect(() => {
    if (!monitoringEnabled || !quizId) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" || document.hidden) {
        if (submitLockRef.current) return;
        submitLockRef.current = true;
        console.warn("[TAB MONITOR] TAB_SWITCH detected! Auto-submitting assessment immediately...");

        setIsAssessmentLocked(true);
        setLockedReason("Assessment automatically submitted because a tab switch was detected.");

        const newCount = (tabSwitchesRef.current || 0) + 1;
        setTabSwitches(newCount);

        const tabEvent = {
          type: "TAB_SWITCH",
          eventType: "tab_switch",
          timestamp: new Date().toISOString(),
          details: "Candidate switched away from assessment tab",
        };

        const updatedEvents = [...(monitoringEventsRef.current || []), tabEvent];
        setMonitoringEvents(updatedEvents);

        executeSubmission({
          isAutoSubmit: true,
          customTabSwitches: newCount,
          customEvents: updatedEvents,
        });
      }
    };

    const handleWindowBlur = () => {
      setFocusLostCount((count) => count + 1);
      setMonitoringEvents((prev) => [
        ...prev,
        {
          type: "TAB_SWITCH",
          eventType: "focus_lost",
          timestamp: new Date().toISOString(),
          details: "Window lost focus / application switch",
        },
      ]);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [monitoringEnabled, quizId]);

  const currentQuestion = questions[currentIndex];

  const [consoleTab, setConsoleTab] = useState("tests"); // "tests" | "output" | "input"

  // Initialize coding answer for current question if coding type
  useEffect(() => {
    if (currentQuestion && currentQuestion.questionType === "coding") {
      const qId = currentQuestion._id;
      if (!codingAnswers[qId]) {
        const defaultLang = currentQuestion.allowedLanguages?.[0] || "javascript";
        const defaultCode = currentQuestion.starterCode?.[defaultLang] || "// Write your code here\n";
        setCodingAnswers((prev) => ({
          ...prev,
          [qId]: {
            code: defaultCode,
            language: defaultLang,
            codeByLanguage: {
              [defaultLang]: defaultCode,
              ...(currentQuestion.starterCode || {}),
            },
            testResults: null,
            passedCount: 0,
            totalCount: currentQuestion.testCases?.length || 0,
          },
        }));
      }
      // Reset execution output on question change
      setExecutionOutput(null);
    }
  }, [currentIndex, currentQuestion]);

  const handleAutoSubmit = () => {
    if (!submitLockRef.current) {
      console.log("Timer expired (00:00). Auto-submitting assessment...");
      executeSubmission();
    }
  };

  const handleAnswerSelect = (option) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion._id]: option,
    }));
  };

  const handleCodeChange = (newCode) => {
    if (!currentQuestion) return;
    const qId = currentQuestion._id;
    const currentLang = codingAnswers[qId]?.language || "javascript";
    setCodingAnswers((prev) => {
      const existing = prev[qId] || {};
      const updatedCodeByLang = {
        ...(existing.codeByLanguage || {}),
        [currentLang]: newCode,
      };
      return {
        ...prev,
        [qId]: {
          ...existing,
          code: newCode,
          codeByLanguage: updatedCodeByLang,
        },
      };
    });
  };

  const handleLanguageChange = (newLang) => {
    if (!currentQuestion) return;
    const qId = currentQuestion._id;
    const existing = codingAnswers[qId] || {};
    const codeByLang = existing.codeByLanguage || {};
    const starterForNewLang = currentQuestion.starterCode?.[newLang] || "// Write code here\n";
    const targetCode = codeByLang[newLang] || starterForNewLang;

    setCodingAnswers((prev) => ({
      ...prev,
      [qId]: {
        ...existing,
        language: newLang,
        code: targetCode,
      },
    }));
  };

  // Run code against custom or first sample test case
  const handleRunCode = async () => {
    if (!currentQuestion) return;
    try {
      setIsRunningCode(true);
      setExecutionOutput(null);
      const qId = currentQuestion._id;
      const lang = codingAnswers[qId]?.language || "javascript";
      const code = codingAnswers[qId]?.code || "";

      const res = await runCode({
        questionId: qId,
        code,
        language: lang,
        customInput: customInput.trim() || undefined,
      });

      console.log("[RUN CODE RESPONSE]:", res);
      setExecutionOutput(res);
      setConsoleTab(customInput.trim() ? "output" : "tests");
    } catch (err) {
      console.error("RUN CODE ERROR:", err);
      setExecutionOutput({
        status: "error",
        error: err.response?.data?.message || err.message || "Execution error",
      });
      setConsoleTab("output");
    } finally {
      setIsRunningCode(false);
    }
  };

  // Submit code to evaluate against all test cases
  const handleSubmitCode = async () => {
    if (!currentQuestion) return;
    try {
      setIsTestingCode(true);
      const qId = currentQuestion._id;
      const lang = codingAnswers[qId]?.language || "javascript";
      const code = codingAnswers[qId]?.code || "";

      const res = await submitCode({
        quizId,
        questionId: qId,
        code,
        language: lang,
      });

      console.log("[SUBMIT CODE RESPONSE]:", res);
      setCodingAnswers((prev) => ({
        ...prev,
        [qId]: {
          ...(prev[qId] || {}),
          testResults: res.testResults || [],
          passedCount: res.passedCount || 0,
          totalCount: res.totalCount || 0,
          score: res.score || 0,
        },
      }));

      setExecutionOutput(res);
      setConsoleTab("tests");
    } catch (err) {
      console.error("SUBMIT CODE ERROR:", err);
      setExecutionOutput({
        status: "error",
        error: err.response?.data?.message || err.message || "Failed to test code against test cases",
      });
      setConsoleTab("output");
    } finally {
      setIsTestingCode(false);
    }
  };

  const executeSubmission = async (options = {}) => {
    submitLockRef.current = true;
    setIsSubmitting(true);
    setError("");

    const currentAnswers = answersRef.current || answers;
    const currentCoding = codingAnswersRef.current || codingAnswers;
    const currentEvents = options.customEvents || monitoringEventsRef.current || monitoringEvents;
    const currentTabSwitches = options.customTabSwitches !== undefined ? options.customTabSwitches : (tabSwitchesRef.current || tabSwitches);

    // Prepare formatted coding answers array
    const formattedCodingAnswers = Object.entries(currentCoding).map(([qId, data]) => ({
      questionId: qId,
      code: data.code || "",
      language: data.language || "javascript",
      testResults: data.testResults || [],
      score: data.score || 0,
    }));

    const flagCount = (currentTabSwitches > 0 ? 1 : 0) + (cameraDisconnections > 0 ? 1 : 0);
    const monitoringSummary = {
      tabSwitches: currentTabSwitches,
      focusLostCount,
      cameraDisconnections,
      integrityStatus: flagCount > 0 ? "REVIEW_REQUIRED" : "NO_ISSUES",
      integrityScore: Math.max(0, 100 - (currentTabSwitches * 20 + cameraDisconnections * 10)),
      flagCount,
    };

    const payload = {
      answers: currentAnswers,
      codingAnswers: formattedCodingAnswers,
      monitoringEvents: currentEvents,
      monitoringSummary,
    };

    console.log("[SUBMIT] Submitting final assessment payload:", payload);

    try {
      const result = await submitQuiz(quizId, payload);
      console.log("[SUBMIT SUCCESS] Result:", result);

      // Clean local storage cache
      localStorage.removeItem(`skill_specific_quiz_${quizId}`);

      // Stop camera stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      const resultId = result.resultId || result.result?._id || result._id;

      navigate(`/result/${resultId}`, {
        state: {
          result: result.result || result,
          role,
          topics,
        },
      });
    } catch (err) {
      console.error("[SUBMIT ERROR]:", err);
      setError(err.response?.data?.message || "Failed to submit assessment");
      if (!options.isAutoSubmit) {
        submitLockRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  const handleManualSubmit = () => {
    const mcqTotal = questions.filter((q) => q.questionType !== "coding").length;
    const codingTotal = questions.filter((q) => q.questionType === "coding").length;

    const mcqAnswered = Object.keys(answers).length;
    const codingAttempted = Object.values(codingAnswers).filter((c) => c.code && c.code.trim().length > 20).length;

    const totalAnswered = mcqAnswered + codingAttempted;
    const totalCount = questions.length;

    if (totalAnswered < totalCount) {
      const confirmSubmit = window.confirm(
        `You have attempted ${totalAnswered} of ${totalCount} questions (${mcqAnswered}/${mcqTotal} MCQs, ${codingAttempted}/${codingTotal} Coding). Submit now?`
      );
      if (!confirmSubmit) return;
    } else {
      const confirmSubmit = window.confirm("Are you sure you want to submit your assessment?");
      if (!confirmSubmit) return;
    }

    executeSubmission();
  };

  if (loading) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorBox}>
          <div style={styles.spinner} />
          <h2 style={{ color: "#38bdf8", marginTop: "1rem" }}>Loading Assessment...</h2>
          <p style={{ color: "#94a3b8" }}>Retrieving your skill-specific questions.</p>
        </div>
      </div>
    );
  }

  if (!quizId || !questions || questions.length === 0) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorBox}>
          <h2>No Active Assessment Session</h2>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
            Please select your target job role and start an assessment from the setup page.
          </p>
          <button onClick={() => navigate("/quiz-setup")} style={styles.actionBtnPrimary}>
            Go to Assessment Setup
          </button>
        </div>
      </div>
    );
  }

  const formattedTime = () => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const currentCodingData = currentQuestion && codingAnswers[currentQuestion._id];
  const isCodingQuestion = currentQuestion?.questionType === "coding";
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div style={styles.wrapper}>
      {/* Assessment Locked / Auto-Submit Overlay */}
      {isAssessmentLocked && (
        <div style={styles.lockedModalOverlay}>
          <div style={styles.lockedModalBox}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⚠️</div>
            <h2 style={{ color: "#ef4444", margin: "0 0 0.5rem 0", fontSize: "1.5rem" }}>
              Assessment Locked
            </h2>
            <p style={{ color: "#f8fafc", fontSize: "1.05rem", lineHeight: "1.5", margin: "0 0 1.5rem 0" }}>
              {lockedReason || "Assessment automatically submitted because a tab switch was detected."}
            </p>
            <div style={styles.spinner} />
            <p style={{ color: "#94a3b8", fontSize: "0.85rem", marginTop: "1rem" }}>
              Recording integrity logs and submitting assessment...
            </p>
          </div>
        </div>
      )}

      {/* Top Header */}
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h2 style={styles.roleTitle}>{role} Assessment</h2>
          <span style={styles.questionsBadge}>
            Question {currentIndex + 1} of {questions.length} • {isCodingQuestion ? "💻 Coding Challenge" : "📝 Multiple Choice"}
          </span>
        </div>

        <div style={styles.headerCenter}>
          <div style={styles.progressContainer}>
            <div style={{ ...styles.progressBar, width: `${progressPercent}%` }} />
          </div>
          <span style={styles.progressText}>{progressPercent}% Completed</span>
        </div>

        <div style={styles.headerRight}>
          <div style={{ ...styles.timerBox, ...(timeLeft < 180 ? styles.timerWarning : {}) }}>
            <span style={styles.timerLabel}>Time Remaining</span>
            <span style={styles.timerClock}>{formattedTime()}</span>
          </div>
        </div>
      </header>

      {/* Proctoring Banner (if tab switches detected) */}
      {tabSwitches > 0 && (
        <div style={styles.proctorAlert}>
          ⚠️ Proctoring Notice: <strong>{tabSwitches} tab switch(es)</strong> recorded. Assessment integrity is logged.
        </div>
      )}

      {/* Main Content Layout */}
      <main style={styles.mainLayout}>
        {/* Left / Center: Question Panel */}
        <section style={styles.questionPanel}>
          {/* Question Metadata */}
          <div style={styles.metaRow}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span style={styles.topicBadge}>Topic: {currentQuestion?.topic || "Skill"}</span>
              <span
                style={{
                  ...styles.difficultyBadge,
                  ...styles[`diff_${currentQuestion?.difficulty?.toLowerCase() || "medium"}`],
                }}
              >
                {(currentQuestion?.difficulty || "medium").toUpperCase()}
              </span>
            </div>
            {isCodingQuestion && (
              <span style={styles.codingBadge}>
                {currentQuestion.points || 20} Points
              </span>
            )}
          </div>

          {!isCodingQuestion && (
            <h3 style={styles.questionText}>{currentQuestion?.questionText}</h3>
          )}

          {/* MCQ Question View */}
          {!isCodingQuestion && (
            <div style={styles.optionsList}>
              {currentQuestion?.options?.map((option, idx) => {
                const isSelected = answers[currentQuestion._id] === option;
                const optionLetter = String.fromCharCode(65 + idx);

                return (
                  <div
                    key={idx}
                    onClick={() => handleAnswerSelect(option)}
                    style={{
                      ...styles.optionCard,
                      ...(isSelected ? styles.optionCardSelected : {}),
                    }}
                  >
                    <div
                      style={{
                        ...styles.radioCircle,
                        ...(isSelected ? styles.radioCircleSelected : {}),
                      }}
                    >
                      {optionLetter}
                    </div>
                    <span style={styles.optionText}>{option}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Coding Question View */}
          {isCodingQuestion && (
            <div style={styles.codingWorkspace}>
              {/* Problem Title & Detailed Problem Statement */}
              <div style={styles.problemHeaderBox}>
                <h3 style={styles.codingTitle}>
                  {currentQuestion.title || `${currentQuestion.topic || "Coding"} Challenge`}
                </h3>

                {(currentQuestion.problemStatement || currentQuestion.questionText) && (
                  <div style={styles.problemStatementContainer}>
                    <p style={styles.problemStatementText}>
                      {currentQuestion.problemStatement || currentQuestion.questionText}
                    </p>
                  </div>
                )}

                {currentQuestion.inputDescription && (
                  <div style={styles.specBox}>
                    <strong style={{ color: "#38bdf8" }}>Input Format: </strong>
                    <span>{currentQuestion.inputDescription}</span>
                  </div>
                )}

                {currentQuestion.outputDescription && (
                  <div style={styles.specBox}>
                    <strong style={{ color: "#38bdf8" }}>Output Format: </strong>
                    <span>{currentQuestion.outputDescription}</span>
                  </div>
                )}
              </div>

              {/* Problem Constraints */}
              {currentQuestion.constraints && (
                <div style={styles.constraintsBox}>
                  <strong>Constraints:</strong> {currentQuestion.constraints}
                </div>
              )}

              {/* Problem Examples */}
              {currentQuestion.examples && currentQuestion.examples.length > 0 && (
                <div style={styles.sampleCasesBox}>
                  <strong style={{ color: "#38bdf8", fontSize: "0.85rem", textTransform: "uppercase" }}>
                    Examples:
                  </strong>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {currentQuestion.examples.map((ex, idx) => (
                      <div key={idx} style={styles.sampleCaseCard}>
                        <div><span style={styles.sampleLabel}>Input:</span> <code>{ex.input}</code></div>
                        <div><span style={styles.sampleLabel}>Output:</span> <code>{ex.output}</code></div>
                        {ex.explanation && (
                          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>
                            <em>Explanation: {ex.explanation}</em>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Test Cases Preview */}
              {currentQuestion.testCases && currentQuestion.testCases.length > 0 && (
                <div style={styles.sampleCasesBox}>
                  <strong style={{ color: "#38bdf8", fontSize: "0.85rem", textTransform: "uppercase" }}>
                    Sample Test Cases:
                  </strong>
                  <div style={styles.sampleCasesGrid}>
                    {currentQuestion.testCases.slice(0, 2).map((tc, idx) => (
                      <div key={idx} style={styles.sampleCaseCard}>
                        <div><span style={styles.sampleLabel}>Input:</span> <code>{tc.input || "None"}</code></div>
                        <div><span style={styles.sampleLabel}>Expected:</span> <code>{tc.expectedOutput}</code></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Language Toolbar */}
              <div style={styles.editorToolbar}>
                <div style={styles.langSelector}>
                  <label style={styles.toolbarLabel}>Language:</label>
                  <select
                    value={currentCodingData?.language || "javascript"}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    style={styles.langSelect}
                  >
                    {(currentQuestion.allowedLanguages || ["javascript", "python", "java", "cpp", "c"]).map((lang) => (
                      <option key={lang} value={lang}>
                        {lang === "javascript" ? "JavaScript (Node.js)" : lang === "python" ? "Python 3" : lang.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.editorActionBtns}>
                  <button
                    onClick={handleRunCode}
                    disabled={isRunningCode || isTestingCode}
                    style={styles.runBtn}
                  >
                    {isRunningCode ? "Running..." : "▶ Run Code"}
                  </button>
                  <button
                    onClick={handleSubmitCode}
                    disabled={isRunningCode || isTestingCode}
                    style={styles.testBtn}
                  >
                    {isTestingCode ? "Testing..." : "⚡ Test All Cases"}
                  </button>
                </div>
              </div>

              {/* Code Editor Area */}
              <div style={styles.codeEditorContainer}>
                <textarea
                  value={currentCodingData?.code || ""}
                  onChange={(e) => handleCodeChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Tab") {
                      e.preventDefault();
                      const target = e.target;
                      const start = target.selectionStart;
                      const end = target.selectionEnd;
                      const val = target.value;
                      target.value = val.substring(0, start) + "  " + val.substring(end);
                      target.selectionStart = target.selectionEnd = start + 2;
                      handleCodeChange(target.value);
                    }
                  }}
                  style={styles.codeTextarea}
                  spellCheck="false"
                  placeholder="// Write your solution here..."
                />
              </div>

              {/* Execution / Test Results Output Console */}
              <div style={styles.consoleBox}>
                <div style={styles.consoleHeader}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => setConsoleTab("tests")}
                      style={{
                        ...styles.consoleTabBtn,
                        ...(consoleTab === "tests" ? styles.consoleTabBtnActive : {}),
                      }}
                    >
                      ⚡ Test Cases {executionOutput?.passedCount !== undefined ? `(${executionOutput.passedCount}/${executionOutput.totalCount})` : ""}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsoleTab("output")}
                      style={{
                        ...styles.consoleTabBtn,
                        ...(consoleTab === "output" ? styles.consoleTabBtnActive : {}),
                      }}
                    >
                      📄 Stdout / Logs
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsoleTab("input")}
                      style={{
                        ...styles.consoleTabBtn,
                        ...(consoleTab === "input" ? styles.consoleTabBtnActive : {}),
                      }}
                    >
                      ⌨️ Custom Input
                    </button>
                  </div>

                  {executionOutput?.status && (
                    <span
                      style={{
                        ...styles.consoleStatus,
                        backgroundColor:
                          executionOutput.status === "passed" || executionOutput.passedCount === executionOutput.totalCount
                            ? "rgba(34, 197, 94, 0.2)"
                            : "rgba(239, 68, 68, 0.2)",
                        color:
                          executionOutput.status === "passed" || executionOutput.passedCount === executionOutput.totalCount
                            ? "#4ade80"
                            : "#fca5a5",
                      }}
                    >
                      {executionOutput.passedCount !== undefined
                        ? `${executionOutput.passedCount}/${executionOutput.totalCount} Passed`
                        : executionOutput.status.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Tab 1: Custom Input */}
                {consoleTab === "input" && (
                  <div style={{ padding: "0.75rem 1rem" }}>
                    <label style={{ display: "block", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.4rem" }}>
                      Standard Input (stdin) passed to your program:
                    </label>
                    <textarea
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="Enter custom inputs here (e.g. numbers, arrays, strings)..."
                      style={styles.customInputTextarea}
                    />
                  </div>
                )}

                {/* Tab 2: Stdout / Errors */}
                {consoleTab === "output" && (
                  <div style={{ padding: "0.75rem 1rem" }}>
                    {executionOutput?.output ? (
                      <pre style={styles.consolePre}>
                        <code>{executionOutput.output}</code>
                      </pre>
                    ) : executionOutput?.error ? (
                      <pre style={{ ...styles.consolePre, color: "#f87171" }}>
                        <code>{executionOutput.error}</code>
                      </pre>
                    ) : (
                      <p style={{ color: "#64748b", fontSize: "0.85rem", fontStyle: "italic", margin: "0.5rem 0" }}>
                        Click "▶ Run Code" or "⚡ Test All Cases" to view execution logs and standard output.
                      </p>
                    )}
                  </div>
                )}

                {/* Tab 3: Test Cases */}
                {consoleTab === "tests" && (
                  <div style={{ padding: "0.75rem 1rem" }}>
                    {executionOutput?.testResults && executionOutput.testResults.length > 0 ? (
                      <div style={styles.testCasesList}>
                        {executionOutput.testResults.map((tc, idx) => (
                          <div
                            key={idx}
                            style={{
                              ...styles.testCaseItem,
                              borderColor: tc.passed ? "#22c55e" : "#ef4444",
                            }}
                          >
                            <div style={styles.tcHeader}>
                              <span>Test Case #{idx + 1} {tc.isHidden ? "(Hidden)" : ""}</span>
                              <span style={{ color: tc.passed ? "#4ade80" : "#f87171", fontWeight: "700" }}>
                                {tc.passed ? "✓ Passed" : "✗ Failed"}
                              </span>
                            </div>
                            <div style={styles.tcDetails}>
                              <div><span style={styles.tcDim}>Input:</span> <code>{tc.input || "None"}</code></div>
                              <div><span style={styles.tcDim}>Expected:</span> <code>{tc.expectedOutput}</code></div>
                              <div>
                                <span style={styles.tcDim}>Output:</span>{" "}
                                <span style={{ color: tc.passed ? "#4ade80" : "#f87171" }}>
                                  <code>{tc.actualOutput || (tc.error ? `Error: ${tc.error}` : "None")}</code>
                                </span>
                              </div>
                              {tc.executionTime !== undefined && (
                                <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "2px" }}>
                                  Execution Time: {tc.executionTime}ms
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={styles.sampleCasesGrid}>
                        {(currentQuestion.testCases || []).slice(0, 3).map((tc, idx) => (
                          <div key={idx} style={styles.sampleCaseCard}>
                            <div style={{ color: "#38bdf8", fontWeight: "600", marginBottom: "4px" }}>
                              Case #{idx + 1}
                            </div>
                            <div><span style={styles.sampleLabel}>Input:</span> <code>{tc.input || "None"}</code></div>
                            <div><span style={styles.sampleLabel}>Expected:</span> <code>{tc.expectedOutput}</code></div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {error && <p style={styles.errorMessage}>⚠️ {error}</p>}

          {/* Bottom Action Row */}
          <div style={styles.actionRow}>
            <button
              onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
              disabled={currentIndex === 0 || isSubmitting}
              style={{
                ...styles.navBtn,
                ...(currentIndex === 0 ? styles.navBtnDisabled : {}),
              }}
            >
              ← Previous
            </button>

            <div style={styles.actionRight}>
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(currentIndex + 1)}
                  disabled={isSubmitting}
                  style={styles.navBtnPrimary}
                >
                  Next Question →
                </button>
              ) : null}

              <button
                onClick={handleManualSubmit}
                disabled={isSubmitting}
                style={styles.submitBtn}
              >
                {isSubmitting ? "Submitting..." : "Submit Assessment"}
              </button>
            </div>
          </div>
        </section>

        {/* Right: Proctoring & Question Navigation Sidebar */}
        <aside style={styles.navSidebar}>
          {/* Webcam Monitoring Feed */}
          {monitoringEnabled && (
            <div style={styles.proctorFeedBox}>
              <div style={styles.proctorFeedHeader}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: cameraActive ? "#22c55e" : "#eab308",
                    }}
                  />
                  <strong style={{ fontSize: "0.8rem", color: "#f8fafc" }}>Proctoring Active</strong>
                </span>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>Webcam Live</span>
              </div>

              <div style={styles.videoWrapper}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={styles.videoElement}
                />
                {!cameraActive && (
                  <div style={styles.videoPlaceholder}>
                    <span>📷 Stream Initializing...</span>
                  </div>
                )}
              </div>

              {cameraWarning && (
                <p style={styles.cameraWarningText}>{cameraWarning}</p>
              )}
            </div>
          )}

          {/* Questions Grid Overview */}
          <div style={styles.sidebarHeader}>
            <h4 style={styles.sidebarTitle}>Assessment Navigator</h4>
            <span style={styles.sidebarSub}>
              {Object.keys(answers).length +
                Object.values(codingAnswers).filter((c) => c.code && c.code.trim().length > 20).length}{" "}
              of {questions.length} Attempted
            </span>
          </div>

          <div style={styles.gridContainer}>
            {questions.map((q, idx) => {
              const isCoding = q.questionType === "coding";
              const isAnswered = isCoding
                ? Boolean(codingAnswers[q._id]?.code && codingAnswers[q._id]?.code.trim().length > 20)
                : Boolean(answers[q._id]);
              const isCurrent = idx === currentIndex;

              let itemStyle = { ...styles.gridItem };
              if (isAnswered) itemStyle = { ...itemStyle, ...styles.gridAnswered };
              if (isCurrent) itemStyle = { ...itemStyle, ...styles.gridCurrent };

              return (
                <button
                  key={q._id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  style={itemStyle}
                  title={`Question ${idx + 1} (${isCoding ? "Coding" : "MCQ"})`}
                >
                  {isCoding ? `💻${idx + 1}` : idx + 1}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div style={styles.legend}>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, ...styles.gridCurrent }} />
              <span>Current Question</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, ...styles.gridAnswered }} />
              <span>Answered / Saved</span>
            </div>
            <div style={styles.legendItem}>
              <span style={{ ...styles.legendDot, ...styles.gridItem }} />
              <span>Unanswered</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    backgroundColor: "#090d16",
    color: "#f1f5f9",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    height: "72px",
    backgroundColor: "#0f172a",
    borderBottom: "1px solid #1e293b",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 2rem",
    gap: "1.5rem",
  },
  headerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  roleTitle: {
    margin: 0,
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "#f8fafc",
  },
  questionsBadge: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  headerCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    flex: 1,
    maxWidth: "360px",
  },
  progressContainer: {
    width: "100%",
    height: "6px",
    backgroundColor: "#1e293b",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#38bdf8",
    transition: "width 0.3s ease",
  },
  progressText: {
    fontSize: "0.75rem",
    color: "#94a3b8",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
  },
  timerBox: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    padding: "0.45rem 1rem",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  timerWarning: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderColor: "#ef4444",
  },
  timerLabel: {
    fontSize: "0.65rem",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  timerClock: {
    fontSize: "1.15rem",
    fontWeight: "800",
    color: "#f8fafc",
    fontFamily: "monospace",
  },
  proctorAlert: {
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    borderBottom: "1px solid #eab308",
    padding: "0.5rem 2rem",
    color: "#fef08a",
    fontSize: "0.85rem",
    textAlign: "center",
  },
  mainLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 340px",
    gap: "1.5rem",
    padding: "1.5rem 2rem",
    flex: 1,
    alignItems: "start",
  },
  questionPanel: {
    backgroundColor: "#0f172a",
    borderRadius: "14px",
    border: "1px solid #1e293b",
    padding: "2rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topicBadge: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    color: "#38bdf8",
    padding: "0.3rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "700",
  },
  difficultyBadge: {
    padding: "0.3rem 0.65rem",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "800",
  },
  diff_easy: {
    backgroundColor: "rgba(34, 197, 94, 0.15)",
    color: "#4ade80",
  },
  diff_medium: {
    backgroundColor: "rgba(234, 179, 8, 0.15)",
    color: "#facc15",
  },
  diff_hard: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    color: "#f87171",
  },
  codingBadge: {
    backgroundColor: "rgba(129, 140, 248, 0.15)",
    color: "#818cf8",
    padding: "0.3rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.8rem",
    fontWeight: "700",
  },
  questionText: {
    fontSize: "1.2rem",
    fontWeight: "600",
    lineHeight: "1.5",
    color: "#f8fafc",
    margin: 0,
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  optionCard: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem 1.25rem",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  optionCardSelected: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderColor: "#38bdf8",
  },
  radioCircle: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    backgroundColor: "#0f172a",
    border: "1px solid #475569",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "700",
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  radioCircleSelected: {
    backgroundColor: "#0284c7",
    borderColor: "#38bdf8",
    color: "#ffffff",
  },
  optionText: {
    fontSize: "1rem",
    color: "#f1f5f9",
    lineHeight: "1.4",
  },
  codingWorkspace: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  problemHeaderBox: {
    backgroundColor: "#090d16",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.85rem",
  },
  codingTitle: {
    fontSize: "1.3rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0,
    lineHeight: "1.3",
  },
  problemStatementContainer: {
    backgroundColor: "#0f172a",
    padding: "1rem",
    borderRadius: "8px",
    border: "1px solid #1e293b",
  },
  problemStatementText: {
    fontSize: "0.95rem",
    color: "#e2e8f0",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    margin: 0,
  },
  specBox: {
    fontSize: "0.88rem",
    color: "#cbd5e1",
    lineHeight: "1.5",
    backgroundColor: "#0f172a",
    padding: "0.6rem 0.85rem",
    borderRadius: "6px",
    border: "1px solid #1e293b",
  },
  constraintsBox: {
    backgroundColor: "#090d16",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    fontSize: "0.85rem",
    color: "#94a3b8",
  },
  sampleCasesBox: {
    backgroundColor: "#090d16",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "0.75rem 1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  sampleCasesGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "0.75rem",
  },
  sampleCaseCard: {
    backgroundColor: "#0f172a",
    padding: "0.5rem 0.75rem",
    borderRadius: "6px",
    border: "1px solid #1e293b",
    fontSize: "0.8rem",
    color: "#cbd5e1",
  },
  sampleLabel: {
    color: "#64748b",
    marginRight: "4px",
  },
  editorToolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#090d16",
    border: "1px solid #1e293b",
    borderRadius: "8px 8px 0 0",
    padding: "0.6rem 1rem",
  },
  langSelector: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  toolbarLabel: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  langSelect: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.35rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    outline: "none",
  },
  editorActionBtns: {
    display: "flex",
    gap: "0.6rem",
  },
  runBtn: {
    backgroundColor: "#1e293b",
    border: "1px solid #38bdf8",
    color: "#38bdf8",
    padding: "0.4rem 0.85rem",
    borderRadius: "6px",
    fontWeight: "700",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  testBtn: {
    backgroundColor: "#0284c7",
    border: "none",
    color: "#ffffff",
    padding: "0.4rem 0.85rem",
    borderRadius: "6px",
    fontWeight: "700",
    fontSize: "0.8rem",
    cursor: "pointer",
  },
  codeEditorContainer: {
    backgroundColor: "#090d16",
    border: "1px solid #1e293b",
    borderTop: "none",
    borderRadius: "0 0 8px 8px",
    overflow: "hidden",
  },
  codeTextarea: {
    width: "100%",
    minHeight: "260px",
    backgroundColor: "#060911",
    color: "#38bdf8",
    border: "none",
    padding: "1rem",
    fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace",
    fontSize: "0.95rem",
    lineHeight: "1.5",
    outline: "none",
    resize: "vertical",
    boxSizing: "border-box",
  },
  consoleBox: {
    backgroundColor: "#090d16",
    border: "1px solid #1e293b",
    borderRadius: "8px",
    padding: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  consoleHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #1e293b",
    paddingBottom: "0.5rem",
  },
  consoleTabBtn: {
    backgroundColor: "transparent",
    border: "1px solid #1e293b",
    color: "#94a3b8",
    padding: "0.35rem 0.75rem",
    borderRadius: "6px",
    fontSize: "0.78rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },
  consoleTabBtnActive: {
    backgroundColor: "#0284c7",
    borderColor: "#38bdf8",
    color: "#ffffff",
  },
  customInputTextarea: {
    width: "100%",
    minHeight: "75px",
    backgroundColor: "#060911",
    color: "#f8fafc",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    padding: "0.5rem 0.75rem",
    fontFamily: "monospace",
    fontSize: "0.85rem",
    outline: "none",
    boxSizing: "border-box",
  },
  consoleStatus: {
    padding: "0.2rem 0.5rem",
    borderRadius: "4px",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  consolePre: {
    backgroundColor: "#060911",
    padding: "0.75rem",
    borderRadius: "6px",
    margin: 0,
    fontSize: "0.85rem",
    color: "#e2e8f0",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    fontFamily: "monospace",
  },
  testCasesList: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  testCaseItem: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: "6px",
    padding: "0.6rem 0.85rem",
  },
  tcHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    fontWeight: "700",
    marginBottom: "0.25rem",
  },
  tcDetails: {
    fontSize: "0.78rem",
    color: "#94a3b8",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  tcDim: {
    color: "#64748b",
  },
  errorMessage: {
    color: "#f87171",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: "0.75rem",
    borderRadius: "8px",
    margin: 0,
    fontSize: "0.9rem",
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderTop: "1px solid #1e293b",
    paddingTop: "1.25rem",
  },
  actionRight: {
    display: "flex",
    gap: "0.75rem",
  },
  navBtn: {
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    color: "#f8fafc",
    padding: "0.75rem 1.25rem",
    borderRadius: "8px",
    fontWeight: "600",
    cursor: "pointer",
  },
  navBtnDisabled: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  navBtnPrimary: {
    backgroundColor: "#0284c7",
    border: "none",
    color: "#ffffff",
    padding: "0.75rem 1.25rem",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  },
  submitBtn: {
    backgroundColor: "#22c55e",
    border: "none",
    color: "#ffffff",
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    fontWeight: "800",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.25)",
  },
  navSidebar: {
    backgroundColor: "#0f172a",
    borderRadius: "14px",
    border: "1px solid #1e293b",
    padding: "1.25rem",
    display: "flex",
    flexDirection: "column",
    gap: "1.25rem",
  },
  proctorFeedBox: {
    backgroundColor: "#090d16",
    border: "1px solid #1e293b",
    borderRadius: "10px",
    padding: "0.75rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  proctorFeedHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  videoWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: "4/3",
    backgroundColor: "#000",
    borderRadius: "6px",
    overflow: "hidden",
  },
  videoElement: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  videoPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: "0.8rem",
  },
  cameraWarningText: {
    fontSize: "0.72rem",
    color: "#facc15",
    margin: 0,
  },
  sidebarHeader: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  sidebarTitle: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#f8fafc",
    margin: 0,
  },
  sidebarSub: {
    fontSize: "0.78rem",
    color: "#94a3b8",
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "0.5rem",
  },
  gridItem: {
    aspectRatio: "1",
    borderRadius: "6px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "#94a3b8",
    fontWeight: "700",
    fontSize: "0.8rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  gridAnswered: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderColor: "#22c55e",
    color: "#4ade80",
  },
  gridCurrent: {
    borderColor: "#38bdf8",
    boxShadow: "0 0 0 2px #38bdf8",
    color: "#ffffff",
  },
  legend: {
    display: "flex",
    flexDirection: "column",
    gap: "0.4rem",
    paddingTop: "0.75rem",
    borderTop: "1px solid #1e293b",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.75rem",
    color: "#94a3b8",
  },
  legendDot: {
    width: "12px",
    height: "12px",
    borderRadius: "3px",
  },
  errorContainer: {
    minHeight: "100vh",
    backgroundColor: "#090d16",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem",
  },
  errorBox: {
    backgroundColor: "#0f172a",
    border: "1px solid #1e293b",
    padding: "2.5rem",
    borderRadius: "16px",
    textAlign: "center",
    maxWidth: "480px",
  },
  actionBtnPrimary: {
    padding: "0.85rem 1.5rem",
    backgroundColor: "#0284c7",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
  },
  spinner: {
    width: "36px",
    height: "36px",
    border: "3px solid #1e293b",
    borderTopColor: "#38bdf8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  lockedModalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(9, 13, 22, 0.94)",
    backdropFilter: "blur(8px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
  },
  lockedModalBox: {
    backgroundColor: "#0f172a",
    border: "2px solid #ef4444",
    borderRadius: "16px",
    padding: "2.5rem 2rem",
    maxWidth: "480px",
    width: "100%",
    textAlign: "center",
    boxShadow: "0 25px 50px -12px rgba(239, 68, 68, 0.25)",
  },
};

export default Quiz;