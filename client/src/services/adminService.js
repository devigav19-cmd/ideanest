import api from "./api";

const adminService = {
  getUsers: () => api.get("/admin/users"),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getIdeas: () => api.get("/admin/ideas"),
  deleteIdea: (id) => api.delete(`/admin/ideas/${id}`),
  getStats: () => api.get("/admin/stats"),
};

export default adminService;
