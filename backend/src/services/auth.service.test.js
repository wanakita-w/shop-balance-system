import { describe, test, expect, vi, beforeEach } from "vitest"

// mock ทุก dependency ก่อน import service
vi.mock("../repositories/user.repository.js", () => ({
  isEmailExists: vi.fn(),
  createUser: vi.fn(),
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  updateUser: vi.fn(),
}))
vi.mock("../utils/password.js", () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}))
vi.mock("../utils/jwt.js", () => ({
  generateToken: vi.fn(),
}))

import { registerUser, loginUser, changePassword } from "./auth.service.js"
import * as userRepo from "../repositories/user.repository.js"
import { hashPassword, comparePassword } from "../utils/password.js"
import { generateToken } from "../utils/jwt.js"

// ── ข้อมูลสมมติที่ใช้ซ้ำ ──
const mockUser = {
  id: "user-001",
  email: "test@example.com",
  password: "hashed_password_xyz",
  name: "Test User",
  role: "MEMBER",
  createdAt: new Date(),
}

// ─────────────────────────────────────────
// registerUser
// ─────────────────────────────────────────
describe("registerUser", () => {
  beforeEach(() => vi.clearAllMocks())

  test("สำเร็จ — return user โดยไม่มี password field", async () => {
    userRepo.isEmailExists.mockResolvedValue(false)
    hashPassword.mockResolvedValue("hashed_password_xyz")
    userRepo.createUser.mockResolvedValue(mockUser)

    const result = await registerUser({
      email: "test@example.com",
      password: "secret123",
      name: "Test User",
    })

    expect(result).not.toHaveProperty("password")
    expect(result.email).toBe("test@example.com")
  })

  test("email ซ้ำ → throw EMAIL_ALREADY_EXISTS", async () => {
    userRepo.isEmailExists.mockResolvedValue(true)

    await expect(
      registerUser({ email: "test@example.com", password: "secret123", name: "Test" })
    ).rejects.toThrow("EMAIL_ALREADY_EXISTS")
  })

  test("ไม่กรอก name → throw REQUIRED_FIELDS", async () => {
    await expect(
      registerUser({ email: "test@example.com", password: "secret123", name: "" })
    ).rejects.toThrow("REQUIRED_FIELDS")
  })

  test("email format ผิด → throw INVALID_EMAIL", async () => {
    await expect(
      registerUser({ email: "not-an-email", password: "secret123", name: "Test" })
    ).rejects.toThrow("INVALID_EMAIL")
  })

  test("password สั้นกว่า 6 ตัว → throw PASSWORD_TOO_SHORT", async () => {
    await expect(
      registerUser({ email: "test@example.com", password: "123", name: "Test" })
    ).rejects.toThrow("PASSWORD_TOO_SHORT")
  })

  test("role default เป็น MEMBER ถ้าไม่ส่งมา", async () => {
    userRepo.isEmailExists.mockResolvedValue(false)
    hashPassword.mockResolvedValue("hashed")
    userRepo.createUser.mockResolvedValue(mockUser)

    await registerUser({ email: "test@example.com", password: "secret123", name: "Test" })

    expect(userRepo.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ role: "MEMBER" })
    )
  })
})

