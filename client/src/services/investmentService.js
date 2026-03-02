import api from "./api";

const investmentService = {
  sendInterest: ({ ideaId, message }) =>
    api.post(`/investments/${ideaId}`, { message }),
  getMy: () => api.get("/investments/my"),
  getReceived: () => api.get("/investments/received"),
  update: (id, status) => api.put(`/investments/${id}`, { status }),
};

export default investmentService;
