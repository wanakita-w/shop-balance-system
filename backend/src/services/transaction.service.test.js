import { describe, test, expect, vi, beforeEach } from "vitest"

vi.mock("../repositories/transaction.repository.js", () => ({
  transactionRepository: {
    createTransaction: vi.fn(),
    findTransactionById: vi.fn(),
    findTransactions: vi.fn(),
    countTransactions: vi.fn(),
    updateTransaction: vi.fn(),
    deleteTransaction: vi.fn(),
  },
}))

import {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
} from "./transaction.service.js"
import { transactionRepository } from "../repositories/transaction.repository.js"

// ── ข้อมูลสมมติ ──
const mockTransaction = {
  id: "txn-001",
  type: "EXPENSE",
  amount: 500,
  method: "CASH",
  category: "ต้นทุนสินค้า",
  note: "ซื้อของ",
  userId: "user-001",
}

// ─────────────────────────────────────────
// createTransaction
// ─────────────────────────────────────────
describe("createTransaction", () => {
  beforeEach(() => vi.clearAllMocks())

  test("สำเร็จ — บันทึก transaction และ return ข้อมูล", async () => {
    transactionRepository.createTransaction.mockResolvedValue(mockTransaction)

    const result = await createTransaction("user-001", {
      type: "EXPENSE",
      amount: 500,
      method: "CASH",
      category: "ต้นทุนสินค้า",
    })

    expect(result).toEqual(mockTransaction)
    expect(transactionRepository.createTransaction).toHaveBeenCalledTimes(1)
  })

  test("amount = 0 → throw INVALID_AMOUNT", async () => {
    await expect(
      createTransaction("user-001", { type: "EXPENSE", amount: 0, method: "CASH" })
    ).rejects.toThrow("INVALID_AMOUNT")
  })

  test("amount ติดลบ → throw INVALID_AMOUNT", async () => {
    await expect(
      createTransaction("user-001", { type: "EXPENSE", amount: -100, method: "CASH" })
    ).rejects.toThrow("INVALID_AMOUNT")
  })

  test("type ไม่ถูกต้อง → throw INVALID_TRANSACTION_TYPE", async () => {
    await expect(
      createTransaction("user-001", { type: "WRONG", amount: 100, method: "CASH" })
    ).rejects.toThrow("INVALID_TRANSACTION_TYPE")
  })

  test("method ไม่ถูกต้อง → throw INVALID_PAYMENT_METHOD", async () => {
    await expect(
      createTransaction("user-001", { type: "INCOME", amount: 100, method: "BITCOIN" })
    ).rejects.toThrow("INVALID_PAYMENT_METHOD")
  })

  test("ส่ง amount เป็น string '500' → แปลงเป็น number ได้", async () => {
    transactionRepository.createTransaction.mockResolvedValue(mockTransaction)

    await createTransaction("user-001", { type: "EXPENSE", amount: "500", method: "CASH" })

    expect(transactionRepository.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 500 }) // number ไม่ใช่ string
    )
  })

  test("ไม่ส่ง category และ note → บันทึกเป็น null", async () => {
    transactionRepository.createTransaction.mockResolvedValue(mockTransaction)

    await createTransaction("user-001", { type: "INCOME", amount: 100, method: "TRANSFER" })

    expect(transactionRepository.createTransaction).toHaveBeenCalledWith(
      expect.objectContaining({ category: null, note: null })
    )
  })
})

// ─────────────────────────────────────────
// getTransactionById
// ─────────────────────────────────────────
describe("getTransactionById", () => {
  beforeEach(() => vi.clearAllMocks())

  test("พบ transaction → return ข้อมูล", async () => {
    transactionRepository.findTransactionById.mockResolvedValue(mockTransaction)

    const result = await getTransactionById("txn-001")

    expect(result).toEqual(mockTransaction)
  })

  test("ไม่พบ transaction → throw TRANSACTION_NOT_FOUND", async () => {
    transactionRepository.findTransactionById.mockResolvedValue(null)

    await expect(getTransactionById("txn-999")).rejects.toThrow("TRANSACTION_NOT_FOUND")
  })
})

