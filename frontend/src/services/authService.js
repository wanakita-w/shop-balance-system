/**
 * Auth Service — ฟังก์ชันสำหรับ Login/Register
 */

import api from "./api";

export const authService = {
  // Register
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);

    // บันทึก token + user
    if (response.data.success) {
      localStorage.setItem("token", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }

    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get token
  getToken: () => {
    return localStorage.getItem("token");
  },

  // Get profile
  getProfile: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Update profile (name)
  updateProfile: async (data) => {
    const response = await api.put("/auth/profile", data);
    if (response.data.success) {
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  // Change password
  changePassword: async (data) => {
    const response = await api.put("/auth/password", data);
    return response.data;
  },
};
