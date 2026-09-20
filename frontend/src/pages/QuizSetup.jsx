import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { startQuiz, getRolesConfig, getCustomRoleTopics } from "../services/quizService";

const ALL_ROLES = [
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Cloud Engineer",
  "Data Analyst",
  "Data Scientist",
  "Machine Learning Engineer",
  "AI Engineer",
  "QA Engineer",
  "Automation Test Engineer",
  "Cybersecurity Engineer",
  "Software Engineer",
  "Mobile App Developer",
  "Android Developer",
  "iOS Developer",
  "Database Administrator",
  "Site Reliability Engineer",
  "Network Engineer",
  "System Administrator",
  "UI/UX Developer",
  "Product Manager",
  "Other / Custom Role",
];

function QuizSetup() {
  const navigate = useNavigate();

  const [roleSkillsMap, setRoleSkillsMap] = useState({});
  const [selectedRole, setSelectedRole] = useState("Backend Developer");
  const [customRoleInput, setCustomRoleInput] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [customTopics, setCustomTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Webcam Modal & Status States (Mandatory)
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraStatus, setCameraStatus] = useState("idle"); // "idle" | "requesting" | "ready" | "denied" | "error"
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const config = await getRolesConfig();
        if (config && config.roleSkillsMap) {
          setRoleSkillsMap(config.roleSkillsMap);
        }
      } catch (err) {
        console.log("Using default fallback role skills");
      }
    };
    fetchConfig();
  }, []);

  // Update selected topics whenever selected role changes
  useEffect(() => {
    if (selectedRole === "Other / Custom Role") {
      if (customRoleInput.trim()) {
        loadCustomTopics(customRoleInput.trim());
      } else {
        setSelectedTopics([
          "Core Architecture",
          "Tools & Frameworks",
          "Performance Optimization",
          "Security & Best Practices",
          "Testing & Troubleshooting",
        ]);
      }
    } else if (roleSkillsMap[selectedRole]) {
      const available = roleSkillsMap[selectedRole];
      setSelectedTopics(available.slice(0, 5));
    }
  }, [selectedRole, roleSkillsMap]);

  const loadCustomTopics = async (customRole) => {
    try {
      const res = await getCustomRoleTopics(customRole);
      if (res && Array.isArray(res.topics) && res.topics.length > 0) {
        setCustomTopics(res.topics);
        setSelectedTopics(res.topics.slice(0, 5));
      }
    } catch (e) {
      console.error("Error loading custom topics:", e);
    }
  };

  const handleCustomRoleChange = (e) => {
    const val = e.target.value;
    setCustomRoleInput(val);
    if (val.trim().length > 1) {
      loadCustomTopics(val.trim());
    }
  };

  const handleTopicToggle = (topic) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length === 1) {
        setError("At least one topic must be selected.");
        return;
      }
      setError("");
      setSelectedTopics(selectedTopics.filter((t) => t !== topic));
    } else {
      setError("");
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSelectAllTopics = () => {
    const available =
      selectedRole === "Other / Custom Role"
        ? customTopics.length > 0
          ? customTopics
          : selectedTopics
        : roleSkillsMap[selectedRole] || [];
    setSelectedTopics(available);
  };

  // Step 1: Validate Form & Open Mandatory Camera Verification
  const handleProceedClick = (e) => {
    e.preventDefault();
    setError("");

    if (selectedRole === "Other / Custom Role" && !customRoleInput.trim()) {
      setError("Please enter your custom target role (e.g. Cloud Developer, Blockchain Developer, DevSecOps Engineer)");
      return;
    }

    if (!selectedTopics || selectedTopics.length === 0) {
      setError("Please select at least one assessment topic");
      return;
    }

    setShowCameraModal(true);
    setCameraStatus("idle");
    setCameraError("");
  };

  // Step 2: Request & Start Camera
  const handleStartCamera = async () => {
    setCameraStatus("requesting");
    setCameraError("");

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus("error");
        setCameraError("Webcam access is not supported on this browser. Please use Chrome, Edge, or Firefox.");
        return;
      }

      // Stop previous tracks if any
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 480 },
          height: { ideal: 360 },
          facingMode: "user",
        },
        audio: false,
      });

      mediaStreamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn("Video play error:", playErr);
        }
      }

      setCameraStatus("ready");
    } catch (err) {
      console.error("Camera permission error:", err);
      setCameraStatus("denied");
      setCameraError(
        "Camera access is required to attend this assessment. Please allow camera permission in your browser and try again."
      );
    }
  };

  // Clean up camera on unmount or cancel
  const handleCloseCameraModal = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setShowCameraModal(false);
    setCameraStatus("idle");
    setCameraError("");
  };

  // Step 3: Begin Assessment with Camera Verified
  const handleBeginAssessment = async () => {
    if (cameraStatus !== "ready") {
      setCameraError("Please start and verify your camera before beginning.");
      return;
    }

    setError("");
    setLoading(true);

    const effectiveRole =
      selectedRole === "Other / Custom Role" ? customRoleInput.trim() : selectedRole;

    try {
      const payload = {
        role: effectiveRole,
        customRole: selectedRole === "Other / Custom Role" ? effectiveRole : "",
        isCustomRole: selectedRole === "Other / Custom Role",
        topics: selectedTopics,
        numberOfQuestions: 20,
        monitoringEnabled: true,
        includeCoding: true,
      };

      const data = await startQuiz(payload);
      console.log("Assessment started successfully:", data);

      // Stop preview stream before navigating so Quiz page can claim the stream
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }

      navigate("/quiz", {
        state: {
          quizId: data.quizId,
          questions: data.questions,
          role: data.role || effectiveRole,
          isCustomRole: data.isCustomRole,
          topics: data.topics,
          duration: data.duration || 1200,
          startTime: data.startTime,
          monitoringEnabled: true,
        },
      });
    } catch (err) {
      console.error("ASSESSMENT GENERATION ERROR:", err);
      setError(
        err.response?.data?.message ||
          "Unable to generate assessment at this moment. Please try again."
      );
      setShowCameraModal(false);
    } finally {
      setLoading(false);
    }
  };

  const currentRoleSkills =
    selectedRole === "Other / Custom Role"
      ? customTopics.length > 0
        ? customTopics
        : selectedTopics
      : roleSkillsMap[selectedRole] || [];

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.badge}>SKILL SPECIFIC TECHNICAL ASSESSMENT</div>
          <h1 style={styles.title}>Assessment Setup</h1>
          <p style={styles.subtitle}>
            Select your target Job Role, customize domain topics, and complete the mandatory webcam check to begin your 20-minute technical evaluation.
          </p>
        </div>

        {error && <div style={styles.errorBanner}>⚠️ {error}</div>}

        <form onSubmit={handleProceedClick}>
          {/* Job Role Selection */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Select Target Job Role *</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={styles.select}
            >
              {ALL_ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Role Input */}
          {selectedRole === "Other / Custom Role" && (
            <div style={styles.customRoleBox}>
              <label style={styles.label}>
                Enter your target role *{" "}
                <span style={{ color: "#94a3b8", fontWeight: "400", fontSize: "0.8rem" }}>
                  (e.g. Cloud Developer, Blockchain Developer, DevSecOps Engineer, AI Developer, Salesforce Developer)
                </span>
              </label>
              <input
                type="text"
                value={customRoleInput}
                onChange={handleCustomRoleChange}
                placeholder="e.g. Cloud Developer, Blockchain Developer, DevSecOps Engineer..."
                style={styles.customInput}
                autoFocus
                required
              />
            </div>
          )}

          {/* Skill Topics Selection */}
          {currentRoleSkills.length > 0 && (
            <div style={styles.fieldGroup}>
              <div style={styles.topicsHeader}>
                <label style={styles.label}>
                  Selected Topics ({selectedTopics.length} selected, max 5 questions per topic)
                </label>
                <button
                  type="button"
                  onClick={handleSelectAllTopics}
                  style={styles.selectAllBtn}
                >
                  Select All
                </button>
              </div>
              <div style={styles.topicsGrid}>
                {currentRoleSkills.map((skill) => {
                  const isChecked = selectedTopics.includes(skill);
                  return (
                    <label
                      key={skill}
                      style={{
                        ...styles.topicChip,
                        ...(isChecked ? styles.topicChipActive : {}),
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleTopicToggle(skill)}
                        style={styles.checkbox}
                      />
                      <span>{skill}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Webcam Monitoring Requirement Notice */}
          <div style={styles.proctorNoticeBox}>
            <div style={styles.proctorNoticeHeader}>
              <span style={{ fontSize: "1.2rem" }}>📹</span>
              <strong>Mandatory Webcam Proctoring</strong>
              <span style={styles.proctorRequiredBadge}>Required</span>
            </div>
            <p style={styles.proctorNoticeText}>
              Webcam verification is mandatory for all assessments. A camera permission check will appear in the next step before questions load.
            </p>
          </div>

          {/* Assessment Specifications */}
          <div style={styles.specBox}>
            <div style={styles.specItem}>
              <span style={styles.specIcon}>⏱️</span>
              <div>
                <strong>20 Minutes</strong>
                <p style={styles.specSub}>Auto-submits on timeout</p>
              </div>
            </div>
            <div style={styles.specItem}>
              <span style={styles.specIcon}>💻</span>
              <div>
                <strong>MCQs + Coding</strong>
                <p style={styles.specSub}>Role-specific sandbox</p>
              </div>
            </div>
            <div style={styles.specItem}>
              <span style={styles.specIcon}>🛡️</span>
              <div>
                <strong>State Saved</strong>
                <p style={styles.specSub}>Safe across reloads</p>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            Proceed to Camera Check →
          </button>
        </form>
      </div>

      {/* Mandatory Webcam Verification & Consent Modal */}
      {showCameraModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <span style={{ fontSize: "1.8rem" }}>📹</span>
              <div>
                <h2 style={styles.modalTitle}>Webcam Verification & Consent</h2>
                <span style={styles.modalSub}>Mandatory Proctoring Check</span>
              </div>
            </div>

            <p style={styles.modalText}>
              Please verify your webcam stream. Your camera will remain active during the assessment to verify test integrity (tracking tab switches and focus loss).
            </p>

            {/* Camera Video Stream Preview Box */}
            <div style={styles.videoPreviewContainer}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={styles.videoElement}
              />

              {cameraStatus === "idle" && (
                <div style={styles.videoOverlayPlaceholder}>
                  <span>📷 Click "I Agree & Start Camera" below to activate preview</span>
                </div>
              )}

              {cameraStatus === "requesting" && (
                <div style={styles.videoOverlayPlaceholder}>
                  <div style={styles.spinner} />
                  <span style={{ marginTop: "0.5rem" }}>Requesting browser camera permission...</span>
                </div>
              )}

              {cameraStatus === "ready" && (
                <div style={styles.cameraLiveBadge}>
                  <span style={styles.greenDot} /> Camera Ready & Active
                </div>
              )}
            </div>

            {/* Camera Error Message */}
            {cameraError && (
              <div style={styles.cameraErrorAlert}>
                <p style={{ margin: 0 }}>⚠️ {cameraError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div style={styles.modalActions}>
              <button
                type="button"
                onClick={handleCloseCameraModal}
                style={styles.modalCancelBtn}
                disabled={loading}
              >
                Cancel
              </button>

              {cameraStatus !== "ready" ? (
                <button
                  type="button"
                  onClick={handleStartCamera}
                  style={styles.modalStartCamBtn}
                  disabled={cameraStatus === "requesting"}
                >
                  {cameraStatus === "denied" || cameraStatus === "error"
                    ? "🔄 Try Again (Allow Camera)"
                    : "I Agree & Start Camera"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleBeginAssessment}
                  style={styles.modalBeginBtn}
                  disabled={loading}
                >
                  {loading ? "Generating Assessment..." : "Begin Assessment →"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#090d16",
    color: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "2rem 1rem",
    fontFamily: "'Inter', sans-serif",
  },
  card: {
    backgroundColor: "#0f172a",
    borderRadius: "16px",
    padding: "2.5rem",
    maxWidth: "760px",
    width: "100%",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
    border: "1px solid #1e293b",
  },
  header: {
    marginBottom: "2rem",
    textAlign: "center",
  },
  badge: {
    fontSize: "0.75rem",
    fontWeight: "800",
    color: "#38bdf8",
    letterSpacing: "0.75px",
    marginBottom: "0.5rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "800",
    background: "linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    lineHeight: "1.5",
  },
  errorBanner: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #ef4444",
    color: "#fca5a5",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
    fontSize: "0.9rem",
  },
  fieldGroup: {
    marginBottom: "1.5rem",
  },
  label: {
    display: "block",
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#cbd5e1",
    marginBottom: "0.5rem",
  },
  select: {
    width: "100%",
    padding: "0.85rem 1rem",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "1rem",
    outline: "none",
    cursor: "pointer",
  },
  customRoleBox: {
    marginBottom: "1.5rem",
    backgroundColor: "rgba(56, 189, 248, 0.06)",
    padding: "1rem",
    borderRadius: "10px",
    border: "1px dashed #38bdf8",
  },
  customInput: {
    width: "100%",
    padding: "0.85rem 1rem",
    backgroundColor: "#1e293b",
    border: "1px solid #475569",
    borderRadius: "8px",
    color: "#f8fafc",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
  },
  topicsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem",
  },
  selectAllBtn: {
    background: "none",
    border: "none",
    color: "#38bdf8",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  topicsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
    gap: "0.6rem",
  },
  topicChip: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.55rem 0.85rem",
    backgroundColor: "#1e293b",
    border: "1px solid #334155",
    borderRadius: "8px",
    fontSize: "0.82rem",
    color: "#94a3b8",
    cursor: "pointer",
    userSelect: "none",
  },
  topicChipActive: {
    backgroundColor: "rgba(56, 189, 248, 0.12)",
    borderColor: "#38bdf8",
    color: "#f8fafc",
    fontWeight: "600",
  },
  checkbox: {
    accentColor: "#38bdf8",
    cursor: "pointer",
  },
  proctorNoticeBox: {
    backgroundColor: "rgba(14, 165, 233, 0.08)",
    border: "1px solid rgba(56, 189, 248, 0.3)",
    borderRadius: "10px",
    padding: "1rem 1.25rem",
    marginBottom: "1.5rem",
  },
  proctorNoticeHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#f8fafc",
    fontSize: "0.95rem",
  },
  proctorRequiredBadge: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    color: "#f87171",
    border: "1px solid #ef4444",
    fontSize: "0.7rem",
    padding: "0.15rem 0.5rem",
    borderRadius: "6px",
    fontWeight: "800",
    textTransform: "uppercase",
    marginLeft: "auto",
  },
  proctorNoticeText: {
    margin: "6px 0 0 0",
    fontSize: "0.82rem",
    color: "#94a3b8",
    lineHeight: "1.4",
  },
  specBox: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "1rem",
    backgroundColor: "#090d16",
    border: "1px solid #1e293b",
    borderRadius: "12px",
    padding: "1.25rem",
    marginBottom: "2rem",
  },
  specItem: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  specIcon: {
    fontSize: "1.5rem",
  },
  specSub: {
    fontSize: "0.75rem",
    color: "#94a3b8",
    margin: "2px 0 0 0",
  },
  submitBtn: {
    width: "100%",
    padding: "1rem",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #0284c7 0%, #4f46e5 100%)",
    color: "#ffffff",
    fontSize: "1.05rem",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 14px 0 rgba(14, 165, 233, 0.39)",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
  },
  modalCard: {
    backgroundColor: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "2rem",
    maxWidth: "560px",
    width: "100%",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    marginBottom: "0.75rem",
  },
  modalTitle: {
    margin: 0,
    fontSize: "1.3rem",
    fontWeight: "800",
    color: "#f8fafc",
  },
  modalSub: {
    fontSize: "0.75rem",
    color: "#38bdf8",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  modalText: {
    fontSize: "0.9rem",
    color: "#cbd5e1",
    lineHeight: "1.5",
    marginBottom: "1rem",
  },
  videoPreviewContainer: {
    position: "relative",
    width: "100%",
    height: "260px",
    backgroundColor: "#090d16",
    border: "1px solid #334155",
    borderRadius: "10px",
    overflow: "hidden",
    marginBottom: "1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  videoElement: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  videoOverlayPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(9, 13, 22, 0.9)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#94a3b8",
    fontSize: "0.85rem",
    padding: "1rem",
    textAlign: "center",
  },
  cameraLiveBadge: {
    position: "absolute",
    top: "10px",
    left: "10px",
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    border: "1px solid #22c55e",
    color: "#4ade80",
    fontSize: "0.75rem",
    fontWeight: "700",
    padding: "0.25rem 0.6rem",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  greenDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
  },
  cameraErrorAlert: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    border: "1px solid #ef4444",
    color: "#fca5a5",
    padding: "0.75rem 1rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    marginBottom: "1rem",
    lineHeight: "1.4",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    marginTop: "1.25rem",
  },
  modalCancelBtn: {
    padding: "0.75rem 1.25rem",
    borderRadius: "8px",
    border: "1px solid #334155",
    backgroundColor: "#1e293b",
    color: "#cbd5e1",
    fontWeight: "600",
    cursor: "pointer",
  },
  modalStartCamBtn: {
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#0284c7",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(14, 165, 233, 0.3)",
  },
  modalBeginBtn: {
    padding: "0.75rem 1.5rem",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#22c55e",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
  },
  spinner: {
    width: "28px",
    height: "28px",
    border: "3px solid #1e293b",
    borderTopColor: "#38bdf8",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
};

export default QuizSetup;