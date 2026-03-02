import api from "./api";

const collaborationService = {
  request: ({ ideaId, message }) =>
    api.post(`/collaborations/${ideaId}`, { message }),
  getMy: () => api.get("/collaborations/my"),
  update: (id, status) => api.put(`/collaborations/${id}`, { status }),
};

export default collaborationService;
