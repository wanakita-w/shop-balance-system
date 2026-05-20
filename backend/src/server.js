import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./db.js";
import authRoutes from "./routes/auth.routes.js";
import transactionRoutes from "./routes/transaction.routes.js";

// โหลดค่าจาก .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// === Middlewares ===
// บอก Express ให้รับ JSON request body ได้
app.use(express.json());

// อนุญาตให้ Frontend (port 5173) คุยกับ Backend (port 3000) ได้
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// === Routes ===
// Test route - เช็คสถานะ server และ database
app.get("/api/health", async (req, res) => {
  try {
    // ลองนับจำนวน User ใน database
    const userCount = await prisma.user.count();

    res.json({
      status: "ok",
      message: "Server is running",
      database: "connected",
      userCount: userCount,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Database connection failed",
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);

// === Start Server ===
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
