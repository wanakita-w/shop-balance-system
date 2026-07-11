import {
  getAggregatedStats,
  getCategoryBreakdown,
  getTopExpenses,
  getTransactionsInRange,
} from "../repositories/daily-report.repository.js";

// แปลงเวลาเป็น "วันที่" ตามเขตเวลาไทย รูปแบบ YYYY-MM-DD (en-CA ให้รูปแบบ ISO)
const toBangkokDay = (date) =>
  new Date(date).toLocaleDateString("en-CA", { timeZone: "Asia/Bangkok" });

// "เดือน" ตามเขตเวลาไทย รูปแบบ YYYY-MM (ตัดวันออกจาก YYYY-MM-DD)
const toBangkokMonth = (date) => toBangkokDay(date).slice(0, 7);

const pick = (grouped, type, method) => {
  const row = grouped.find((r) => r.type === type && r.method === method);
  return row?._sum?.amount ?? 0;
};

const buildStats = ({ grouped, total }) => {
  const cashIncome = pick(grouped, "INCOME", "CASH");
  const transferIncome = pick(grouped, "INCOME", "TRANSFER");
  const cashExpense = pick(grouped, "EXPENSE", "CASH");
  const transferExpense = pick(grouped, "EXPENSE", "TRANSFER");
  const totalIncome = cashIncome + transferIncome;
  const totalExpense = cashExpense + transferExpense;
  return {
    totalIncome,
    totalExpense,
    netProfit: totalIncome - totalExpense,
    cashIncome,
    transferIncome,
    cashExpense,
    transferExpense,
    netCash: cashIncome - cashExpense,
    netTransfer: transferIncome - transferExpense,
    transactionCount: total,
  };
};

export const getSummary = async ({ start, end } = {}) => {
  const raw = await getAggregatedStats(start, end);
  return buildStats(raw);
};

export const getEnrichedSummary = async ({ start, end } = {}) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const duration = endDate - startDate;
  const prevStart = new Date(startDate - duration);
  const prevEnd = new Date(startDate - 1);

  const [raw, prevRaw, categoryRows, topExpenses] = await Promise.all([
    getAggregatedStats(start, end),
    getAggregatedStats(prevStart.toISOString(), prevEnd.toISOString()),
    getCategoryBreakdown(start, end),
    getTopExpenses(start, end, 3),
  ]);

  const current = buildStats(raw);
  const previous = buildStats(prevRaw);

  const categories = categoryRows.map((r) => ({
    category: r.category ?? "ไม่ระบุหมวด",
    amount: r._sum.amount ?? 0,
    percent:
      current.totalExpense > 0
        ? Math.round(((r._sum.amount ?? 0) / current.totalExpense) * 100)
        : 0,
  }));

  return { current, previous, categories, topExpenses };
};

// รายจ่ายแยกตามหมวด พร้อม % ของยอดรวม — ใช้กับกราฟ bar หน้า dashboard
export const getCategories = async ({ start, end } = {}) => {
  const rows = await getCategoryBreakdown(start, end);
  const total = rows.reduce((sum, r) => sum + (r._sum.amount ?? 0), 0);
  return rows.map((r) => ({
    category: r.category ?? "ไม่ระบุหมวด",
    amount: r._sum.amount ?? 0,
    percent: total > 0 ? Math.round(((r._sum.amount ?? 0) / total) * 100) : 0,
  }));
};

// ยอดรายรับ/รายจ่ายแยกตามช่วง — ใช้กับกราฟเส้นแนวโน้ม
// unit = "day" (รายวัน) หรือ "month" (รายเดือน)
// เติมช่วงที่ไม่มีรายการให้เป็น 0 เพื่อให้เส้นกราฟต่อเนื่องไม่ขาดช่วง
export const getTrend = async ({ start, end, unit = "day" } = {}) => {
  const rows = await getTransactionsInRange(start, end);
  const buckets = new Map();
  const keyOf = unit === "month" ? toBangkokMonth : toBangkokDay;

  const addBucket = (key) => {
    if (!buckets.has(key)) buckets.set(key, { date: key, income: 0, expense: 0 });
  };

  // 1) สร้างช่องของทุกช่วงในระยะเวลา ตั้งต้นเป็น 0
  const cursor = new Date(start);
  const endDate = new Date(end);
  while (cursor <= endDate) {
    addBucket(keyOf(cursor));
    if (unit === "month") cursor.setMonth(cursor.getMonth() + 1);
    else cursor.setDate(cursor.getDate() + 1);
  }

  // 2) รวมยอดจริงลงในแต่ละช่วง
  for (const tx of rows) {
    const key = keyOf(tx.createdAt);
    addBucket(key);
    const bucket = buckets.get(key);
    if (tx.type === "INCOME") bucket.income += tx.amount;
    else bucket.expense += tx.amount;
  }

  // 3) เรียงจากเก่าไปใหม่
  return Array.from(buckets.values()).sort((a, b) => a.date.localeCompare(b.date));
};
