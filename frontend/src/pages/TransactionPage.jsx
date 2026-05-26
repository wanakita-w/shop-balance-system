import { useEffect, useMemo, useState } from "react";
import { useTransactions } from "../context/TransactionContext";
import { useAuth } from "../context/AuthContext";

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n);

const fmtTime = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
};

const getDateLabel = (dateStr) => {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (d.getTime() === today.getTime()) return "Today";
  if (d.getTime() === yesterday.getTime()) return "Yesterday";
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });
};

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Income", value: "INCOME" },
  { label: "Expense", value: "EXPENSE" },
];

const METHOD_FILTERS = [
  { label: "All", value: "" },
  { label: "Cash", value: "CASH" },
  { label: "Transfer", value: "TRANSFER" },
];

const SkeletonRow = () => (
  <div className="flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700/50 animate-pulse">
    <div className="w-10 h-10 rounded-2xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-gray-200 dark:bg-gray-700 rounded-full w-28" />
      <div className="h-3 bg-gray-100 dark:bg-gray-700/60 rounded-full w-20" />
    </div>
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
  </div>
);

const IconEdit = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z" />
  </svg>
);

const IconTrash = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function TransactionPage({ onAdd, onEdit, onBack }) {
  const {
    transactions,
    pagination,
    filters,
    loading,
    error,
    fetchTransactions,
    setFilters,
    removeTransaction,
  } = useTransactions();
  const { user } = useAuth();

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTransactions(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    setDeletingId(id);
    try { await removeTransaction(id); }
    finally { setDeletingId(null); }
  };

  const canEdit = (tx) => user?.role === "ADMIN" || tx.userId === user?.id;

  const grouped = useMemo(() => {
    const map = new Map();
    transactions.forEach((tx) => {
      const label = getDateLabel(tx.createdAt);
      if (!map.has(label)) map.set(label, []);
      map.get(label).push(tx);
    });
    return [...map.entries()];
  }, [transactions]);

  return (
    <div>

      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white active:scale-95 transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Transactions</h1>
            <p className="text-xs text-gray-400 mt-0.5">{pagination.total} records total</p>
          </div>
        </div>
        {/* Desktop add button — FAB covers mobile */}
        <button
          onClick={onAdd}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all duration-150"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Transaction
        </button>
      </div>

      {/* Filter pills */}
      <div className="space-y-2 mb-5">
        {/* Type */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TYPE_FILTERS.map(({ label, value }) => {
            const isActive = filters.type === value;
            const activeColor =
              value === "INCOME" ? "bg-green-500 text-white border-green-500"
              : value === "EXPENSE" ? "bg-red-500 text-white border-red-500"
              : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white";
            return (
              <button
                key={value}
                onClick={() => setFilters({ type: value })}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold border transition-all duration-150 active:scale-95 ${
                  isActive
                    ? activeColor
                    : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Method */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {METHOD_FILTERS.map(({ label, value }) => {
            const isActive = filters.method === value;
            return (
              <button
                key={value}
                onClick={() => setFilters({ method: value })}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 active:scale-95 ${
                  isActive
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => <SkeletonRow key={i} />)}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-600 dark:text-gray-300">No transactions yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Start by adding your first record</p>
          <button
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl active:scale-95 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Transaction
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map(([dateLabel, txs]) => (
            <div key={dateLabel}>
              {/* Date label */}
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2 px-1">
                {dateLabel}
              </p>

              {/* Transactions for this date */}
              <div className="space-y-2">
                {txs.map((tx) => (
                  <div
                    key={tx.id}
                    className="group flex items-stretch bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-200 overflow-hidden"
                  >
                    {/* Color bar */}
                    <div className={`w-1 flex-shrink-0 ${tx.type === "INCOME" ? "bg-green-500" : "bg-red-500"}`} />

                    {/* Content */}
                    <div className="flex-1 flex items-center gap-3 px-4 py-3.5 min-w-0">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {tx.category || (tx.type === "INCOME" ? "Income" : "Expense")}
                        </p>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                            tx.type === "INCOME"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          }`}>
                            {tx.type === "INCOME" ? "Income" : "Expense"}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                            {tx.method === "CASH" ? "Cash" : "Transfer"} · {fmtTime(tx.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Amount + actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`text-sm font-bold tabular-nums ${
                          tx.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"
                        }`}>
                          {tx.type === "INCOME" ? "+" : "−"}฿{fmt(tx.amount)}
                        </span>

                        {canEdit(tx) && (
                          <div className="flex gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
                            <button
                              onClick={() => onEdit(tx)}
                              className="p-1.5 text-gray-300 hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <IconEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(tx.id)}
                              disabled={deletingId === tx.id}
                              className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                              title="Delete"
                            >
                              {deletingId === tx.id
                                ? <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                                : <IconTrash />
                              }
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            disabled={pagination.page <= 1 || loading}
            onClick={() => fetchTransactions(pagination.page - 1)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:shadow-sm active:scale-95 transition-all"
          >
            ← Prev
          </button>
          <span className="text-sm text-gray-400 tabular-nums">
            {pagination.page} / {pagination.totalPages}
          </span>
          <button
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => fetchTransactions(pagination.page + 1)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 disabled:opacity-40 hover:shadow-sm active:scale-95 transition-all"
          >
            Next →
          </button>
        </div>
      )}

    </div>
  );
}
