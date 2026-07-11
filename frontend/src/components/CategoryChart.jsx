import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { useTheme } from "../context/ThemeContext";

// ไล่สีตามอันดับ: มากสุด = แดง แล้วไล่สดใส warm→cool (ข้อมูลเรียงมาก→น้อยมาแล้ว)
const PALETTE = {
  light: ["#ef4444", "#f97316", "#fbbf24", "#10b981", "#0ea5e9", "#8b5cf6"],
  dark: ["#f87171", "#fb923c", "#fcd34d", "#34d399", "#38bdf8", "#a78bfa"],
};
const OTHER = "#898781"; // หมวดที่เหลือ (ยุบรวม) ใช้สีเทากลาง

const fmt = (n) =>
  "฿" + new Intl.NumberFormat("en-US").format(Math.round(n ?? 0));

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-200">
        {d.category}
      </p>
      <p className="text-gray-500 dark:text-gray-400 tabular-nums">
        {fmt(d.amount)} · {d.percent}%
      </p>
    </div>
  );
}

export default function CategoryChart({ data, loading }) {
  const { isDark } = useTheme();
  const colors = isDark ? PALETTE.dark : PALETTE.light;

  // top 6 หมวด ที่เหลือยุบเป็น "Other"
  const rows = data ?? [];
  const top = rows.slice(0, 6);
  const rest = rows.slice(6);
  const otherAmount = rest.reduce((s, c) => s + c.amount, 0);
  const slices =
    otherAmount > 0
      ? [
          ...top,
          {
            category: "Other",
            amount: otherAmount,
            percent: rest.reduce((s, c) => s + c.percent, 0),
          },
        ]
      : top;

  const total = rows.reduce((s, c) => s + c.amount, 0);
  const colorOf = (i, cat) =>
    cat === "Other" ? OTHER : colors[i % colors.length];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-4">
      <h3 className="text-base font-bold text-gray-900 dark:text-white">
        Expense by Category
      </h3>
      <p className="text-xs text-gray-400 mb-3">
        Amount spent and share of total expenses per category
      </p>

      {loading ? (
        <div className="h-[160px] bg-gray-100 dark:bg-gray-700/40 rounded-xl animate-pulse" />
      ) : slices.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-400">
          No expenses in this period
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Donut + ยอดรวมตรงกลาง */}
          <div
            className="relative flex-shrink-0"
            style={{ width: 132, height: 132 }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={44}
                  outerRadius={64}
                  paddingAngle={2}
                  stroke="none"
                >
                  {slices.map((s, i) => (
                    <Cell key={s.category} fill={colorOf(i, s.category)} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                Total
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                {fmt(total)}
              </span>
            </div>
          </div>

          {/* Legend (มีหัวคอลัมน์ให้รู้ว่าเลขไหนคือยอด เลขไหนคือสัดส่วน) */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wide text-gray-400 mb-1.5">
              <span className="w-2.5 flex-shrink-0" />
              <span className="flex-1">Category</span>
              <span className="w-14 text-right">Amount</span>
              <span className="w-9 text-right">Share</span>
            </div>
            <ul className="space-y-1.5">
              {slices.map((s, i) => (
                <li key={s.category} className="flex items-center gap-2 text-xs">
                  <span
                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: colorOf(i, s.category) }}
                  />
                  <span className="flex-1 font-medium text-gray-700 dark:text-gray-200 truncate">
                    {s.category}
                  </span>
                  <span className="w-14 text-right text-gray-500 dark:text-gray-400 tabular-nums">
                    {fmt(s.amount)}
                  </span>
                  <span className="w-9 text-right text-gray-500 dark:text-gray-400 tabular-nums">
                    {s.percent}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
