import api from "./api";

// ==========================================
// GET ROLES CONFIGURATION
// ==========================================
export const getRolesConfig = async () => {
  const response = await api.get("/quizzes/roles");
  return response.data;
};

// ==========================================
// GET CUSTOM ROLE TOPICS
// ==========================================
export const getCustomRoleTopics = async (customRole) => {
  const response = await api.post("/quizzes/custom-role", { customRole });
  return response.data;
};

// ==========================================
// START ASSESSMENT
// ==========================================
export const startQuiz = async (quizData) => {
  console.log("START ASSESSMENT DATA:", quizData);
  const response = await api.post("/quizzes/start", quizData);
  return response.data;
};

// ==========================================
// GET ASSESSMENT
// ==========================================
export const getQuiz = async (quizId) => {
  const response = await api.get(`/quizzes/${quizId}`);
  return response.data;
};

// ==========================================
// RUN CODE (Isolated Sandbox)
// ==========================================
export const runCode = async ({ questionId, code, language, customInput }) => {
  const response = await api.post("/quizzes/code/run", {
    questionId,
    code,
    language,
    customInput,
  });
  return response.data;
};

// ==========================================
// SUBMIT CODE
// ==========================================
export const submitCode = async ({ questionId, code, language }) => {
  const response = await api.post("/quizzes/code/submit", {
    questionId,
    code,
    language,
  });
  return response.data;
};

// ==========================================
// SUBMIT ASSESSMENT (MCQ + Coding + Monitoring)
// ==========================================
export const submitQuiz = async (quizId, payloadOrAnswers, maybeMonitoringEvents = []) => {
  let payload = {};
  if (
    payloadOrAnswers &&
    typeof payloadOrAnswers === "object" &&
    ("answers" in payloadOrAnswers || "codingAnswers" in payloadOrAnswers || "monitoringEvents" in payloadOrAnswers)
  ) {
    payload = { ...payloadOrAnswers };
  } else {
    payload = {
      answers: payloadOrAnswers || {},
      monitoringEvents: maybeMonitoringEvents || [],
    };
  }

  console.log("SUBMITTING ASSESSMENT API CALL:", { quizId, payload });

  const response = await api.post(`/quizzes/${quizId}/submit`, payload);
  return response.data;
};