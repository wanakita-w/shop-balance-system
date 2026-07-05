import api from "./api";

export const aiService = {
  analyze: (start, end, periodLabel) =>
    api.post("/ai/analyze", { start, end, periodLabel }),
};
