const runCodeAgainstTestCases = require("../services/codeExecutionService").runCodeAgainstTestCases;

/**
 * Calculates assessment scores, percentages, topic performance, and difficulty breakdown.
 * 
 * Score Formula:
 * - Each MCQ question = 1 mark (correct = 1, incorrect/unanswered = 0).
 * - Each Coding question = 1 mark (passedCount / totalTestCases * 1 mark; unanswered/failed = 0).
 * - overallScore = mcqMarks + codingMarks
 * - totalPossibleMarks = totalMcqQuestions + totalCodingQuestions
 * - percentage = totalPossibleMarks > 0 ? Math.round((overallScore / totalPossibleMarks) * 100) : 0
 */
const calculateAssessmentScore = async ({ quiz, answers, answerMap }) => {
  const questions = quiz.questions || [];

  let mcqMarks = 0;
  let mcqTotalMarks = 0;
  let codingMarks = 0;
  let codingTotalMarks = 0;

  let attemptedCount = 0;
  let skippedCount = 0;

  const evaluatedAnswers = [];
  const topicStats = {};
  const diffStats = {
    easy: { correct: 0, total: 0 },
    medium: { correct: 0, total: 0 },
    hard: { correct: 0, total: 0 },
  };

  if (Array.isArray(quiz.topics) && quiz.topics.length > 0) {
    quiz.topics.forEach((top) => {
      topicStats[top] = { correct: 0, total: 0 };
    });
  }

  for (const question of questions) {
    const qId = question._id.toString();
    const userAnsObj = answerMap[qId];
    const qTopic = question.topic || "General";
    const qDiff = (question.difficulty || "medium").toLowerCase();

    if (!topicStats[qTopic]) {
      topicStats[qTopic] = { correct: 0, total: 0 };
    }
    topicStats[qTopic].total += 1;

    if (diffStats[qDiff]) {
      diffStats[qDiff].total += 1;
    }

    if (question.questionType === "coding") {
      codingTotalMarks += 1;

      const submittedCode = typeof userAnsObj === "object" && userAnsObj !== null ? (userAnsObj.code || "").trim() : "";
      const submittedLang = typeof userAnsObj === "object" && userAnsObj !== null ? userAnsObj.language || "javascript" : "javascript";

      if (submittedCode) {
        attemptedCount++;
      } else {
        skippedCount++;
      }

      let testCasesPassed = 0;
      let totalTestCases = (question.testCases || []).length;
      let execStatus = "unattempted";
      let qCodingMarks = 0;

      if (submittedCode && totalTestCases > 0) {
        const runRes = await runCodeAgainstTestCases({
          code: submittedCode,
          language: submittedLang,
          testCases: question.testCases,
          timeLimit: question.timeLimit || 3,
        });

        testCasesPassed = runRes.passedCount || 0;
        execStatus = runRes.executionStatus || "Evaluated";
        qCodingMarks = totalTestCases > 0 ? (testCasesPassed / totalTestCases) : 0;
      } else if (submittedCode && totalTestCases === 0) {
        // If code submitted but no test cases defined, default to 0 marks unless code exists & passed basic validation
        qCodingMarks = 0;
      }

      // Round individual coding question marks to 2 decimals
      qCodingMarks = Math.round(qCodingMarks * 100) / 100;
      codingMarks += qCodingMarks;

      const isCorrect = qCodingMarks >= 0.8; // Considered passed if >= 80% test cases passed

      if (isCorrect) {
        topicStats[qTopic].correct += 1;
        if (diffStats[qDiff]) diffStats[qDiff].correct += 1;
      }

      evaluatedAnswers.push({
        question: question._id,
        code: submittedCode,
        language: submittedLang,
        codingScore: Math.round(qCodingMarks * 100), // 0-100 percentage for this specific coding question
        testCasesPassed,
        totalTestCases,
        executionStatus: execStatus,
        isCorrect,
      });
    } else {
      // MCQ Question
      mcqTotalMarks += 1;

      const selected =
        typeof userAnsObj === "object" && userAnsObj !== null
          ? (userAnsObj.selectedAnswer || userAnsObj.answer || "").trim()
          : typeof userAnsObj === "string"
          ? userAnsObj.trim()
          : "";

      const isCorrect = Boolean(selected) && (
        selected.toLowerCase() === (question.correctAnswer || "").trim().toLowerCase()
      );

      if (selected) {
        attemptedCount++;
      } else {
        skippedCount++;
      }

      if (isCorrect) {
        mcqMarks += 1;
        topicStats[qTopic].correct += 1;
        if (diffStats[qDiff]) diffStats[qDiff].correct += 1;
      }

      evaluatedAnswers.push({
        question: question._id,
        selectedAnswer: selected,
        isCorrect,
      });
    }
  }

  // Round scores to 2 decimal places if fractional, or integer if whole
  mcqMarks = Math.round(mcqMarks * 100) / 100;
  codingMarks = Math.round(codingMarks * 100) / 100;
  const overallScore = Math.round((mcqMarks + codingMarks) * 100) / 100;
  const totalPossibleMarks = mcqTotalMarks + codingTotalMarks;

  const percentage = totalPossibleMarks > 0 ? Math.round((overallScore / totalPossibleMarks) * 100) : 0;

  const topicPerformance = Object.keys(topicStats).map((tName) => {
    const stats = topicStats[tName];
    const tPct = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
    return {
      topic: tName,
      correct: stats.correct,
      total: stats.total,
      percentage: tPct,
    };
  });

  const difficultyPerformance = ["Easy", "Medium", "Hard"].map((level) => {
    const key = level.toLowerCase();
    const stats = diffStats[key] || { correct: 0, total: 0 };
    const dPct = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
    return {
      difficulty: level,
      correct: stats.correct,
      total: stats.total,
      percentage: dPct,
    };
  });

  const strengths = [];
  const weaknesses = [];
  const recommendations = [];

  topicPerformance.forEach((tp) => {
    if (tp.percentage >= 70) {
      strengths.push(tp.topic);
    } else {
      weaknesses.push(tp.topic);
      recommendations.push(
        `Review core workflows and key concepts for ${tp.topic} to improve technical proficiency.`
      );
    }
  });

  if (codingTotalMarks > 0) {
    const codingPct = codingTotalMarks > 0 ? Math.round((codingMarks / codingTotalMarks) * 100) : 0;
    if (codingPct >= 80) {
      strengths.push("Hands-on Problem Solving & Coding");
    } else {
      weaknesses.push("Coding Edge Cases & Test Coverage");
      recommendations.push("Practice edge case boundary conditions and time complexity optimization in coding assessments.");
    }
  }

  if (weaknesses.length === 0) {
    recommendations.push("Great job! You demonstrated strong proficiency across all technical topics and coding tasks.");
  }

  return {
    score: overallScore,          // Actual total marks obtained (e.g. 0, 11, 20)
    overallScore,                  // Actual total marks obtained
    mcqMarks,                      // Actual MCQ marks obtained (e.g. 0, 10, 18)
    codingMarks,                   // Actual Coding marks obtained (e.g. 0, 1, 2)
    mcqScore: mcqMarks,            // Stored in DB as actual MCQ marks
    codingScore: codingMarks,      // Stored in DB as actual Coding marks
    mcqTotalMarks,                 // Total possible MCQ marks
    codingTotalMarks,              // Total possible Coding marks
    totalPossibleMarks,            // Total possible marks across assessment
    totalQuestions: totalPossibleMarks,
    percentage,                    // percentage (0-100)
    attemptedCount,
    skippedCount,
    correctCount: Math.round(mcqMarks),
    incorrectCount: Math.max(0, totalPossibleMarks - Math.round(overallScore)),
    evaluatedAnswers,
    topicPerformance,
    difficultyPerformance,
    strengths,
    weaknesses,
    recommendations,
  };
};

module.exports = {
  calculateAssessmentScore,
};
