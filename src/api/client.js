import axios from "axios";

// Ensure base URL has no trailing /api so paths like "/api/auth/login" don't become /api/api/...
const raw = process.env.REACT_APP_API_BASE_URL || "";
const BASE_URL = raw.replace(/\/api\/?$/, "");

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("authToken");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
export { BASE_URL };
