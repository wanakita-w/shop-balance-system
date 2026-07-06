import { verifyToken } from "../utils/jwt.js";
import { ERROR_MESSAGES } from "../utils/errorMessages.js";

/**
 * Middleware สำหรับตรวจสอบ JWT Token
 * ใช้กับ routes ที่ต้อง login ก่อน
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // 1. ดึง token จาก header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTHORIZED,
      });
    }

    // 2. แยก token ออกจาก "Bearer <token>"
    const token = authHeader.split(" ")[1];

    // 3. Verify token
    const decoded = verifyToken(token);

    // 4. ใส่ข้อมูล user ใน req.user
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    // 5. ไปต่อที่ Controller
    next();
  } catch (error) {
    // Token ไม่ถูกต้องหรือหมดอายุ
    if (error.message === "TOKEN_EXPIRED") {
      return res.status(401).json({
        success: false,
        message: ERROR_MESSAGES.TOKEN_EXPIRED,
      });
    }

    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }
};

/**
 * Middleware สำหรับเช็คว่าเป็น ADMIN
 * ใช้ต่อจาก authMiddleware
 */
export const adminOnly = (req, res, next) => {
  // เช็คว่า authMiddleware รันก่อนหน้านี้แล้ว
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: ERROR_MESSAGES.UNAUTHORIZED,
    });
  }

  // เช็ค role
  if (req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: ERROR_MESSAGES.FORBIDDEN,
    });
  }

  next();
};
