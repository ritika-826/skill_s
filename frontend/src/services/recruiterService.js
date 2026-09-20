import api from "./api";

export const getRecruiterDashboard = async (params = {}) => {
  const response = await api.get("/recruiter/dashboard", { params });
  return response.data;
};

export const getRecruiterStudents = async (params = {}) => {
  const response = await api.get("/recruiter/students", { params });
  return response.data;
};

export const getRecruiterStudent = async (studentId) => {
  const response = await api.get(`/recruiter/students/${studentId}`);
  return response.data;
};

export const getRecruiterAssessments = async (params = {}) => {
  const response = await api.get("/recruiter/assessments", { params });
  return response.data;
};

export const getRecruiterAssessment = async (assessmentId) => {
  const response = await api.get(`/recruiter/assessments/${assessmentId}`);
  return response.data;
};

export const getRecruiterAnalytics = async (params = {}) => {
  const response = await api.get("/recruiter/analytics", { params });
  return response.data;
};
