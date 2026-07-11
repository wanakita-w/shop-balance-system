import api from "./api";

const buildParams = ({ start, end } = {}) => {
  const params = new URLSearchParams();
  if (start) params.append("start", start);
  if (end) params.append("end", end);
  return params.toString();
};

export const getSummary = (range = {}) => api.get(`/stats?${buildParams(range)}`);

export const getTrend = ({ start, end, unit } = {}) => {
  const params = buildParams({ start, end });
  const query = unit ? `${params}&unit=${unit}` : params;
  return api.get(`/stats/trend?${query}`);
};

export const getCategories = (range = {}) => api.get(`/stats/categories?${buildParams(range)}`);
