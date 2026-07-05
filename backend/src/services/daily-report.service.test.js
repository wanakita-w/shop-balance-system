import { describe, test, expect, vi, beforeEach } from "vitest";
vi.mock("../repositories/daily-report.repository.js", () => ({
  getAggregatedStats: vi.fn(),
  getCategoryBreakdown: vi.fn(),
  getTopExpenses: vi.fn(),
}));

import { getSummary, getEnrichedSummary } from "./daily-report.service.js";
import {
  getAggregatedStats,
  getCategoryBreakdown,
  getTopExpenses,
} from "../repositories/daily-report.repository.js";

// ── ข้อมูลสมมติที่ใช้ซ้ำหลาย test ──
const mockGrouped = [
  { type: "INCOME", method: "CASH", _sum: { amount: 8000 } },
  { type: "INCOME", method: "TRANSFER", _sum: { amount: 4500 } },
  { type: "EXPENSE", method: "CASH", _sum: { amount: 5000 } },
  { type: "EXPENSE", method: "TRANSFER", _sum: { amount: 2000 } },
];

// ─────────────────────────────────────────
// getSummary
// ─────────────────────────────────────────
// describe() — กล่องจัดกลุ่ม test ที่เกี่ยวกับ getSummary ไว้ด้วยกัน ช่วยให้ผลลัพธ์อ่านง่ายขึ้น
describe("getSummary", () => {
  beforeEach(() => {
    // รีเซ็ต mock ก่อนทุก test ไม่ให้ข้อมูลปนกัน
    vi.clearAllMocks();
  });

  test("คำนวณรายรับรวมถูกต้อง (cash + transfer)", async () => {
    getAggregatedStats.mockResolvedValue({ grouped: mockGrouped, total: 10 });

    const result = await getSummary({ start: "2024-01-01", end: "2024-01-31" });

    expect(result.totalIncome).toBe(12500); // 8000 + 4500
  });

  test("คำนวณรายจ่ายรวมถูกต้อง (cash + transfer)", async () => {
    getAggregatedStats.mockResolvedValue({ grouped: mockGrouped, total: 10 });

    const result = await getSummary({});

    expect(result.totalExpense).toBe(7000); // 5000 + 2000
  });

  test("คำนวณกำไรสุทธิถูกต้อง (รายรับ - รายจ่าย)", async () => {
    getAggregatedStats.mockResolvedValue({ grouped: mockGrouped, total: 10 });

    const result = await getSummary({});

    expect(result.netProfit).toBe(5500); // 12500 - 7000
  });

  test("กำไรสุทธิติดลบเมื่อรายจ่ายมากกว่ารายรับ", async () => {
    getAggregatedStats.mockResolvedValue({
      grouped: [
        { type: "INCOME", method: "CASH", _sum: { amount: 1000 } },
        { type: "EXPENSE", method: "CASH", _sum: { amount: 4000 } },
      ],
      total: 2,
    });

    const result = await getSummary({});

    expect(result.netProfit).toBe(-3000);
  });

  test("ไม่มีรายการเลย — ทุกค่าเป็น 0", async () => {
    getAggregatedStats.mockResolvedValue({ grouped: [], total: 0 });

    const result = await getSummary({});

    expect(result.totalIncome).toBe(0);
    expect(result.totalExpense).toBe(0);
    expect(result.netProfit).toBe(0);
    expect(result.transactionCount).toBe(0);
  });

  test("netCash คือ cashIncome - cashExpense", async () => {
    getAggregatedStats.mockResolvedValue({ grouped: mockGrouped, total: 10 });

    const result = await getSummary({});

    expect(result.netCash).toBe(3000); // 8000 - 5000
  });

  test("netTransfer คือ transferIncome - transferExpense", async () => {
    getAggregatedStats.mockResolvedValue({ grouped: mockGrouped, total: 10 });

    const result = await getSummary({});

    expect(result.netTransfer).toBe(2500); // 4500 - 2000
  });
});

// ─────────────────────────────────────────
// getEnrichedSummary
// ─────────────────────────────────────────
describe("getEnrichedSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("คืนค่า current, previous, categories, topExpenses ครบ", async () => {
    getAggregatedStats.mockResolvedValue({ grouped: mockGrouped, total: 10 });
    getCategoryBreakdown.mockResolvedValue([]);
    getTopExpenses.mockResolvedValue([]);

    const result = await getEnrichedSummary({
      start: "2024-07-01T00:00:00Z",
      end: "2024-07-01T23:59:59Z",
    });

    expect(result).toHaveProperty("current");
    expect(result).toHaveProperty("previous");
    expect(result).toHaveProperty("categories");
    expect(result).toHaveProperty("topExpenses");
  });

  test("คำนวณ % ของแต่ละ category ถูกต้อง", async () => {
    getAggregatedStats.mockResolvedValue({ grouped: mockGrouped, total: 10 });
    getCategoryBreakdown.mockResolvedValue([
      { category: "ต้นทุนสินค้า", _sum: { amount: 5600 } }, // 80% ของ 7000
      { category: "ค่าแรง", _sum: { amount: 1400 } }, // 20% ของ 7000
    ]);
    getTopExpenses.mockResolvedValue([]);

    const result = await getEnrichedSummary({
      start: "2024-07-01T00:00:00Z",
      end: "2024-07-01T23:59:59Z",
    });

    expect(result.categories[0].percent).toBe(80);
    expect(result.categories[1].percent).toBe(20);
  });

  test("category ที่ไม่มีชื่อ → แสดงเป็น 'ไม่ระบุหมวด'", async () => {
    getAggregatedStats.mockResolvedValue({ grouped: mockGrouped, total: 10 });
    getCategoryBreakdown.mockResolvedValue([
      { category: null, _sum: { amount: 500 } },
    ]);
    getTopExpenses.mockResolvedValue([]);

    const result = await getEnrichedSummary({
      start: "2024-07-01T00:00:00Z",
      end: "2024-07-01T23:59:59Z",
    });

    expect(result.categories[0].category).toBe("ไม่ระบุหมวด");
  });

  test("เรียก getAggregatedStats 2 ครั้ง (ช่วงนี้ + ช่วงก่อนหน้า)", async () => {
    getAggregatedStats.mockResolvedValue({ grouped: [], total: 0 });
    getCategoryBreakdown.mockResolvedValue([]);
    getTopExpenses.mockResolvedValue([]);

    await getEnrichedSummary({
      start: "2024-07-01T00:00:00Z",
      end: "2024-07-07T23:59:59Z",
    });

    expect(getAggregatedStats).toHaveBeenCalledTimes(2);
  });
});
