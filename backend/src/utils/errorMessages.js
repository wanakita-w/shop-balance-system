/**
 * Error messages กลาง
 * ใช้เพื่อให้ error message เหมือนกันทั้งระบบ
 */
export const ERROR_MESSAGES = {
  // Auth errors
  EMAIL_ALREADY_EXISTS: "Email นี้ถูกใช้งานแล้ว",
  INVALID_CREDENTIALS: "Email หรือ Password ไม่ถูกต้อง",
  UNAUTHORIZED: "กรุณา login ก่อนใช้งาน",
  FORBIDDEN: "คุณไม่มีสิทธิ์เข้าถึง",
  TOKEN_EXPIRED: "Token หมดอายุ กรุณา login ใหม่",
  INVALID_TOKEN: "Token ไม่ถูกต้อง",

  // Validation errors
  REQUIRED_FIELDS: "กรุณากรอกข้อมูลให้ครบถ้วน",
  INVALID_EMAIL: "รูปแบบ email ไม่ถูกต้อง",
  PASSWORD_TOO_SHORT: "Password ต้องมีอย่างน้อย 6 ตัวอักษร",
  WRONG_PASSWORD: "รหัสผ่านปัจจุบันไม่ถูกต้อง",
  SAME_PASSWORD: "รหัสผ่านใหม่ต้องไม่เหมือนเดิม",

  // User management errors
  INVALID_ROLE: "Role ไม่ถูกต้อง (ต้องเป็น ADMIN หรือ MEMBER)",
  CANNOT_CHANGE_OWN_ROLE: "ไม่สามารถเปลี่ยน Role ของตัวเองได้",

  // Transaction errors
  TRANSACTION_NOT_FOUND: "ไม่พบรายการที่ต้องการ",
  TRANSACTION_FORBIDDEN: "คุณไม่มีสิทธิ์จัดการรายการนี้",
  INVALID_AMOUNT: "จำนวนเงินต้องมากกว่า 0",
  INVALID_TRANSACTION_TYPE: "ประเภทรายการไม่ถูกต้อง (ต้องเป็น INCOME หรือ EXPENSE)",
  INVALID_PAYMENT_METHOD: "วิธีชำระเงินไม่ถูกต้อง (ต้องเป็น CASH หรือ TRANSFER)",

  // Daily report errors
  REPORT_ALREADY_EXISTS: "ปิดยอดวันนี้ไปแล้ว",

  // General errors
  INTERNAL_ERROR: "เกิดข้อผิดพลาดในระบบ",
  NOT_FOUND: "ไม่พบข้อมูลที่ต้องการ",
};

/**
 * สร้าง Error object พร้อม code
 * @param {string} code - Error code จาก ERROR_MESSAGES
 * @returns {Error}
 */
export const createError = (code) => {
  const error = new Error(code);
  error.code = code;
  return error;
};
