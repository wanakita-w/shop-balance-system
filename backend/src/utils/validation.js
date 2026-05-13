/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {boolean}
 */
export const isValidPassword = (password) => {
  // อย่างน้อย 6 ตัวอักษร
  return password && password.length >= 6;
};

/**
 * Sanitize user input (ป้องกัน XSS)
 * @param {string} input
 * @returns {string}
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;

  return input.trim().replace(/[<>]/g, ""); // ลบ < และ >
};

/**
 * Validate required fields
 * @param {object} data - Object ที่ต้องการเช็ค
 * @param {string[]} requiredFields - Array ของ field ที่ต้องมี
 * @returns {object} - { isValid: boolean, missingFields: string[] }
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter((field) => !data[field]);

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
};
