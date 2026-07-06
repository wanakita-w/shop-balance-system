import bcrypt from "bcryptjs";

/**
 * Hash password ด้วย bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * เปรียบเทียบ password
 * @param {string} plainPassword - Password ที่ user กรอก
 * @param {string} hashedPassword - Password ที่เก็บใน database
 * @returns {Promise<boolean>} - true ถ้าตรงกัน
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};
