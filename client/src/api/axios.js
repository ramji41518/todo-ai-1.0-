import axios from "axios";

// Use Vite env if provided, else fallback to local dev API
const API_URL = import.meta.env?.VITE_API_URL || "https://todo-ai-brbl.onrender.com";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // send cookies for auth
});

// (optional) basic error logging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // console.warn("[API ERROR]", err?.response?.status, err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default api;
