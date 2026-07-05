import prisma from "../db.js";

const buildWhere = (start, end) => {
  const where = {};
  if (start || end) {
    where.createdAt = {};
    if (start) where.createdAt.gte = new Date(start);
    if (end) where.createdAt.lte = new Date(end);
  }
  return where;
};

export const getAggregatedStats = async (start, end) => {
  const where = buildWhere(start, end);

  const [grouped, total] = await Promise.all([
    prisma.transaction.groupBy({
      by: ["type", "method"],
      where,
      _sum: { amount: true },
      _count: { id: true },
    }),
    prisma.transaction.count({ where }),
  ]);

  return { grouped, total };
};

export const getCategoryBreakdown = async (start, end) => {
  const where = { ...buildWhere(start, end), type: "EXPENSE" };
  return prisma.transaction.groupBy({
    by: ["category"],
    where,
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
  });
};

export const getTopExpenses = async (start, end, limit = 3) => {
  const where = { ...buildWhere(start, end), type: "EXPENSE" };
  return prisma.transaction.findMany({
    where,
    orderBy: { amount: "desc" },
    take: limit,
    select: { amount: true, category: true, note: true },
  });
};
