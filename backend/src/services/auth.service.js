import * as userRepo from "../repositories/user.repository.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/jwt.js";
import {
  isValidEmail,
  isValidPassword,
  validateRequiredFields,
  sanitizeInput,
} from "../utils/validation.js";
import { createError } from "../utils/errorMessages.js";

/**
 * ลงทะเบียนผู้ใช้ใหม่
 * @param {object} userData - { email, password, name, role }
 * @returns {Promise<object>} - User object (ไม่มี password)
 * @throws {Error} - ถ้า validation ไม่ผ่านหรือ email ซ้ำ
 */
export const registerUser = async ({ email, password, name, role }) => {
  // === Step 1: Validate Required Fields ===
  const { isValid, missingFields } = validateRequiredFields(
    { email, password, name },
    ["email", "password", "name"],
  );

  if (!isValid) {
    throw createError("REQUIRED_FIELDS");
  }

  // === Step 2: Sanitize Input (ป้องกัน XSS) ===
  const sanitizedEmail = sanitizeInput(email).toLowerCase();
  const sanitizedName = sanitizeInput(name);

  // === Step 3: Validate Email Format ===
  if (!isValidEmail(sanitizedEmail)) {
    throw createError("INVALID_EMAIL");
  }

  // === Step 4: Validate Password Strength ===
  if (!isValidPassword(password)) {
    throw createError("PASSWORD_TOO_SHORT");
  }

  // === Step 5: เช็คว่า Email ซ้ำไหม ===
  const emailExists = await userRepo.isEmailExists(sanitizedEmail);

  if (emailExists) {
    throw createError("EMAIL_ALREADY_EXISTS");
  }

  // === Step 6: Hash Password ===
  const hashedPassword = await hashPassword(password);

  // === Step 7: สร้าง User ใน Database ===
  const newUser = await userRepo.createUser({
    email: sanitizedEmail,
    password: hashedPassword,
    name: sanitizedName,
    role: role || "MEMBER",
  });

  // === Step 8: เอา Password ออกก่อน Return ===
  const { password: _, ...userWithoutPassword } = newUser;

  return userWithoutPassword;
};

/**
 * เข้าสู่ระบบ
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} - { user, token }
 * @throws {Error} - ถ้า credentials ไม่ถูกต้อง
 */
export const loginUser = async ({ email, password }) => {
  // === Step 1: Validate Required Fields ===
  const { isValid } = validateRequiredFields({ email, password }, [
    "email",
    "password",
  ]);

  if (!isValid) {
    throw createError("REQUIRED_FIELDS");
  }

  // === Step 2: Sanitize Email ===
  const sanitizedEmail = sanitizeInput(email).toLowerCase();

  // === Step 3: หา User จาก Email ===
  const user = await userRepo.findUserByEmail(sanitizedEmail);

  if (!user) {
    // ไม่บอกว่า email ไม่มีในระบบ เพื่อความปลอดภัย
    throw createError("INVALID_CREDENTIALS");
  }

  // === Step 4: ตรวจสอบ Password ===
  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw createError("INVALID_CREDENTIALS");
  }

  // === Step 5: สร้าง JWT Token ===
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  // === Step 6: เอา Password ออกก่อน Return ===
  const { password: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

/**
 * ดึงข้อมูล User จาก ID
 * @param {string} userId
 * @returns {Promise<object>} - User object (ไม่มี password)
 * @throws {Error} - ถ้าไม่เจอ user
 */
export const getUserById = async (userId) => {
  const user = await userRepo.findUserById(userId);

  if (!user) {
    throw createError("NOT_FOUND");
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

/**
 * เปลี่ยน Password
 * @param {string} userId
 * @param {object} param1 - { currentPassword, newPassword }
 */
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const { isValid } = validateRequiredFields(
    { currentPassword, newPassword },
    ["currentPassword", "newPassword"],
  );
  if (!isValid) throw createError("REQUIRED_FIELDS");

  const user = await userRepo.findUserById(userId);
  if (!user) throw createError("NOT_FOUND");

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) throw createError("WRONG_PASSWORD");

  if (!isValidPassword(newPassword)) throw createError("PASSWORD_TOO_SHORT");

  const isSame = await comparePassword(newPassword, user.password);
  if (isSame) throw createError("SAME_PASSWORD");

  const hashed = await hashPassword(newPassword);
  await userRepo.updateUser(userId, { password: hashed });
};

/**
 * อัปเดตข้อมูล User
 * @param {string} userId
 * @param {object} updateData - { name?, role? }
 * @returns {Promise<object>} - Updated user (ไม่มี password)
 */
export const updateUserProfile = async (userId, updateData) => {
  // ป้องกันการแก้ไข email และ password ผ่านทางนี้
  const { email, password, ...safeData } = updateData;

  // Sanitize input
  if (safeData.name) {
    safeData.name = sanitizeInput(safeData.name);
  }

  const updatedUser = await userRepo.updateUser(userId, safeData);

  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};
