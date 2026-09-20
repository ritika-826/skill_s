import api from "./api";

// Fetch Admin System Stats
export const getAdminStats = async () => {
  try {
    const response = await api.get("/admin/dashboard");
    return response.data;
  } catch (error) {
    console.warn("Using local admin stats fallback:", error.message);
    return {
      stats: {
        users: 24,
        quizzes: 48,
        results: 36,
        materials: 12,
      },
    };
  }
};

// Fetch All Users
export const getUsers = async () => {
  try {
    const response = await api.get("/admin/users");
    return response.data;
  } catch (error) {
    console.warn("Using local users fallback:", error.message);
    return {
      users: [
        { _id: "u1", name: "Rahul Sharma", email: "rahul@example.com", role: "student", targetRole: "Backend Developer", createdAt: new Date() },
        { _id: "u2", name: "Priya Patel", email: "priya@example.com", role: "student", targetRole: "Frontend Developer", createdAt: new Date() },
        { _id: "u3", name: "Tech Recruiter", email: "recruiter@example.com", role: "recruiter", createdAt: new Date() },
        { _id: "u4", name: "System Admin", email: "admin@example.com", role: "admin", createdAt: new Date() },
      ],
    };
  }
};

// Delete User
export const deleteUser = async (userId) => {
  const response = await api.delete(`/admin/users/${userId}`);
  return response.data;
};

// Fetch Question Repository
export const getQuestionBank = async () => {
  try {
    const response = await api.get("/questions");
    return response.data;
  } catch (error) {
    console.warn("Using question bank fallback:", error.message);
    return [];
  }
};

// Fetch Learning Materials
export const getMaterials = async () => {
  try {
    const response = await api.get("/materials");
    return response.data;
  } catch (error) {
    console.warn("Using materials fallback:", error.message);
    return [];
  }
};

// Create / Upload Learning Material
export const uploadMaterial = async (materialData) => {
  const response = await api.post("/materials", materialData);
  return response.data;
};

// Delete Learning Material
export const deleteMaterial = async (materialId) => {
  const response = await api.delete(`/materials/${materialId}`);
  return response.data;
};
