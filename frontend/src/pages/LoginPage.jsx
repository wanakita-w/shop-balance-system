/**
 * LoginPage — หน้า Login และ Register
 * แบบ Center Card พร้อม Background สวยๆ
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";

export default function LoginPage() {
  // Mode: 'login' หรือ 'register'
  const [mode, setMode] = useState("login");

  // Form data
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });

  // Errors
  const [errors, setErrors] = useState({});

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Auth context
  const { login, register } = useAuth();

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // ลบ error เมื่อเริ่มพิมพ์
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (mode === "register" && !formData.name) {
      newErrors.name = "Name is required";
    }

    return newErrors;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        // Login
        const result = await login({
          email: formData.email,
          password: formData.password,
        });

        if (!result.success) {
          setErrors({ submit: result.message || "Login failed" });
        }
      } else {
        // Register
        const result = await register({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        });

        if (result.success) {
          // สมัครสำเร็จ → เปลี่ยนเป็น login mode
          setMode("login");
          setFormData({ email: formData.email, password: "", name: "" });
          alert("Registration successful! Please login.");
        } else {
          setErrors({ submit: result.message || "Registration failed" });
        }
      }
    } catch (error) {
      console.error("Auth error:", error);
      setErrors({
        submit: error.response?.data?.message || "Something went wrong",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle mode
  const toggleMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setFormData({ email: "", password: "", name: "" });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Login Card */}
      <Card className="w-full max-w-md" padding="lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {mode === "login" ? "Welcome Back" : "Create Account"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {mode === "login"
              ? "Sign in to continue"
              : "Sign up to get started"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name (Register only) */}
          {mode === "register" && (
            <Input
              label="Name"
              name="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              required
            />
          )}

          {/* Email */}
          <Input
            label="Email"
            name="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            required
          />

          {/* Password */}
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            required
          />

          {/* Submit Error */}
          {errors.submit && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">
                {errors.submit}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <Button type="submit" fullWidth disabled={isLoading}>
            {isLoading
              ? "Loading..."
              : mode === "login"
                ? "Sign In"
                : "Sign Up"}
          </Button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {mode === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={toggleMode}
              className="text-primary hover:text-primary-dark font-medium"
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
}
