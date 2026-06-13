import api from "./api";

export const getSummary = ({ start, end } = {}) => {
  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end) params.append("end", end);
  return api.get(`/stats?${params.toString()}`);
};
