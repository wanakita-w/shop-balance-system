import * as authService from "../services/auth.service.js";
import { ERROR_MESSAGES } from "../utils/errorMessages.js";

/**
 * Register — สมัครสมาชิก
 * POST /api/auth/register
 * Body: { email, password, name, role? }
 */
export const register = async (req, res) => {
  try {
    // 1. รับข้อมูลจาก request body
    const { email, password, name, role } = req.body;

    // 2. เรียก Service ทำงาน
    const user = await authService.registerUser({
      email,
      password,
      name,
      role,
    });

    // 3. ส่ง Response สำเร็จ
    res.status(201).json({
      success: true,
      message: "สมัครสมาชิกสำเร็จ",
      data: { user },
    });
  } catch (error) {
    // 4. จัดการ Error
    handleAuthError(res, error);
  }
};

/**
 * Login — เข้าสู่ระบบ
 * POST /api/auth/login
 * Body: { email, password }
 */
export const login = async (req, res) => {
  try {
    // 1. รับข้อมูลจาก request body
    const { email, password } = req.body;

    // 2. เรียก Service ทำงาน
    const { user, token } = await authService.loginUser({
      email,
      password,
    });

    // 3. ส่ง Response สำเร็จ
    res.json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      data: { user, token },
    });
  } catch (error) {
    // 4. จัดการ Error
    handleAuthError(res, error);
  }
};

/**
 * Get Profile — ดูโปรไฟล์ตัวเอง
 * GET /api/auth/me
 * Headers: Authorization: Bearer <token>
 */
export const getProfile = async (req, res) => {
  try {
    // 1. ดึง userId จาก req.user (ที่ middleware ใส่ให้)
    const userId = req.user.userId;

    // 2. เรียก Service
    const user = await authService.getUserById(userId);

    // 3. ส่ง Response
    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    handleAuthError(res, error);
  }
};

/**
 * Update Profile — แก้ไขโปรไฟล์
 * PUT /api/auth/profile
 * Body: { name?, role? }
 * Headers: Authorization: Bearer <token>
 */
export const updateProfile = async (req, res) => {
  try {
    // 1. ดึง userId จาก req.user
    const userId = req.user.userId;

    // 2. รับข้อมูลที่จะแก้
    const updateData = req.body;

    // 3. เรียก Service
    const user = await authService.updateUserProfile(userId, updateData);

    // 4. ส่ง Response
    res.json({
      success: true,
      message: "อัปเดตโปรไฟล์สำเร็จ",
      data: { user },
    });
  } catch (error) {
    handleAuthError(res, error);
  }
};

/**
 * Error Handler สำหรับ Auth
 * แปลง Error จาก Service → HTTP Response
 */
const handleAuthError = (res, error) => {
  console.error("Auth Error:", error);

  // Error codes จาก Service
  switch (error.message) {
    case "EMAIL_ALREADY_EXISTS":
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
      });

    case "INVALID_CREDENTIALS":
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_CREDENTIALS,
      });

    case "REQUIRED_FIELDS":
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.REQUIRED_FIELDS,
      });

    case "INVALID_EMAIL":
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.INVALID_EMAIL,
      });

    case "PASSWORD_TOO_SHORT":
      return res.status(400).json({
        success: false,
        message: ERROR_MESSAGES.PASSWORD_TOO_SHORT,
      });

    case "NOT_FOUND":
      return res.status(404).json({
        success: false,
        message: ERROR_MESSAGES.NOT_FOUND,
      });

    case "UNAUTHORIZED":
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });

    case "FORBIDDEN":
      return res.status(403).json({
        success: false,
        message: ERROR_MESSAGES.FORBIDDEN,
      });

    default:
      // Error ที่ไม่รู้จัก → Internal Server Error
      return res.status(500).json({
        success: false,
        message: ERROR_MESSAGES.INTERNAL_ERROR,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
  }
};
