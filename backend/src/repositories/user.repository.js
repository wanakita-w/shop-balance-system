import prisma from "../db.js";

/**
 * หา user จาก email
 * @param {string} email
 * @returns {Promise<object|null>}
 */
// เหมือน SELECT * FROM users WHERE email = 'user@example.com';
export const findUserByEmail = async (email) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

/**
 * หา user จาก ID
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export const findUserById = async (id) => {
  return await prisma.user.findUnique({
    where: { id },
  });
};

/**
 * สร้าง user ใหม่
 * @param {object} userData - { email, password, name, role }
 * @returns {Promise<object>}
 */
// เหมือน INSERT INTO users (email, password, name, role)
//       VALUES ('user@example.com', 'hashedPassword123', 'สมชาย', 'MEMBER');
export const createUser = async (userData) => {
  return await prisma.user.create({
    data: userData,
  });
};

/**
 * แก้ไขข้อมูล user
 * @param {string} id
 * @param {object} userData
 * @returns {Promise<object>}
 */
export const updateUser = async (id, userData) => {
  return await prisma.user.update({
    where: { id },
    data: userData,
  });
};

/**
 * ลบ user
 * @param {string} id
 * @returns {Promise<object>}
 */
export const deleteUser = async (id) => {
  return await prisma.user.delete({
    where: { id },
  });
};

/**
 * นับจำนวน users ทั้งหมด
 * @returns {Promise<number>}
 */
export const countUsers = async () => {
  return await prisma.user.count();
};

/**
 * ดึง users ทั้งหมด (พร้อม pagination)
 * @param {object} options - { skip, take }
 * @returns {Promise<array>}
 */
export const findAllUsers = async ({ skip = 0, take = 10 } = {}) => {
  return await prisma.user.findMany({
    skip,
    take,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      // ไม่ select password
    },
  });
};

/**
 * เช็คว่า email มีในระบบแล้วไหม
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export const isEmailExists = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true }, // เลือกแค่ id เพื่อประหยัด bandwidth
  });
  return !!user; // แปลง object เป็น boolean
};
