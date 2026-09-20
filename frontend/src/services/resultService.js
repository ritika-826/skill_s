import api from "./api";

export const getMyResults = async () => {
  const response = await api.get("/results/my");

  return response.data;
};

export const getResult = async (resultId) => {
  const response = await api.get(
    `/results/${resultId}`
  );

  return response.data;
};