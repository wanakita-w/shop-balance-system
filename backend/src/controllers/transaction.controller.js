import * as transactionService from "../services/transaction.service.js";
import { ERROR_MESSAGES } from "../utils/errorMessages.js";

// map error code → HTTP status + message
const handleTransactionError = (res, error) => {
  switch (error.message) {
    case "TRANSACTION_NOT_FOUND":
      return res.status(404).json({ success: false, message: ERROR_MESSAGES.TRANSACTION_NOT_FOUND });
    case "TRANSACTION_FORBIDDEN":
      return res.status(403).json({ success: false, message: ERROR_MESSAGES.TRANSACTION_FORBIDDEN });
    case "INVALID_AMOUNT":
      return res.status(400).json({ success: false, message: ERROR_MESSAGES.INVALID_AMOUNT });
    case "INVALID_TRANSACTION_TYPE":
      return res.status(400).json({ success: false, message: ERROR_MESSAGES.INVALID_TRANSACTION_TYPE });
    case "INVALID_PAYMENT_METHOD":
      return res.status(400).json({ success: false, message: ERROR_MESSAGES.INVALID_PAYMENT_METHOD });
    case "REQUIRED_FIELDS":
      return res.status(400).json({ success: false, message: ERROR_MESSAGES.REQUIRED_FIELDS });
    default:
      console.error("Transaction error:", error);
      return res.status(500).json({ success: false, message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

// POST /api/transactions
// userId มาจาก JWT ผ่าน authMiddleware — ไม่รับจาก body เพื่อความปลอดภัย
export const createTransaction = async (req, res) => {
  try {
    const { userId } = req.user;
    const transaction = await transactionService.createTransaction(userId, req.body);
    return res.status(201).json({
      success: true,
      message: "บันทึกรายการสำเร็จ",
      data: { transaction },
    });
  } catch (error) {
    return handleTransactionError(res, error);
  }
};

// GET /api/transactions?type=INCOME&method=CASH&page=1&limit=20
// req.query คือ query string ทุกตัวใน URL
export const getTransactions = async (req, res) => {
  try {
    const result = await transactionService.getTransactions(req.query);
    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลรายการสำเร็จ",
      data: result,
    });
  } catch (error) {
    return handleTransactionError(res, error);
  }
};

// GET /api/transactions/:id
// req.params.id คือ :id ใน URL เช่น /transactions/abc123
export const getTransactionById = async (req, res) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id);
    return res.status(200).json({
      success: true,
      message: "ดึงข้อมูลรายการสำเร็จ",
      data: { transaction },
    });
  } catch (error) {
    return handleTransactionError(res, error);
  }
};

// PUT /api/transactions/:id
// ส่ง role ไปด้วยเพื่อให้ service ตรวจสิทธิ์
export const updateTransaction = async (req, res) => {
  try {
    const { userId, role } = req.user;
    const transaction = await transactionService.updateTransaction(userId, role, req.params.id, req.body);
    return res.status(200).json({
      success: true,
      message: "แก้ไขรายการสำเร็จ",
      data: { transaction },
    });
  } catch (error) {
    return handleTransactionError(res, error);
  }
};

// DELETE /api/transactions/:id
export const deleteTransaction = async (req, res) => {
  try {
    const { userId, role } = req.user;
    await transactionService.deleteTransaction(userId, role, req.params.id);
    return res.status(200).json({
      success: true,
      message: "ลบรายการสำเร็จ",
    });
  } catch (error) {
    return handleTransactionError(res, error);
  }
};