// ─────────────────────────────────────────
// updateTransaction
// ─────────────────────────────────────────
describe("updateTransaction", () => {
  beforeEach(() => vi.clearAllMocks())

  test("MEMBER แก้ไขของตัวเอง → สำเร็จ", async () => {
    transactionRepository.findTransactionById.mockResolvedValue(mockTransaction)
    transactionRepository.updateTransaction.mockResolvedValue({ ...mockTransaction, amount: 999 })

    const result = await updateTransaction("user-001", "MEMBER", "txn-001", { amount: 999 })

    expect(result.amount).toBe(999)
  })

  test("MEMBER แก้ไขของคนอื่น → throw TRANSACTION_FORBIDDEN", async () => {
    transactionRepository.findTransactionById.mockResolvedValue(mockTransaction) // userId: "user-001"

    await expect(
      updateTransaction("user-999", "MEMBER", "txn-001", { amount: 999 })
    ).rejects.toThrow("TRANSACTION_FORBIDDEN")
  })

  test("ADMIN แก้ไขของคนอื่นได้ → สำเร็จ", async () => {
    transactionRepository.findTransactionById.mockResolvedValue(mockTransaction) // userId: "user-001"
    transactionRepository.updateTransaction.mockResolvedValue(mockTransaction)

    await expect(
      updateTransaction("admin-999", "ADMIN", "txn-001", { amount: 999 })
    ).resolves.not.toThrow()
  })

  test("ไม่พบ transaction → throw TRANSACTION_NOT_FOUND", async () => {
    transactionRepository.findTransactionById.mockResolvedValue(null)

    await expect(
      updateTransaction("user-001", "MEMBER", "txn-999", { amount: 100 })
    ).rejects.toThrow("TRANSACTION_NOT_FOUND")
  })

  test("แก้ amount เป็น 0 → throw INVALID_AMOUNT", async () => {
    transactionRepository.findTransactionById.mockResolvedValue(mockTransaction)

    await expect(
      updateTransaction("user-001", "MEMBER", "txn-001", { amount: 0 })
    ).rejects.toThrow("INVALID_AMOUNT")
  })
})

// ─────────────────────────────────────────
// deleteTransaction
// ─────────────────────────────────────────
describe("deleteTransaction", () => {
  beforeEach(() => vi.clearAllMocks())

  test("MEMBER ลบของตัวเอง → สำเร็จ", async () => {
    transactionRepository.findTransactionById.mockResolvedValue(mockTransaction)
    transactionRepository.deleteTransaction.mockResolvedValue(mockTransaction)

    await expect(
      deleteTransaction("user-001", "MEMBER", "txn-001")
    ).resolves.not.toThrow()
  })

  test("MEMBER ลบของคนอื่น → throw TRANSACTION_FORBIDDEN", async () => {
    transactionRepository.findTransactionById.mockResolvedValue(mockTransaction) // userId: "user-001"

    await expect(
      deleteTransaction("user-999", "MEMBER", "txn-001")
    ).rejects.toThrow("TRANSACTION_FORBIDDEN")
  })

  test("ADMIN ลบของคนอื่นได้ → สำเร็จ", async () => {
    transactionRepository.findTransactionById.mockResolvedValue(mockTransaction)
    transactionRepository.deleteTransaction.mockResolvedValue(mockTransaction)

    await expect(
      deleteTransaction("admin-999", "ADMIN", "txn-001")
    ).resolves.not.toThrow()
  })

  test("ไม่พบ transaction → throw TRANSACTION_NOT_FOUND", async () => {
    transactionRepository.findTransactionById.mockResolvedValue(null)

    await expect(
      deleteTransaction("user-001", "MEMBER", "txn-999")
    ).rejects.toThrow("TRANSACTION_NOT_FOUND")
  })

  test("ลบสำเร็จ → เรียก deleteTransaction repository 1 ครั้ง", async () => {
    transactionRepository.findTransactionById.mockResolvedValue(mockTransaction)
    transactionRepository.deleteTransaction.mockResolvedValue(mockTransaction)

    await deleteTransaction("user-001", "MEMBER", "txn-001")

    expect(transactionRepository.deleteTransaction).toHaveBeenCalledTimes(1)
    expect(transactionRepository.deleteTransaction).toHaveBeenCalledWith("txn-001")
  })
})

// ─────────────────────────────────────────
// getTransactions (pagination)
// ─────────────────────────────────────────
describe("getTransactions", () => {
  beforeEach(() => vi.clearAllMocks())

  test("return transactions และ pagination info", async () => {
    transactionRepository.findTransactions.mockResolvedValue([mockTransaction])
    transactionRepository.countTransactions.mockResolvedValue(1)

    const result = await getTransactions({ page: 1, limit: 20 })

    expect(result).toHaveProperty("transactions")
    expect(result).toHaveProperty("pagination")
    expect(result.pagination.total).toBe(1)
    expect(result.pagination.totalPages).toBe(1)
  })

  test("filter type=EXPENSE — ส่ง where ถูกต้องไปที่ repository", async () => {
    transactionRepository.findTransactions.mockResolvedValue([])
    transactionRepository.countTransactions.mockResolvedValue(0)

    await getTransactions({ type: "EXPENSE" })

    expect(transactionRepository.findTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ where: { type: "EXPENSE" } })
    )
  })

  test("type ไม่ถูกต้อง — ไม่ส่ง where type ไปที่ repository", async () => {
    transactionRepository.findTransactions.mockResolvedValue([])
    transactionRepository.countTransactions.mockResolvedValue(0)

    await getTransactions({ type: "INVALID" })

    expect(transactionRepository.findTransactions).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} }) // ไม่มี type filter
    )
  })
})
