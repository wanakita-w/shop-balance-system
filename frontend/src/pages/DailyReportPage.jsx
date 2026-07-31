import { useState, useEffect } from "react";
import { getSummary, getCategories, getReportTransactions } from "../services/dailyReportService";
import { aiService } from "../services/aiService";

const fmt = (n) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(n ?? 0);
const amtFmt = (n) => n < 0 ? `(฿&nbsp;${fmt(Math.abs(n))})` : `฿&nbsp;${fmt(n)}`;

const fmtDisplay = (localStr) => {
  if (!localStr) return "—";
  const d = new Date(localStr);
  return d.toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

// วันที่แบบสั้นสำหรับรายการแต่ละแถว
const fmtTxnDate = (s) =>
  new Date(s).toLocaleString("en-US", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const methodLabel = (m) => (m === "CASH" ? "Cash" : "Transfer");

// หนี HTML injection ตอนสร้างหน้าพิมพ์ (category/note เป็นข้อมูลผู้ใช้)
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// เลขที่เอกสาร (statement number) แบบธนาคาร เช่น STMT-20260706-1629
const stmtNo = (date) => {
  const p = (n) => String(n).padStart(2, "0");
  return `STMT-${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}`;
};

const toLocalInput = (date) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const PRESETS = [
  { label: "Today", periodLabel: "วันนี้", getValue: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    return { start: toLocalInput(start), end: toLocalInput(now) };
  }},
  { label: "Yesterday", periodLabel: "เมื่อวาน", getValue: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
    const end   = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
    return { start: toLocalInput(start), end: toLocalInput(end) };
  }},
  { label: "This Week", periodLabel: "สัปดาห์นี้", getValue: () => {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff, 0, 0, 0);
    return { start: toLocalInput(start), end: toLocalInput(now) };
  }},
  { label: "This Month", periodLabel: "เดือนนี้", getValue: () => {
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

function openPrintWindow(result, generatedRange, generatedAt, categories = [], transactions = []) {
  const genDate = generatedAt.toLocaleString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const ref = stmtNo(generatedAt);

  // ── Ledger แบบธนาคาร: Debit/Credit + ยอดคงเหลือสะสม ──
  let running = 0;
  const ledgerRows = transactions.map((t) => {
    const isIncome = t.type === "INCOME";
    running += isIncome ? t.amount : -t.amount;
    return `<tr>
      <td class="date">${fmtTxnDate(t.createdAt)}</td>
      <td>${esc(t.category) || (isIncome ? "Income" : "Expense")}${t.note ? `<div class="l-note">${esc(t.note)}</div>` : ""}<div class="l-method">${methodLabel(t.method)}</div></td>
      <td class="num">${isIncome ? "" : fmt(t.amount)}</td>
      <td class="num">${isIncome ? fmt(t.amount) : ""}</td>
      <td class="num">${amtFmt(running)}</td>
    </tr>`;
  }).join("");

  const ledgerSection = transactions.length === 0 ? "" : `
<div class="sec">Transaction Ledger</div>
<table class="ledger">
  <thead>
    <tr>
      <th>Date</th><th>Description</th>
      <th class="num">Debit (−)</th><th class="num">Credit (+)</th><th class="num">Balance</th>
    </tr>
  </thead>
  <tbody>
    <tr class="ob"><td></td><td>Opening Balance</td><td class="num"></td><td class="num"></td><td class="num">฿&nbsp;${fmt(0)}</td></tr>
    ${ledgerRows}
    <tr class="cb"><td></td><td>Closing Balance</td><td class="num">${fmt(result.totalExpense)}</td><td class="num">${fmt(result.totalIncome)}</td><td class="num">${amtFmt(result.netProfit)}</td></tr>
  </tbody>
</table>`;

  // ── Expense by Category ──
  const categorySection = categories.length === 0 ? "" : `
<div class="sec">Expense by Category</div>
<table class="cat">
  <thead><tr><th>Category</th><th class="num">Share</th><th class="num">Amount</th></tr></thead>
  <tbody>
    ${categories.map((c) => `<tr><td>${esc(c.category)}</td><td class="num">${c.percent}%</td><td class="num">฿&nbsp;${fmt(c.amount)}</td></tr>`).join("")}
    <tr class="cat-total"><td>Total Expense</td><td class="num"></td><td class="num">฿&nbsp;${fmt(result.totalExpense)}</td></tr>
  </tbody>
</table>`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${ref} — Statement of Income &amp; Expense</title>
<style>
  @page { size: A4 portrait; margin: 1.8cm 2cm; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    color: #111;
    background: #fff;
    line-height: 1.5;
  }
  .num { text-align: right; font-family: "Courier New", Courier, monospace; white-space: nowrap; }

  /* ── Header ── */
  .hd { display: flex; justify-content: space-between; align-items: flex-start;
        border-bottom: 2.5px solid #111; padding-bottom: 12px; margin-bottom: 4px; }
  .hd-org   { font-size: 16px; font-weight: 900; letter-spacing: .01em; }
  .hd-org .tag { display: block; font-size: 8px; font-weight: 700; letter-spacing: .22em;
                 color: #888; text-transform: uppercase; margin-top: 3px; }
  .hd-right { text-align: right; }
  .hd-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
  .hd-ccy   { font-size: 9px; color: #777; margin-top: 4px; }
  .hd-rule  { border: none; border-top: 1px solid #111; margin-bottom: 16px; }

  /* ── Info box ── */
  .info-box { border: 1.2px solid #111; margin-bottom: 18px; }
  .info-box table { width: 100%; border-collapse: collapse; }
  .info-box td { padding: 5px 12px; font-size: 11px; border-bottom: 1px solid #e2e2e2; }
  .info-box tr:last-child td { border-bottom: none; }
  .info-box .k { font-weight: 700; color: #555; width: 20%; text-transform: uppercase;
                 font-size: 9px; letter-spacing: .05em; }

  /* ── Section heading ── */
  .sec { font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
         color: #111; margin: 20px 0 7px; padding-bottom: 4px; border-bottom: 1px solid #111; }

  /* ── Account summary box ── */
  .sum-box { border: 1.2px solid #111; }
  .sum-box table { width: 100%; border-collapse: collapse; }
  .sum-box td { padding: 6px 12px; font-size: 12px; }
  .sum-box .lbl { color: #222; }
  .sum-box .sub td { font-size: 10px; color: #666; padding: 3px 12px 3px 26px; }
  .sum-box .div td { padding: 0; }
  .sum-box .div hr { border: none; border-top: 1px dashed #bbb; }
  .sum-box .grand td { font-weight: 900; font-size: 14px; border-top: 2px solid #111; background: #f2f2f2; }

  /* ── Ledger ── */
  .ledger { width: 100%; border-collapse: collapse; }
  .ledger thead th { font-size: 9px; text-transform: uppercase; letter-spacing: .04em;
        text-align: left; padding: 6px 6px; background: #111; color: #fff; }
  .ledger thead th.num { text-align: right; }
  .ledger tbody td { font-size: 10.5px; padding: 5px 6px; border-bottom: 1px solid #ececec; vertical-align: top; }
  .ledger tbody tr:nth-child(even) { background: #f7f7f7; }
  .ledger .date { white-space: nowrap; color: #444; }
  .ledger .l-note { color: #888; font-size: 9px; }
  .ledger .l-method { color: #aaa; font-size: 8.5px; text-transform: uppercase; letter-spacing: .03em; }
  .ledger .ob td, .ledger .cb td { font-weight: 700; background: #ececec !important; }
  .ledger .ob td { border-top: 1.5px solid #111; }
  .ledger .cb td { border-top: 1.5px solid #111; border-bottom: 1.5px solid #111; }

  /* ── Category table ── */
  .cat { width: 100%; border-collapse: collapse; }
  .cat thead th { font-size: 9px; text-transform: uppercase; letter-spacing: .04em;
        text-align: left; padding: 5px 6px; border-bottom: 1.2px solid #111; color: #555; }
  .cat thead th.num { text-align: right; }
  .cat tbody td { font-size: 11px; padding: 4px 6px; border-bottom: 1px solid #eee; }
  .cat .cat-total td { font-weight: 700; border-top: 1.2px solid #111; border-bottom: none; padding-top: 6px; }

  /* ── Doc footer ── */
  .doc-foot { margin-top: 26px; padding-top: 10px; border-top: 1px solid #999;
              font-size: 8.5px; color: #777; line-height: 1.7; }
  .doc-foot .strong { font-weight: 700; color: #555; }
</style>
</head>
<body>

<!-- Header -->
<div class="hd">
  <div class="hd-org">Shop Balance System<span class="tag">Retail Financial Records</span></div>
  <div class="hd-right">
    <div class="hd-title">Statement of Income &amp; Expense</div>
    <div class="hd-ccy">Currency: Thai Baht (฿ THB)</div>
  </div>
</div>
<hr class="hd-rule">

<!-- Statement info -->
<div class="info-box">
  <table>
    <tr>
      <td class="k">Statement No.</td><td>${ref}</td>
      <td class="k">Issue Date</td><td>${genDate}</td>
    </tr>
    <tr>
      <td class="k">Period From</td><td>${fmtDisplay(generatedRange.start)}</td>
      <td class="k">Period To</td><td>${fmtDisplay(generatedRange.end)}</td>
    </tr>
    <tr>
      <td class="k">Total Entries</td><td>${result.transactionCount} transactions</td>
      <td class="k">Prepared By</td><td>Shop Balance System</td>
    </tr>
  </table>
</div>

<!-- Account Summary -->
<div class="sec">Account Summary</div>
<div class="sum-box">
  <table>
    <tr><td class="lbl">Total Income (Credit)</td><td class="num">฿&nbsp;${fmt(result.totalIncome)}</td></tr>
    <tr class="sub"><td>Cash</td><td class="num">฿&nbsp;${fmt(result.cashIncome)}</td></tr>
    <tr class="sub"><td>Transfer</td><td class="num">฿&nbsp;${fmt(result.transferIncome)}</td></tr>
    <tr class="div"><td colspan="2"><hr></td></tr>
    <tr><td class="lbl">Total Expense (Debit)</td><td class="num">฿&nbsp;${fmt(result.totalExpense)}</td></tr>
    <tr class="sub"><td>Cash</td><td class="num">฿&nbsp;${fmt(result.cashExpense)}</td></tr>
    <tr class="sub"><td>Transfer</td><td class="num">฿&nbsp;${fmt(result.transferExpense)}</td></tr>
    <tr class="grand"><td>Net Balance</td><td class="num">${amtFmt(result.netProfit)}</td></tr>
  </table>
</div>

${ledgerSection}
${categorySection}

<!-- Footer -->
<div class="doc-foot">
  <span class="strong">This is a computer-generated statement and does not require a signature.</span><br>
  Statement ${ref} · Generated by Shop Balance System on ${genDate}. Figures shown reflect transactions recorded within the stated period. Negative balances are shown in parentheses.
</div>

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

const PERIOD_TO_PRESET = { today: "Today", month: "This Month" };

export default function DailyReportPage({ onBack, initialPeriod }) {
  const getInitialValues = () => {
    const presetLabel = PERIOD_TO_PRESET[initialPeriod];
    const preset = PRESETS.find((p) => p.label === presetLabel);
    if (preset) return { ...preset.getValue(), activePreset: preset.label, periodLabel: preset.periodLabel };
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    return { start: toLocalInput(startOfDay), end: toLocalInput(now), activePreset: "Today", periodLabel: "วันนี้" };
  };

  const init = getInitialValues();

  const [start, setStart] = useState(init.start);
  const [end, setEnd] = useState(init.end);
  const [result, setResult] = useState(null);
  const [reportCats, setReportCats] = useState([]);
  const [reportTxns, setReportTxns] = useState([]);
  const [generatedAt, setGeneratedAt] = useState(null);
  const [generatedRange, setGeneratedRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activePreset, setActivePreset] = useState(init.activePreset);
  const [periodLabel, setPeriodLabel] = useState(init.periodLabel);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const handlePreset = (preset) => {
    const { start: s, end: e } = preset.getValue();
    setStart(s);
    setEnd(e);
    setActivePreset(preset.label);
    setPeriodLabel(preset.periodLabel);
    setResult(null);
    setAiAnalysis(null);
    setAiError("");
  };

  // ดึงข้อมูลรายงานครบชุด: ยอดสรุป + หมวดหมู่ + รายการทั้งหมด
  const fetchReport = async (startLocal, endLocal) => {
    const range = {
      start: new Date(startLocal).toISOString(),
      end: new Date(endLocal).toISOString(),
    };
    const [sumRes, catRes, txRes] = await Promise.all([
      getSummary(range),
      getCategories(range),
      getReportTransactions(range),
    ]);
    return {
      summary: sumRes.data.data,
      categories: catRes.data.data,
      transactions: txRes.data.data,
    };
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setAiAnalysis(null);
    setAiError("");
    try {
      const { summary, categories, transactions } = await fetchReport(start, end);
      setResult(summary);
      setReportCats(categories);
      setReportTxns(transactions);
      setGeneratedAt(new Date());
      setGeneratedRange({ start, end });
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAiAnalyze = async () => {
    setAiLoading(true);
    setAiError("");
    setAiAnalysis(null);
    try {
      const res = await aiService.analyze(
        new Date(start).toISOString(),
        new Date(end).toISOString(),
        periodLabel
      );
      setAiAnalysis(res.data.analysis);
    } catch {
      setAiError("วิเคราะห์ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchReport(init.start, init.end)
      .then(({ summary, categories, transactions }) => {
        if (!cancelled) {
          setResult(summary);
          setReportCats(categories);
          setReportTxns(transactions);
          setGeneratedAt(new Date());
          setGeneratedRange({ start: init.start, end: init.end });
        }
      })
      .catch(() => { if (!cancelled) setError("Something went wrong. Please try again."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        <div className="flex gap-1">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => handlePreset(p)}
              className={`flex-1 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
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
              className="w-px min-w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">To</p>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => { setEnd(e.target.value); setActivePreset(""); setResult(null); }}
              className="w-px min-w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
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
              <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1">Statement of Income &amp; Expense</p>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Shop Balance System</h2>
              <div className="mt-2 space-y-0.5">
                <div className="flex gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium w-14 flex-shrink-0">Stmt No.</span>
                  <span className="font-mono">{stmtNo(generatedAt)}</span>
                </div>
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

              {reportCats.length > 0 && (
                <>
                  <Line dashed />
                  <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase pt-1 pb-0.5">Expense by Category</p>
                  {reportCats.map((c) => (
                    <Row key={c.category} sub
                      label={`${c.category}  (${c.percent}%)`}
                      value={`฿ ${fmt(c.amount)}`}
                      valueColor="text-red-500 dark:text-red-400"
                    />
                  ))}
                </>
              )}
            </div>

            <div className="px-5 py-3 border-t border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-between">
              <p className="text-[10px] text-gray-400 tracking-wide">END OF REPORT</p>
              <button onClick={handleGenerate} className="text-xs text-primary font-semibold active:opacity-60">
                Regenerate
              </button>
            </div>
          </div>

          {/* Transaction Details */}
          {reportTxns.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm p-5">
              <p className="text-[10px] font-bold tracking-[0.15em] text-gray-400 uppercase mb-3">
                Transaction Details
              </p>
              <div className="space-y-2">
                {reportTxns.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 text-xs border-b border-dashed border-gray-100 dark:border-gray-700/50 pb-2 last:border-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-700 dark:text-gray-200 truncate">
                        {t.category || (t.type === "INCOME" ? "Income" : "Expense")}
                      </p>
                      <p className="text-gray-400 text-[11px]">
                        {fmtTxnDate(t.createdAt)} · {methodLabel(t.method)}
                        {t.note ? ` · ${t.note}` : ""}
                      </p>
                    </div>
                    <span
                      className={`font-mono tabular-nums font-semibold flex-shrink-0 ${
                        t.type === "INCOME"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-500 dark:text-red-400"
                      }`}
                    >
                      {t.type === "INCOME" ? "+" : "−"}฿ {fmt(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Print button */}
          <div className="space-y-1.5">
            <button
              onClick={() => openPrintWindow(result, generatedRange, generatedAt, reportCats, reportTxns)}
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

          {/* AI Analyze button */}
          {!aiAnalysis && (
            <button
              onClick={handleAiAnalyze}
              disabled={aiLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-sm"
            >
              {aiLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Analyze with AI
                </>
              )}
            </button>
          )}

          {aiError && (
            <p className="text-sm text-red-500 text-center">{aiError}</p>
          )}

          {/* AI Analysis result card */}
          {aiAnalysis && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-violet-200 dark:border-violet-800/50 shadow-sm overflow-hidden">
              <div className="px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm font-semibold text-white">AI Analysis · {periodLabel}</span>
                </div>
                <button
                  onClick={handleAiAnalyze}
                  disabled={aiLoading}
                  className="text-xs text-white/80 hover:text-white font-medium disabled:opacity-50 transition-colors"
                >
                  {aiLoading ? "Analyzing..." : "Re-analyze"}
                </button>
              </div>
              <div className="px-4 py-4 space-y-2.5">
                {aiAnalysis.split("\n").filter(Boolean).map((line, i) => (
                  <p key={i} className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed">{line}</p>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
