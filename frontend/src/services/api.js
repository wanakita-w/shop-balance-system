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
    // ถ้า token หมดอายุ → ลบ token + redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export default api;
