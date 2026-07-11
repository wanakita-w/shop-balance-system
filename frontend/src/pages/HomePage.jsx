import { useState, useEffect } from "react";
import { useTransactions } from "../context/TransactionContext";
import { getSummary, getCategories } from "../services/dailyReportService";
import TrendChart from "../components/TrendChart";
import CategoryChart from "../components/CategoryChart";

const fmt = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n ?? 0);

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

const PERIODS = [
  { label: "Today", value: "today" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
];

const getPeriodRange = (period) => {
  const now = new Date();
  if (period === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    return { start: start.toISOString(), end: now.toISOString() };
  }
  if (period === "month") {
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    return { start: start.toISOString(), end: now.toISOString() };
  }
  return {};
};

const EMPTY_STATS = { totalIncome: 0, totalExpense: 0, netProfit: 0, cashIncome: 0, transferIncome: 0, cashExpense: 0, transferExpense: 0 };

export default function HomePage({ onAdd, onNavigate, onDailyReport }) {
  const { transactions, loading: txLoading, lastModified } = useTransactions();
  const [period, setPeriod] = useState("today");
  const [stats, setStats] = useState(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);

  // สรุปยอด + หมวดหมู่ ตามช่วงเวลาที่เลือก (Today / This Month / All Time)
  useEffect(() => {
    const fetchByPeriod = async () => {
      setStatsLoading(true);
      setCatLoading(true);
      const range = getPeriodRange(period);
      try {
        const [statsRes, catRes] = await Promise.all([
          getSummary(range),
          getCategories(range),
        ]);
        setStats(statsRes.data.data);
        setCategories(catRes.data.data);
      } catch {
        setStats(EMPTY_STATS);
        setCategories([]);
      } finally {
        setStatsLoading(false);
        setCatLoading(false);
      }
    };
    fetchByPeriod();
  }, [period, lastModified]);

  const net = stats.netProfit;

  return (
    <div className="space-y-5">
      {/* Hero balance card */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 text-white shadow-xl shadow-blue-500/20">
        {/* Period filter */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                period === p.value ? "bg-white text-blue-600" : "bg-white/20 text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="mb-1" />

        <p className="text-sm text-blue-200 mb-1">Net Balance</p>
        <h2 className={`text-5xl font-bold tracking-tight mb-5 ${net < 0 ? "text-red-300" : "text-green-300"}`}>
          {statsLoading ? (
            <span className="opacity-40">฿ ···</span>
          ) : (
            <>{net < 0 ? "−" : ""}฿{fmt(Math.abs(net))}</>
          )}
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onAdd({ type: "INCOME" })}
            className="bg-white/10 rounded-2xl p-4 text-left active:bg-white/20 transition-colors w-full"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
                </svg>
                <p className="text-xs text-blue-100 font-medium">Income</p>
              </div>
              <div className="w-5 h-5 rounded-full bg-green-400/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-green-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <p className="text-xl font-bold text-green-300">
              {statsLoading ? <span className="opacity-40">···</span> : `฿${fmt(stats.totalIncome)}`}
            </p>
          </button>
          <button
            onClick={() => onAdd({ type: "EXPENSE" })}
            className="bg-white/10 rounded-2xl p-4 text-left active:bg-white/20 transition-colors w-full"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-red-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                </svg>
                <p className="text-xs text-blue-100 font-medium">Expense</p>
              </div>
              <div className="w-5 h-5 rounded-full bg-red-400/30 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-red-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <p className="text-xl font-bold text-red-300">
              {statsLoading ? <span className="opacity-40">···</span> : `฿${fmt(stats.totalExpense)}`}
            </p>
          </button>
        </div>
      </div>

      {/* Dashboard charts */}
      <TrendChart refreshKey={lastModified} />
      <CategoryChart data={categories} loading={catLoading} />

      {/* Summary shortcut */}
      <button
        onClick={() => onDailyReport(period)}
        className="w-full flex items-center gap-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3.5 border border-gray-100 dark:border-gray-700/50 shadow-sm active:scale-[0.98] transition-transform"
      >
        <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Summary Report</p>
          <p className="text-xs text-gray-400 mt-0.5">Generate income & expense summary for any period</p>
        </div>
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Transactions</h3>
          <button onClick={() => onNavigate("transactions")} className="text-sm text-primary font-semibold active:opacity-60">
            See all
          </button>
        </div>

        {txLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700/60 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50">
            <p className="text-gray-400 text-sm mb-2">No transactions yet</p>
            <button onClick={() => onAdd()} className="text-primary text-sm font-semibold">
              Add your first one →
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex items-stretch bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 overflow-hidden">
                <div className={`w-1 flex-shrink-0 ${tx.type === "INCOME" ? "bg-green-500" : "bg-red-500"}`} />
                <div className="flex-1 flex items-center gap-3 px-4 py-3.5 min-w-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {tx.category || (tx.type === "INCOME" ? "Income" : "Expense")}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">
                      {tx.user?.name} · {fmtDate(tx.createdAt)}
                    </p>
                  </div>
                  <span className={`text-sm font-bold tabular-nums flex-shrink-0 ${tx.type === "INCOME" ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}>
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
