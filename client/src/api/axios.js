import axios from "axios";

// Use Vite env variable, fallback to localhost
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // always send cookies (for auth)
});

// optional: basic error logging
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.warn(
      "[API ERROR]",
      err?.response?.status,
      err?.response?.data || err.message
    );
    return Promise.reject(err);
  }
);

export default api;
