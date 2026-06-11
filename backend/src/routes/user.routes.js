import express from "express";
import { getUsers, updateRole } from "../controllers/user.controller.js";
import { authMiddleware, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    ดูรายชื่อ users ทั้งหมด
 * @access  ADMIN only
 */
router.get("/", authMiddleware, adminOnly, getUsers);

/**
 * @route   PUT /api/users/:id/role
 * @desc    เปลี่ยน role ของ user
 * @access  ADMIN only
 */
router.put("/:id/role", authMiddleware, adminOnly, updateRole);

export default router;
