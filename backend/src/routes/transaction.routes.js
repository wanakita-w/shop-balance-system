import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import * as transactionController from "../controllers/transaction.controller.js";

const router = Router();

// ทุก route ต้อง login ก่อน
router.post("/", authMiddleware, transactionController.createTransaction);
router.get("/", authMiddleware, transactionController.getTransactions);
router.get("/:id", authMiddleware, transactionController.getTransactionById);
router.put("/:id", authMiddleware, transactionController.updateTransaction);
router.delete("/:id", authMiddleware, transactionController.deleteTransaction);

export default router;
