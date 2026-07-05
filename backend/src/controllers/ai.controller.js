import { getEnrichedSummary } from "../services/daily-report.service.js";
import { analyzeReport } from "../services/ai.service.js";

export async function analyze(req, res) {
  const { start, end, periodLabel } = req.body;

  if (!start || !end) {
    return res.status(400).json({ message: "start และ end จำเป็นต้องมี" });
  }

  const enriched = await getEnrichedSummary({ start, end });
  const analysis = await analyzeReport(enriched, periodLabel ?? "ไม่ระบุช่วงเวลา");
  res.json({ analysis });
}
