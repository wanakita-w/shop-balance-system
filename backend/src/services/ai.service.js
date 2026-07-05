import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const pct = (now, prev) => {
  if (prev === 0) return now > 0 ? "+100%" : "0%";
  const diff = ((now - prev) / prev) * 100;
  return (diff >= 0 ? "+" : "") + diff.toFixed(1) + "%";
};

const fmt = (n) => n.toLocaleString("th-TH");

export async function analyzeReport({ current, previous, categories, topExpenses }, periodLabel) {
  const catLines =
    categories.length > 0
      ? categories.map((c) => `  - ${c.category}: ฿${fmt(c.amount)} (${c.percent}%)`).join("\n")
      : "  - ไม่มีข้อมูลหมวดหมู่";

  const topLines =
    topExpenses.length > 0
      ? topExpenses
          .map((t, i) => `  ${i + 1}. ${t.category ?? "ไม่ระบุ"} "${t.note ?? "-"}"  ฿${fmt(t.amount)}`)
          .join("\n")
      : "  - ไม่มีข้อมูล";

  const profitMargin = current.totalIncome > 0
    ? ((current.netProfit / current.totalIncome) * 100).toFixed(1)
    : 0;
  const expenseRatio = current.totalIncome > 0
    ? ((current.totalExpense / current.totalIncome) * 100).toFixed(1)
    : 0;

  const prompt = `
You are a senior financial advisor analyzing a small Thai retail shop's financial data.
Your job is to surface non-obvious insights and risks — not just restate numbers.
Respond ONLY in Thai. Be direct, specific, and analytical.

Context: Thai retail shop benchmark — healthy profit margin is 20–35%. Expense ratio above 80% is a warning sign. Cost of goods above 60% of total expense signals pricing pressure.

Period: ${periodLabel}

=== ข้อมูลช่วงนี้ ===
รายรับ: ฿${fmt(current.totalIncome)}  (สด ฿${fmt(current.cashIncome)} / โอน ฿${fmt(current.transferIncome)})
รายจ่าย: ฿${fmt(current.totalExpense)}  (สด ฿${fmt(current.cashExpense)} / โอน ฿${fmt(current.transferExpense)})
กำไรสุทธิ: ฿${fmt(current.netProfit)}  (margin ${profitMargin}%, expense ratio ${expenseRatio}%)
จำนวนรายการ: ${current.transactionCount} รายการ

=== รายจ่ายแยกหมวด ===
${catLines}

=== เทียบช่วงก่อนหน้า ===
รายรับ: ฿${fmt(previous.totalIncome)} → ฿${fmt(current.totalIncome)}  (${pct(current.totalIncome, previous.totalIncome)})
รายจ่าย: ฿${fmt(previous.totalExpense)} → ฿${fmt(current.totalExpense)}  (${pct(current.totalExpense, previous.totalExpense)})
กำไร: ฿${fmt(previous.netProfit)} → ฿${fmt(current.netProfit)}  (${pct(current.netProfit, previous.netProfit)})

=== รายการจ่ายสูงสุด 3 อันดับ ===
${topLines}

Output format — exactly 4 lines in Thai, each separated by a newline, no extra blank lines:

Line 1 — start with "📊 ": State profit margin % and whether it's healthy/warning/critical vs benchmark (20–35%). If rายรับ = 0 flag as no data.
Line 2 — start with "⚠️ " if there's a real risk, or "✅ " if healthy: Identify the single biggest financial risk or strength visible in this data — something the owner might not notice just by looking at numbers.
Line 3 — start with "📉 ": Analyze the expense structure — which category dominates, is the ratio normal, and what does it mean for the business.
Line 4 — start with "💡 ": Give ONE concrete action the owner should take THIS week based on what you see, with a specific reason tied to the numbers.

Rules:
- Never restate a number without interpreting what it means
- Use comparisons to benchmark or previous period to add context
- If data is insufficient (e.g. no transactions), say so briefly and suggest what to track
- No greetings, no closing, no bullet sub-points, no markdown
  `.trim();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text.trim();
}
