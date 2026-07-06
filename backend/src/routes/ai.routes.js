import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import { analyze } from "../controllers/ai.controller.js";

const router = Router();

router.use(authMiddleware);

router.post("/analyze", analyze);

export default router;
