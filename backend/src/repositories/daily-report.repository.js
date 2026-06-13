import prisma from "../db.js";

export const getAggregatedStats = async (start, end) => {
  const where = {};
  if (start || end) {
    where.createdAt = {};
    if (start) where.createdAt.gte = new Date(start);
    if (end) where.createdAt.lte = new Date(end);
  }

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
