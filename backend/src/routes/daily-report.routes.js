import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { getStats } from "../controllers/daily-report.controller.js";

const router = Router();

router.use(authMiddleware);
router.get("/", getStats);

export default router;
