import { createContext, useContext, useState } from "react";
import * as dailyReportService from "../services/dailyReportService";

const DailyReportContext = createContext(null);

export function DailyReportProvider({ children }) {
  const [todayData, setTodayData] = useState(null);
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(false);

  const fetchTodayStatus = async () => {
    setLoading(true);
    try {
      const res = await dailyReportService.getTodayStatus();
      setTodayData(res.data.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async (page = 1) => {
    try {
      const res = await dailyReportService.getDailyReports(page);
      setReports(res.data.data.reports);
      setPagination(res.data.data.pagination);
    } catch {
      // ไม่ต้องทำอะไรถ้า fetch history fail
    }
  };

  const closeDay = async ({ actualCash, note }) => {
    const res = await dailyReportService.closeDailyReport({ actualCash, note });
    await fetchTodayStatus();
    await fetchReports(1);
    return res.data.data.report;
  };

  return (
    <DailyReportContext.Provider value={{ todayData, reports, pagination, loading, fetchTodayStatus, fetchReports, closeDay }}>
      {children}
    </DailyReportContext.Provider>
  );
}

export const useDailyReport = () => useContext(DailyReportContext);
