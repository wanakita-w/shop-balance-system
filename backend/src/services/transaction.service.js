import { transactionRepository } from "../repositories/transaction.repository.js";
import { createError } from "../utils/errorMessages.js";
import { validateRequiredFields } from "../utils/validation.js";

const VALID_TYPES = ["INCOME", "EXPENSE"];
const VALID_METHODS = ["CASH", "TRANSFER"];

// สร้างรายการใหม่ — userId มาจาก JWT เสมอ
export const createTransaction = async (userId, { type, amount, method, category, note }) => {
  validateRequiredFields({ type, amount, method }, ["type", "amount", "method"]);

  if (!VALID_TYPES.includes(type)) throw createError("INVALID_TRANSACTION_TYPE");
  if (!VALID_METHODS.includes(method)) throw createError("INVALID_PAYMENT_METHOD");
  if (Number(amount) <= 0) throw createError("INVALID_AMOUNT");

  return transactionRepository.createTransaction({
    userId,
    type,
    amount: Number(amount),
    method,
    category: category || null,
    note: note || null,
  });
};

// ดูรายการทั้งหมด — ทุก role เห็นได้หมด, filter ตาม type/method/page
export const getTransactions = async ({ type, method, page = 1, limit = 20 } = {}) => {
  const where = {};

  if (type && VALID_TYPES.includes(type)) where.type = type;
  if (method && VALID_METHODS.includes(method)) where.method = method;

  const skip = (Number(page) - 1) * Number(limit);
  const take = Number(limit);

  const [transactions, total] = await Promise.all([
    transactionRepository.findTransactions({ where, skip, take }),
    transactionRepository.countTransactions(where),
  ]);

  return {
    transactions,
    pagination: {
      total,
      page: Number(page),
      limit: take,
      totalPages: Math.ceil(total / take),
    },
  };
};

// ดูรายการเดียว — ทุก role เห็นได้
export const getTransactionById = async (id) => {
  const transaction = await transactionRepository.findTransactionById(id);
  if (!transaction) throw createError("TRANSACTION_NOT_FOUND");
  return transaction;
};

// แก้ไขรายการ — MEMBER แก้ได้แค่ของตัวเอง, ADMIN แก้ได้ทุกรายการ
export const updateTransaction = async (userId, role, id, { type, amount, method, category, note }) => {
  const transaction = await transactionRepository.findTransactionById(id);
  if (!transaction) throw createError("TRANSACTION_NOT_FOUND");
  if (role !== "ADMIN" && transaction.userId !== userId) throw createError("TRANSACTION_FORBIDDEN");

  const updateData = {};

  if (type !== undefined) {
    if (!VALID_TYPES.includes(type)) throw createError("INVALID_TRANSACTION_TYPE");
    updateData.type = type;
  }
  if (amount !== undefined) {
    if (Number(amount) <= 0) throw createError("INVALID_AMOUNT");
    updateData.amount = Number(amount);
  }
  if (method !== undefined) {
    if (!VALID_METHODS.includes(method)) throw createError("INVALID_PAYMENT_METHOD");
    updateData.method = method;
  }
  if (category !== undefined) updateData.category = category || null;
  if (note !== undefined) updateData.note = note || null;

  return transactionRepository.updateTransaction(id, updateData);
};

// ลบรายการ — MEMBER ลบได้แค่ของตัวเอง, ADMIN ลบได้ทุกรายการ
export const deleteTransaction = async (userId, role, id) => {
  const transaction = await transactionRepository.findTransactionById(id);
  if (!transaction) throw createError("TRANSACTION_NOT_FOUND");
  if (role !== "ADMIN" && transaction.userId !== userId) throw createError("TRANSACTION_FORBIDDEN");
  return transactionRepository.deleteTransaction(id);
};
