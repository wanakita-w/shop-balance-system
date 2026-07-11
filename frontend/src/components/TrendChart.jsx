import { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { useTheme } from "../context/ThemeContext";
import { getTrend } from "../services/dailyReportService";

// สีจริง (hex) สำหรับ Recharts — SVG attribute ไม่รองรับ CSS variable จึงเลือกค่าตาม theme ใน JS
// ชุดสีผ่านการ validate เรื่อง colorblind + contrast มาแล้ว
const COLORS = {
  light: { income: "#1baf7a", expense: "#e34948", grid: "#e1e0d9", axis: "#898781" },
  dark: { income: "#199e70", expense: "#e66767", grid: "#2c2c2a", axis: "#898781" },
};

const UNITS = [
  { value: "day", label: "7 Days" },
  { value: "month", label: "6 Months" },
];

const fmtFull = (n) => "฿" + new Intl.NumberFormat("en-US").format(Math.round(n ?? 0));

// ย่อตัวเลขบนแกน Y เช่น 12000 → 12k
const fmtCompact = (n) => {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
  return String(n);
};

// จัดรูปแบบ label ตามหน่วย: รายวัน "6 ก.ค." / รายเดือน "ก.ค."
const fmtLabel = (value, unit) => {
  if (unit === "month") {
    return new Date(value + "-01T00:00:00").toLocaleDateString("th-TH", { month: "short" });
  }
  return new Date(value + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "short" });
};

// ช่วงเวลาตามหน่วยที่เลือก
const getRange = (unit) => {
  const now = new Date();
  if (unit === "month") {
    // 6 เดือนล่าสุด (รวมเดือนปัจจุบัน) — ตั้งต้นวันที่ 1 เพื่อไม่ให้ setMonth ข้ามเดือน
    const start = new Date(now.getFullYear(), now.getMonth() - 5, 1, 0, 0, 0, 0);
    return { start: start.toISOString(), end: now.toISOString(), unit: "month" };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
  return { start: start.toISOString(), end: now.toISOString(), unit: "day" };
};

export default function TrendChart({ refreshKey }) {
  const { isDark } = useTheme();
  const c = isDark ? COLORS.dark : COLORS.light;

  const [unit, setUnit] = useState("day");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getTrend(getRange(unit));
        setData(res.data.data);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [unit, refreshKey]);

  const hasData = data?.some((d) => d.income > 0 || d.expense > 0);

  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const income = payload.find((p) => p.dataKey === "income")?.value ?? 0;
    const expense = payload.find((p) => p.dataKey === "expense")?.value ?? 0;
    return (
      <div className="rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg px-3 py-2 text-xs">
        <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{fmtLabel(label, unit)}</p>
        <p className="text-[var(--chart-income)] font-medium">Income&nbsp;&nbsp;{fmtFull(income)}</p>
        <p className="text-[var(--chart-expense)] font-medium">Expense&nbsp;&nbsp;{fmtFull(expense)}</p>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Trend</h3>
        <div className="flex gap-1">
          {UNITS.map((u) => (
            <button
              key={u.value}
              onClick={() => setUnit(u.value)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                unit === u.value
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-[200px] bg-gray-100 dark:bg-gray-700/40 rounded-xl animate-pulse" />
      ) : !hasData ? (
        <div className="h-[200px] flex items-center justify-center text-sm text-gray-400">
          No data in this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 8, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={c.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(v) => fmtLabel(v, unit)}
              tick={{ fontSize: 11, fill: c.axis }}
              axisLine={false}
              tickLine={false}
              minTickGap={16}
            />
            <YAxis
              tickFormatter={fmtCompact}
              tick={{ fontSize: 11, fill: c.axis }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={renderTooltip} cursor={{ stroke: c.axis, strokeWidth: 1 }} />
            <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke={c.income}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="expense"
              name="Expense"
              stroke={c.expense}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
