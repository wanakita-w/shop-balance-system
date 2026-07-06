/**
 * Axios Instance — ตัวกลางสำหรับเรียก API
 */

import axios from "axios";

// สร้าง axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor — เพิ่ม token ทุก request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response Interceptor — จัดการ error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // auto-logout เฉพาะ authenticated routes เท่านั้น ไม่ใช่ตอน login ผิด
    const url = error.config?.url || "";
    const isAuthEndpoint = url.includes("/auth/login") || url.includes("/auth/register");
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.reload();
    }

    return Promise.reject(error);
  },
);

export default api;
