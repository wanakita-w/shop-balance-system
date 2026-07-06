import {
  getAggregatedStats,
  getCategoryBreakdown,
  getTopExpenses,
} from "../repositories/daily-report.repository.js";

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
