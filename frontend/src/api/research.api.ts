import axios from "axios";

const API_BASE = "http://localhost:5000/api/v1";

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: async (name: string, email: string, password: string) => {
    const res = await api.post("/auth/register", { name, email, password });
    return res.data;
  },
  login: async (email: string, password: string) => {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  },
};

export const researchApi = {
  createJob: async (topic: string) => {
    const res = await api.post("/research", { topic });
    return res.data;
  },
  getReports: async () => {
    const res = await api.get("/research/reports");
    return res.data;
  },
  getFullReport: async (reportId: string) => {
    const res = await api.get(`/research/reports/${reportId}`);
    return res.data;
  },
};