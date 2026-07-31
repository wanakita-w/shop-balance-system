import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  getStats,
  getTrendStats,
  getCategoryStats,
  getTransactionListStats,
} from "../controllers/daily-report.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/", getStats);
router.get("/trend", getTrendStats);
router.get("/categories", getCategoryStats);
router.get("/transactions", getTransactionListStats);

export default router;
