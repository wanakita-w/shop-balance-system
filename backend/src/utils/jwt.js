import jwt from "jsonwebtoken";

/**
 * สร้าง JWT token
 * @param {object} payload - ข้อมูลที่จะเก็บใน token
 * @returns {string} - JWT token
 */
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

/**
 * ตรวจสอบและ decode JWT token
 * @param {string} token - JWT token
 * @returns {object} - Decoded payload
 * @throws {Error} - ถ้า token ไม่ถูกต้องหรือหมดอายุ
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("TOKEN_EXPIRED");
    }
    throw new Error("INVALID_TOKEN");
  }
};

/**
 * Decode token โดยไม่ verify (ใช้ดูข้อมูลเท่านั้น)
 * @param {string} token - JWT token
 * @returns {object} - Decoded payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};
