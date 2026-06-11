import * as userRepo from "../repositories/user.repository.js";
import { createError } from "../utils/errorMessages.js";

const VALID_ROLES = ["ADMIN", "MEMBER"];

export const getAllUsers = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    userRepo.findAllUsers({ skip, take: limit }),
    userRepo.countUsers(),
  ]);
  return { users, total, page, totalPages: Math.ceil(total / limit) };
};

export const updateUserRole = async (adminId, targetUserId, newRole) => {
  if (!VALID_ROLES.includes(newRole)) throw createError("INVALID_ROLE");
  if (adminId === targetUserId) throw createError("CANNOT_CHANGE_OWN_ROLE");

  const target = await userRepo.findUserById(targetUserId);
  if (!target) throw createError("NOT_FOUND");

  const updated = await userRepo.updateUser(targetUserId, { role: newRole });
  const { password: _, ...safe } = updated;
  return safe;
};
