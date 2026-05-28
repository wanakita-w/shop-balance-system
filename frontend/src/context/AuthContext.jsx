/* eslint-disable react-refresh/only-export-components */
/**
 * AuthContext — จัดการ Authentication ทั่วทั้ง App
 */

import { createContext, useContext, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  // ใช้ lazy initialization — คำนวณครั้งเดียวตอน mount
  const [user, setUser] = useState(() => {
    return authService.getCurrentUser();
  });

  const [loading, setLoading] = useState(false);

  // Login
  const login = async (credentials) => {
    setLoading(true);
    try {
      const result = await authService.login(credentials);

      if (result.success) {
        setUser(result.data.user);
      }

      return result;
    } finally {
      setLoading(false);
    }
  };

  // Register
  const register = async (userData) => {
    setLoading(true);
    try {
      const result = await authService.register(userData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Update profile (name)
  const updateProfile = async (data) => {
    const result = await authService.updateProfile(data);
    if (result.success) {
      setUser(result.data.user);
    }
    return result;
  };

  // Change password
  const changePassword = async (data) => {
    return await authService.changePassword(data);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
