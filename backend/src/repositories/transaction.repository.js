import prisma from "../db.js";

export const transactionRepository = {
  createTransaction: (data) => {
    return prisma.transaction.create({ data });
  },

  findTransactionById: (id) => {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
  },

  // where คือ filter object ที่ Prisma เข้าใจได้ เช่น { userId, type }
  findTransactions: ({ where = {}, skip = 0, take = 20, orderBy = { createdAt: "desc" } }) => {
    return prisma.transaction.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        user: { select: { id: true, name: true } },
      },
    });
  },

  countTransactions: (where = {}) => {
    return prisma.transaction.count({ where });
  },

  updateTransaction: (id, data) => {
    return prisma.transaction.update({ where: { id }, data });
  },

  deleteTransaction: (id) => {
    return prisma.transaction.delete({ where: { id } });
  },
};
