import { useState } from "react";
import { getSummary } from "../services/dailyReportService";

const fmt = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n ?? 0);
const amtFmt = (n) => n < 0 ? `(฿&nbsp;${fmt(Math.abs(n))})` : `฿&nbsp;${fmt(n)}`;

const fmtDisplay = (localStr) => {
  if (!localStr) return "—";
  const d = new Date(localStr);
  return d.toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const toLocalInput = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const PRESETS = [
  { label: "Today", getValue: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    return { start: toLocalInput(start), end: toLocalInput(now) };
  }},
  { label: "Yesterday", getValue: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
    return { start: toLocalInput(start), end: toLocalInput(end) };
  }},
  { label: "This Month", getValue: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    return { start: toLocalInput(start), end: toLocalInput(now) };
  }},
];

/* ── Screen helpers ──────────────────────────────────────── */

const Line = ({ dashed = false }) => (
  <div className={`my-2 border-t ${dashed ? "border-dashed border-gray-300 dark:border-gray-600" : "border-gray-200 dark:border-gray-700"}`} />
);

const Row = ({ label, value, valueColor, bold, sub }) => (
  <div className={`flex items-baseline justify-between py-1 ${sub ? "pl-3" : ""}`}>
    <p className={`text-sm ${bold ? "font-semibold text-gray-800 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"}`}>{label}</p>
    <p className={`text-sm font-mono tabular-nums ${bold ? "font-bold" : "font-medium"} ${valueColor ?? "text-gray-700 dark:text-gray-200"}`}>{value}</p>
  </div>
);

/* ── Print in new window ─────────────────────────────────── */

