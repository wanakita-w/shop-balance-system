/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from "react";
import { transactionService } from "../services/transactionService";

const TransactionContext = createContext();

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) throw new Error("useTransactions must be used within TransactionProvider");
  return context;
};

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [filters, setFiltersState] = useState({ type: "", method: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // โหลดรายการจาก API — useCallback ป้องกันการสร้างฟังก์ชันใหม่ทุก render
  const fetchTransactions = useCallback(async (page = 1, currentFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      // สร้าง params โดยตัด key ที่ค่าว่างออก เพื่อไม่ส่ง ?type=&method= ไปโดยเปล่าประโยชน์
      const params = { page, limit: 20 };
      if (currentFilters.type) params.type = currentFilters.type;
      if (currentFilters.method) params.method = currentFilters.method;

      const result = await transactionService.getTransactions(params);
      setTransactions(result.data.transactions);
      setPagination(result.data.pagination);
    } catch (err) {
      setError(err.response?.data?.message || "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // เปลี่ยน filter แล้วกลับ page 1 เสมอ
  const setFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters };
    setFiltersState(updated);
    fetchTransactions(1, updated);
  };

  // สร้างรายการใหม่ แล้ว reload หน้าปัจจุบัน
  const addTransaction = async (data) => {
    const result = await transactionService.createTransaction(data);
    await fetchTransactions(pagination.page);
    return result;
  };

  // แก้ไขรายการ แล้ว reload หน้าปัจจุบัน
  const editTransaction = async (id, data) => {
    const result = await transactionService.updateTransaction(id, data);
    await fetchTransactions(pagination.page);
    return result;
  };

  // ลบรายการ แล้ว reload — ถ้าหน้านี้ไม่มีข้อมูลเหลือ ให้กลับหน้าก่อน
  const removeTransaction = async (id) => {
    await transactionService.deleteTransaction(id);
    const newPage = transactions.length === 1 && pagination.page > 1
      ? pagination.page - 1
      : pagination.page;
    await fetchTransactions(newPage);
  };

  const value = {
    transactions,
    pagination,
    filters,
    loading,
    error,
    fetchTransactions,
    setFilters,
    addTransaction,
    editTransaction,
    removeTransaction,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};
