import {
  getSummary,
  getTrend,
  getCategories,
} from "../services/daily-report.service.js";
import { ERROR_MESSAGES } from "../utils/errorMessages.js";

export const getStats = async (req, res) => {
  try {
    const { start, end } = req.query;
    const data = await getSummary({ start, end });
    res.json({ success: true, data });
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// กราฟแนวโน้มรายรับ/รายจ่ายรายวัน
export const getTrendStats = async (req, res) => {
  try {
    const { start, end, unit } = req.query;
    const data = await getTrend({ start, end, unit });
    res.json({ success: true, data });
  } catch (error) {
    console.error("Trend Error:", error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// รายจ่ายแยกตามหมวด
export const getCategoryStats = async (req, res) => {
  try {
    const { start, end } = req.query;
    const data = await getCategories({ start, end });
    res.json({ success: true, data });
  } catch (error) {
    console.error("Category Error:", error);
    res.status(500).json({
      success: false,
      message: ERROR_MESSAGES.INTERNAL_ERROR,
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
