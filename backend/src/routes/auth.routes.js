import express from "express";
import {
  register,
  login,
  getProfile,
  updateProfile,
} from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    สมัครสมาชิก
 * @access  Public (ไม่ต้อง login)
 */
router.post("/register", register);

/**
 * @route   POST /api/auth/login
 * @desc    เข้าสู่ระบบ
 * @access  Public (ไม่ต้อง login)
 */
router.post("/login", login);

/**
 * @route   GET /api/auth/me
 * @desc    ดูโปรไฟล์ตัวเอง
 * @access  Private (ต้อง login)
 * @note    ยังไม่ได้ใส่ middleware — จะเพิ่มในบทถัดไป
 */
router.get("/me", authMiddleware, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    แก้ไขโปรไฟล์
 * @access  Private (ต้อง login)
 * @note    ยังไม่ได้ใส่ middleware — จะเพิ่มในบทถัดไป
 */
router.put("/profile", authMiddleware, updateProfile);

export default router;
