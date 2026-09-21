import axios from "axios";

const getBaseURL = () => {
  const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  let url = rawUrl.trim().replace(/\/+$/, "");
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("TOKEN:", token);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;