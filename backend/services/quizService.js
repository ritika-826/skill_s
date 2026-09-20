import api from "./api";

export const startQuiz = async (quizData) => {
  console.log("START QUIZ DATA:", quizData);

  const response = await api.post(
    "/quizzes/start",
    quizData
  );

  console.log("START QUIZ RESPONSE:", response.data);

  return response.data;
};

export const submitQuiz = async (quizId, answers) => {
  const response = await api.post(
    `/quizzes/${quizId}/submit`,
    {
      answers,
    }
  );

  return response.data;
};

export const getQuiz = async (quizId) => {
  const response = await api.get(
    `/quizzes/${quizId}`
  );

  return response.data;
};