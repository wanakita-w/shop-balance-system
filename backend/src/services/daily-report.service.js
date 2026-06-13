import { getAggregatedStats } from "../repositories/daily-report.repository.js";

const pick = (grouped, type, method) => {
  const row = grouped.find((r) => r.type === type && r.method === method);
  return row?._sum?.amount ?? 0;
};

export const getSummary = async ({ start, end } = {}) => {
  const { grouped, total } = await getAggregatedStats(start, end);

  const cashIncome = pick(grouped, "INCOME", "CASH");
  const transferIncome = pick(grouped, "INCOME", "TRANSFER");
  const cashExpense = pick(grouped, "EXPENSE", "CASH");
  const transferExpense = pick(grouped, "EXPENSE", "TRANSFER");

  const totalIncome = cashIncome + transferIncome;
  const totalExpense = cashExpense + transferExpense;
  const netProfit = totalIncome - totalExpense;
  const netCash = cashIncome - cashExpense;
  const netTransfer = transferIncome - transferExpense;

  return {
    totalIncome,
    totalExpense,
    netProfit,
    cashIncome,
    transferIncome,
    cashExpense,
    transferExpense,
    netCash,
    netTransfer,
    transactionCount: total,
  };
};
