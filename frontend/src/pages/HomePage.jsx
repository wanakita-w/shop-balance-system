import { useTransactions } from "../context/TransactionContext"; // เพื่อเอาข้อมูล transactions มาแสดงในหน้า Home

const fmt = (n) =>
  new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n); // แปลงตัวเลขให้มี comma และทศนิยม 2 ตำแหน่ง fmt(4000) → "4,000.00"

const fmtDate = (dateStr) => {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMins = Math.floor((now - d) / 60000);
  const diffHours = Math.floor((now - d) / 3600000);
  const diffDays = Math.floor((now - d) / 86400000);
  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString("en-US", { day: "numeric", month: "short" });
};

export default function HomePage({ onAdd, onNavigate }) {
  const { transactions, loading: txLoading } = useTransactions(); // ดึง transactions และสถานะ loading จาก context มาใช้ในหน้า Home

  const income = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);
  const net = income - expense;

  return (
    <div className="space-y-5">
      {/* Hero balance card */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-500/20">
        <p className="text-sm text-blue-200 mb-1">Net Balance</p>
        <h2
          className={`text-5xl font-bold tracking-tight mb-5 ${net < 0 ? "text-red-300" : "text-green-300"}`}
        >
          {net < 0 ? "−" : ""}฿{fmt(Math.abs(net))}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <svg
                className="w-3.5 h-3.5 text-green-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
              <p className="text-xs text-blue-100 font-medium">Income</p>
            </div>
            <p className="text-xl font-bold text-green-300">฿{fmt(income)}</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <svg
                className="w-3.5 h-3.5 text-red-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 13l-5 5m0 0l-5-5m5 5V6"
                />
              </svg>
              <p className="text-xs text-blue-100 font-medium">Expense</p>
            </div>
            <p className="text-xl font-bold text-red-300">฿{fmt(expense)}</p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
          <button
            onClick={() => onNavigate("transactions")}
            className="text-sm text-primary font-semibold active:opacity-60"
          >
            See all
          </button>
        </div>

        {txLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 bg-gray-200 dark:bg-gray-700/60 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <p className="text-gray-400 text-sm mb-2">No transactions yet</p>
            <button
              onClick={onAdd}
              className="text-primary text-sm font-semibold"
            >
              Add your first one →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="flex items-stretch bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden"
              >
                <div
                  className={`w-1 flex-shrink-0 ${tx.type === "INCOME" ? "bg-green-500" : "bg-red-500"}`}
                />
                <div className="flex-1 flex items-center gap-3 px-4 py-3.5 min-w-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {tx.category ||
                        (tx.type === "INCOME" ? "Income" : "Expense")}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {tx.user?.name} · {fmtDate(tx.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold tabular-nums flex-shrink-0 ${
                      tx.type === "INCOME"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-500 dark:text-red-400"
                    }`}
                  >
                    {tx.type === "INCOME" ? "+" : "−"}฿{fmt(tx.amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
