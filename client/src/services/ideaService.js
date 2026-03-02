import api from "./api";

const ideaService = {
  getAll: (params) => api.get("/ideas", { params }),
  getTrending: () => api.get("/ideas/trending"),
  getMy: () => api.get("/ideas/my"),
  getById: (id) => api.get(`/ideas/${id}`),
  create: (data) => api.post("/ideas", data),
  update: (id, data) => api.put(`/ideas/${id}`, data),
  remove: (id) => api.delete(`/ideas/${id}`),
  upvote: (id) => api.post(`/ideas/${id}/upvote`),
  downvote: (id) => api.post(`/ideas/${id}/downvote`),
  rate: (id, score) => api.post(`/ideas/${id}/rate`, { score }),
};

export default ideaService;
