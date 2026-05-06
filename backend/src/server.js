import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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
// test route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