function openPrintWindow(result, generatedRange, generatedAt) {
  const period    = `${fmtDisplay(generatedRange.start)} &mdash; ${fmtDisplay(generatedRange.end)}`;
  const genDate   = generatedAt.toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Income &amp; Expense Statement</title>
<style>
  @page { size: A4 portrait; margin: 2.2cm 2.8cm; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    color: #111;
    background: #fff;
    line-height: 1.55;
  }

  /* ── Header ── */
  .hd { text-align: center; padding-bottom: 18px; border-bottom: 3px double #111; margin-bottom: 20px; }
  .hd-org   { font-size: 10px; letter-spacing: .28em; font-weight: 700; text-transform: uppercase; color: #555; margin-bottom: 8px; }
  .hd-title { font-size: 24px; font-weight: 900; letter-spacing: -.3px; margin-bottom: 3px; }
  .hd-sub   { font-size: 11.5px; color: #555; }

  /* ── Meta ── */
  .meta { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  .meta td { padding: 2px 0; font-size: 12px; }
  .meta .k  { font-weight: 700; width: 90px; color: #444; vertical-align: top; }
  .meta .v  { color: #111; }

  /* ── Dividers ── */
  .dd  { border: none; border-top: 3px double #111; margin: 18px 0; }
  .ds  { border: none; border-top: 1px solid #111;  margin:  8px 0; }
  .dsh { border: none; border-top: 1px dashed #bbb; margin: 14px 0; }

  /* ── Section label ── */
  .sec { font-size: 10px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; color: #666; padding-bottom: 5px; }

  /* ── Line items ── */
  .tbl { width: 100%; border-collapse: collapse; }
  .tbl td { padding: 3.5px 0; }
  .tbl .ind { padding-left: 22px; }
  .tbl .num { text-align: right; font-family: "Courier New", Courier, monospace; white-space: nowrap; }
  .tbl .total-row td { font-weight: 700; border-top: 1px solid #111; padding-top: 6px; }

  /* ── Net summary ── */
  .net { width: 100%; border-collapse: collapse; }
  .net td { padding: 4px 0; }
  .net .hero td { font-size: 18px; font-weight: 900; padding: 8px 0; }
  .net .num { text-align: right; font-family: "Courier New", Courier, monospace; white-space: nowrap; }
  .net .s-lbl { padding-left: 22px; font-size: 12px; }
  .net .s-note { font-size: 10px; color: #777; margin-left: 6px; }
  .net .sub .num { font-size: 12px; }

  /* ── Doc footer ── */
  .doc-foot {
    margin-top: 30px;
    padding-top: 10px;
    border-top: 1px dashed #ccc;
    text-align: center;
    font-size: 9.5px;
    color: #aaa;
    letter-spacing: .1em;
  }
</style>
</head>
<body>

<!-- Header -->
<div class="hd">
  <div class="hd-title">Income &amp; Expense Statement</div>
  <div class="hd-sub">Financial Summary Report</div>
</div>

<!-- Meta -->
<table class="meta">
  <tr><td class="k">Period</td><td class="v">${period}</td></tr>
  <tr><td class="k">Generated</td><td class="v">${genDate}</td></tr>
  <tr><td class="k">Entries</td><td class="v">${result.transactionCount} transactions</td></tr>
</table>

<hr class="dd">

<!-- Income -->
<div class="sec">Income</div>
<table class="tbl">
  <tr><td class="ind">Cash</td><td class="num">฿ ${fmt(result.cashIncome)}</td></tr>
  <tr><td class="ind">Transfer</td><td class="num">฿ ${fmt(result.transferIncome)}</td></tr>
  <tr class="total-row"><td>Total Income</td><td class="num">฿ ${fmt(result.totalIncome)}</td></tr>
</table>

<hr class="dsh">

<!-- Expense -->
<div class="sec">Expense</div>
<table class="tbl">
  <tr><td class="ind">Cash</td><td class="num">฿ ${fmt(result.cashExpense)}</td></tr>
  <tr><td class="ind">Transfer</td><td class="num">฿ ${fmt(result.transferExpense)}</td></tr>
  <tr class="total-row"><td>Total Expense</td><td class="num">฿ ${fmt(result.totalExpense)}</td></tr>
</table>

<hr class="dd">

<!-- Net Summary -->
<div class="sec">Net Summary</div>
<table class="net">
  <tr class="hero">
    <td>Net Profit</td>
    <td class="num">${amtFmt(result.netProfit)}</td>
  </tr>
  <tr><td colspan="2"><hr class="ds" style="margin:4px 0"></td></tr>
  <tr class="sub">
    <td class="s-lbl">Net Cash <span class="s-note">(cash in − cash out)</span></td>
    <td class="num">${amtFmt(result.netCash)}</td>
  </tr>
  <tr class="sub">
    <td class="s-lbl">Net Transfer <span class="s-note">(transfer in − out)</span></td>
    <td class="num">${amtFmt(result.netTransfer)}</td>
  </tr>
</table>

<!-- Footer -->
<div class="doc-foot">&mdash;&nbsp;END OF REPORT&nbsp;&mdash;&nbsp;Generated by Shop Balance System&nbsp;&mdash;</div>

<script>
  window.onload = function() {
    window.print();
    window.onafterprint = function() { window.close(); };
  };
</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

/* ── Page component ─────────────────────────────────────── */

export default function DailyReportPage({ onBack }) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

  const [start, setStart] = useState(toLocalInput(startOfDay));
  const [end, setEnd] = useState(toLocalInput(now));
  const [result, setResult] = useState(null);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [generatedRange, setGeneratedRange] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState("Today");

  const handlePreset = (preset) => {
    const { start: s, end: e } = preset.getValue();
    setStart(s);
    setEnd(e);
    setActivePreset(preset.label);
    setResult(null);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await getSummary({
        start: new Date(start).toISOString(),
        end: new Date(end).toISOString(),
      });
      setResult(res.data.data);
      setGeneratedAt(new Date());
      setGeneratedRange({ start, end });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 active:scale-95 transition-all shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Summary Report</h1>
      </div>

      {/* Picker */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                activePreset === p.label
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">From</p>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => { setStart(e.target.value); setActivePreset(""); setResult(null); }}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">To</p>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => { setEnd(e.target.value); setActivePreset(""); setResult(null); }}
              className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !start || !end}
          className="w-full py-3 bg-primary hover:bg-blue-700 text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {loading ? "Calculating..." : "Generate Report"}
        </button>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
      </div>

      {/* Screen result card */}
      {result && generatedRange && (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b-2 border-gray-900 dark:border-gray-200">
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1">Financial Report</p>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Income &amp; Expense Statement</h2>
              <div className="mt-2 space-y-0.5">
                <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium w-14 flex-shrink-0">Period</span>
                  <span>
                    <span className="whitespace-nowrap block"><span className="text-gray-400 dark:text-gray-500 w-8 inline-block">From</span>{fmtDisplay(generatedRange.start)}</span>
                    <span className="whitespace-nowrap block"><span className="text-gray-400 dark:text-gray-500 w-8 inline-block">To</span>{fmtDisplay(generatedRange.end)}</span>
                  </span>
                </div>
                <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium w-14 flex-shrink-0">Generated</span>
                  <span>{generatedAt.toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                </div>
                <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium w-14 flex-shrink-0">Entries</span>
                  <span>{result.transactionCount} transactions</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 space-y-1">
              <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase pt-1 pb-0.5">Income</p>
              <Row sub label="Cash"     value={`฿ ${fmt(result.cashIncome)}`}     valueColor="text-green-600 dark:text-green-400" />
              <Row sub label="Transfer" value={`฿ ${fmt(result.transferIncome)}`} valueColor="text-green-600 dark:text-green-400" />
              <Line />
              <Row bold label="Total Income" value={`฿ ${fmt(result.totalIncome)}`} valueColor="text-green-600 dark:text-green-400" />

              <Line dashed />

              <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase pt-1 pb-0.5">Expense</p>
              <Row sub label="Cash"     value={`฿ ${fmt(result.cashExpense)}`}     valueColor="text-red-500 dark:text-red-400" />
              <Row sub label="Transfer" value={`฿ ${fmt(result.transferExpense)}`} valueColor="text-red-500 dark:text-red-400" />
              <Line />
              <Row bold label="Total Expense" value={`฿ ${fmt(result.totalExpense)}`} valueColor="text-red-500 dark:text-red-400" />

              <Line dashed />

              <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase pt-1 pb-0.5">Net Summary</p>
              <Row bold label="Net Profit"
                value={`${result.netProfit >= 0 ? "" : "−"}฿ ${fmt(Math.abs(result.netProfit))}`}
                valueColor={result.netProfit >= 0 ? "text-primary" : "text-red-500"}
              />
              <Row sub label="Net Cash  (cash in − cash out)"
                value={`${result.netCash >= 0 ? "" : "−"}฿ ${fmt(Math.abs(result.netCash))}`}
                valueColor={result.netCash >= 0 ? "text-gray-700 dark:text-gray-200" : "text-red-500"}
              />
              <Row sub label="Net Transfer  (transfer in − out)"
                value={`${result.netTransfer >= 0 ? "" : "−"}฿ ${fmt(Math.abs(result.netTransfer))}`}
                valueColor={result.netTransfer >= 0 ? "text-gray-700 dark:text-gray-200" : "text-red-500"}
              />
            </div>

            <div className="px-5 py-3 border-t border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-between">
              <p className="text-[10px] text-gray-400 tracking-wide">END OF REPORT</p>
              <button onClick={handleGenerate} className="text-xs text-primary font-semibold active:opacity-60">
                Regenerate
              </button>
            </div>
          </div>

          {/* Print button */}
          <div className="space-y-1.5">
            <button
              onClick={() => openPrintWindow(result, generatedRange, generatedAt)}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-semibold rounded-xl active:scale-[0.98] transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save as PDF
            </button>
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl px-3 py-2.5">
              <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[11px] text-amber-700 dark:text-amber-400 leading-relaxed">
                Chrome adds date &amp; title automatically. To remove them, uncheck{" "}
                <span className="font-bold">Headers and footers</span> in the print dialog before saving.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
