import { useEffect, useState } from "react";
import { useTransactions } from "../context/TransactionContext";
import { useAuth } from "../context/AuthContext";
import TransactionForm from "../components/TransactionForm";
import Button from "../components/ui/Button";

const formatAmount = (amount) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(amount);

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const TYPE_FILTERS = [
  { label: "All", value: "" },
  { label: "Income", value: "INCOME" },
  { label: "Expense", value: "EXPENSE" },
];

const METHOD_OPTIONS = [
  {
    value: "",
    label: "All",
    sub: "Any method",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 6h16M4 10h16M4 14h16M4 18h16"
        />
      </svg>
    ),
  },
  {
    value: "CASH",
    label: "Cash",
    sub: "Physical money",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
        />
      </svg>
    ),
  },
  {
    value: "TRANSFER",
    label: "Transfer",
    sub: "Bank / e-Wallet",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    ),
  },
];

const SkeletonCard = () => (
  <div className="flex items-stretch bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/50 overflow-hidden animate-pulse">
    <div className="w-1 bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
    <div className="flex-1 flex items-center justify-between px-4 py-3.5 gap-4">
      <div className="flex-1 space-y-2">
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
          <div className="h-4 bg-gray-100 dark:bg-gray-700/50 rounded-full w-12" />
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700/50 rounded w-32" />
      </div>
      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20" />
    </div>
  </div>
);

const IconEdit = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a2 2 0 01-1.414.586H9v-2a2 2 0 01.586-1.414z"
    />
  </svg>
);

const IconTrash = () => (
  <svg
    className="w-3.5 h-3.5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

export default function TransactionPage() {
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

  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchTransactions(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };
  const handleOpenEdit = (tx) => {
    setEditingTransaction(tx);
    setShowForm(true);
  };
  const handleCloseForm = () => {
    setShowForm(false);
    setEditingTransaction(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    setDeletingId(id);
    try {
      await removeTransaction(id);
    } finally {
      setDeletingId(null);
    }
  };

  const canEdit = (tx) => user?.role === "ADMIN" || tx.userId === user?.id;

  // Summary — คำนวณจาก transactions ที่โหลดอยู่
  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transactions
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
            {pagination.total} {pagination.total === 1 ? "record" : "records"}
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark active:scale-95 text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-150"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Transaction
        </button>
      </div>

      {/* Summary Strip */}
      {!loading && transactions.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Income
            </p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400">
              ฿{formatAmount(income)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700/50 shadow-sm">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Expense
            </p>
            <p className="text-lg font-bold text-red-500 dark:text-red-400">
              ฿{formatAmount(expense)}
            </p>
          </div>
          <div
            className={`rounded-2xl p-4 border shadow-sm ${
              net >= 0
                ? "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30"
                : "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-800/30"
            }`}
          >
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Net
            </p>
            <p
              className={`text-lg font-bold ${net >= 0 ? "text-green-700 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            >
              ฿{formatAmount(Math.abs(net))}
            </p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="mb-5 space-y-3">
        {/* Primary: Method */}
        <div className="grid grid-cols-3 gap-2">
          {METHOD_OPTIONS.map(({ value, label, sub, icon }) => {
            const isActive = filters.method === value;
            return (
              <button
                key={value}
                onClick={() => setFilters({ method: value })}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary shadow-sm"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm"
                }`}
              >
                <span
                  className={
                    isActive
                      ? "text-primary"
                      : "text-gray-400 dark:text-gray-500"
                  }
                >
                  {icon}
                </span>
                <span className="text-sm font-semibold">{label}</span>
                <span className="text-xs opacity-50">{sub}</span>
              </button>
            );
          })}
        </div>

        {/* Secondary: Type */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide flex-shrink-0 w-10">
            Type
          </span>
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800/80 rounded-xl flex-1">
            {TYPE_FILTERS.map(({ label, value }) => {
              const isActive = filters.type === value;
              const activeClass =
                value === "INCOME"
                  ? "bg-green-500 text-white shadow"
                  : value === "EXPENSE"
                    ? "bg-red-500 text-white shadow"
                    : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow";
              return (
                <button
                  key={value}
                  onClick={() => setFilters({ type: value })}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95 ${
                    isActive
                      ? activeClass
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-5 rotate-3">
            <svg
              className="w-10 h-10 text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z"
              />
            </svg>
          </div>
          <p className="font-semibold text-gray-600 dark:text-gray-300 text-lg">
            No transactions yet
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1 mb-5">
            Start by adding your first record
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-xl shadow-sm hover:shadow-md active:scale-95 transition-all duration-150"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Transaction
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="group flex items-stretch bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700/60 hover:border-gray-200 dark:hover:border-gray-600 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              {/* Color bar */}
              <div
                className={`w-1 flex-shrink-0 transition-all duration-200 ${
                  tx.type === "INCOME" ? "bg-green-500" : "bg-red-500"
                }`}
              />

              {/* Content */}
              <div className="flex-1 flex items-center gap-3 px-4 py-3.5 min-w-0">
                {/* Left: info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {tx.category && (
                      <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {tx.category}
                      </span>
                    )}
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        tx.type === "INCOME"
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      }`}
                    >
                      {tx.type === "INCOME" ? "Income" : "Expense"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                      {tx.method === "CASH" ? "Cash" : "Transfer"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {tx.user?.name}
                    </span>
                    <span className="text-gray-200 dark:text-gray-700">·</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(tx.createdAt)}
                    </span>
                    {tx.note && (
                      <>
                        <span className="text-gray-200 dark:text-gray-700">
                          ·
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[120px]">
                          {tx.note}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Right: amount + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span
                    className={`text-base font-bold tabular-nums ${
                      tx.type === "INCOME"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "−"}฿{formatAmount(tx.amount)}
                  </span>

                  {/* Action buttons: always visible on mobile, appear on hover desktop */}
                  {canEdit(tx) && (
                    <div className="flex gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <IconEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(tx.id)}
                        disabled={deletingId === tx.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-40"
                        title="Delete"
                      >
                        {deletingId === tx.id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <IconTrash />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <Button
            variant="secondary"
            disabled={pagination.page <= 1 || loading}
            onClick={() => fetchTransactions(pagination.page - 1)}
          >
            ← Previous
          </Button>
          <span className="text-sm text-gray-400 dark:text-gray-500 tabular-nums">
            {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            variant="secondary"
            disabled={pagination.page >= pagination.totalPages || loading}
            onClick={() => fetchTransactions(pagination.page + 1)}
          >
            Next →
          </Button>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <TransactionForm
          isOpen={showForm}
          onClose={handleCloseForm}
          transaction={editingTransaction}
        />
      )}
    </div>
  );
}
