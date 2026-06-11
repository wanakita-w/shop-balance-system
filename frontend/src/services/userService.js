import api from "./api";

export const userService = {
  getAll: async ({ page = 1, limit = 20 } = {}) => {
    const response = await api.get("/users", { params: { page, limit } });
    return response.data;
  },

  updateRole: async (userId, role) => {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  },
};
