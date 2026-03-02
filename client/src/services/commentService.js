import api from "./api";

const commentService = {
  getByIdea: (ideaId, type) =>
    api.get(`/comments/${ideaId}`, { params: type ? { type } : {} }),
  create: (ideaId, { content, type }) =>
    api.post(`/comments/${ideaId}`, { content, type }),
  remove: (id) => api.delete(`/comments/${id}`),
};

export default commentService;