// ─────────────────────────────────────────
// loginUser
// ─────────────────────────────────────────
describe("loginUser", () => {
  beforeEach(() => vi.clearAllMocks())

  test("สำเร็จ — return user และ token", async () => {
    userRepo.findUserByEmail.mockResolvedValue(mockUser)
    comparePassword.mockResolvedValue(true)
    generateToken.mockReturnValue("jwt_token_abc")

    const result = await loginUser({ email: "test@example.com", password: "secret123" })

    expect(result).toHaveProperty("token", "jwt_token_abc")
    expect(result).toHaveProperty("user")
  })

  test("สำเร็จ — user ที่ return ไม่มี password", async () => {
    userRepo.findUserByEmail.mockResolvedValue(mockUser)
    comparePassword.mockResolvedValue(true)
    generateToken.mockReturnValue("jwt_token_abc")

    const result = await loginUser({ email: "test@example.com", password: "secret123" })

    expect(result.user).not.toHaveProperty("password")
  })

  test("email ไม่มีในระบบ → throw INVALID_CREDENTIALS", async () => {
    userRepo.findUserByEmail.mockResolvedValue(null)

    await expect(
      loginUser({ email: "ghost@example.com", password: "secret123" })
    ).rejects.toThrow("INVALID_CREDENTIALS")
  })

  test("รหัสผ่านผิด → throw INVALID_CREDENTIALS", async () => {
    userRepo.findUserByEmail.mockResolvedValue(mockUser)
    comparePassword.mockResolvedValue(false)

    await expect(
      loginUser({ email: "test@example.com", password: "wrongpassword" })
    ).rejects.toThrow("INVALID_CREDENTIALS")
  })

  test("ไม่ส่ง email → throw REQUIRED_FIELDS", async () => {
    await expect(
      loginUser({ email: "", password: "secret123" })
    ).rejects.toThrow("REQUIRED_FIELDS")
  })

  test("email ไม่มีในระบบ กับ รหัสผิด → error message เหมือนกัน (ป้องกัน user enumeration)", async () => {
    userRepo.findUserByEmail.mockResolvedValue(null)
    const errorNoUser = await loginUser({ email: "ghost@example.com", password: "x" })
      .catch((e) => e.message)

    userRepo.findUserByEmail.mockResolvedValue(mockUser)
    comparePassword.mockResolvedValue(false)
    const errorWrongPw = await loginUser({ email: "test@example.com", password: "x" })
      .catch((e) => e.message)

    expect(errorNoUser).toBe(errorWrongPw)
  })
})

// ─────────────────────────────────────────
// changePassword
// ─────────────────────────────────────────
describe("changePassword", () => {
  beforeEach(() => vi.clearAllMocks())

  test("สำเร็จ — เรียก updateUser 1 ครั้ง", async () => {
    userRepo.findUserById.mockResolvedValue(mockUser)
    comparePassword
      .mockResolvedValueOnce(true)  // currentPassword ถูก
      .mockResolvedValueOnce(false) // newPassword ไม่เหมือนเดิม
    hashPassword.mockResolvedValue("new_hashed")
    userRepo.updateUser.mockResolvedValue({})

    await changePassword("user-001", {
      currentPassword: "secret123",
      newPassword: "newpassword456",
    })

    expect(userRepo.updateUser).toHaveBeenCalledTimes(1)
  })

  test("รหัสผ่านปัจจุบันผิด → throw WRONG_PASSWORD", async () => {
    userRepo.findUserById.mockResolvedValue(mockUser)
    comparePassword.mockResolvedValue(false)

    await expect(
      changePassword("user-001", { currentPassword: "wrong", newPassword: "newpass456" })
    ).rejects.toThrow("WRONG_PASSWORD")
  })

  test("รหัสผ่านใหม่เหมือนเดิม → throw SAME_PASSWORD", async () => {
    userRepo.findUserById.mockResolvedValue(mockUser)
    comparePassword
      .mockResolvedValueOnce(true)  // currentPassword ถูก
      .mockResolvedValueOnce(true)  // newPassword เหมือนเดิม

    await expect(
      changePassword("user-001", { currentPassword: "secret123", newPassword: "secret123" })
    ).rejects.toThrow("SAME_PASSWORD")
  })

  test("รหัสผ่านใหม่สั้นกว่า 6 ตัว → throw PASSWORD_TOO_SHORT", async () => {
    userRepo.findUserById.mockResolvedValue(mockUser)
    comparePassword.mockResolvedValueOnce(true) // currentPassword ถูก

    await expect(
      changePassword("user-001", { currentPassword: "secret123", newPassword: "123" })
    ).rejects.toThrow("PASSWORD_TOO_SHORT")
  })
})
