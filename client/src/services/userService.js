import api from "./api";

const userService = {
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put("/users/profile", data),
  toggleBookmark: (ideaId) => api.put(`/users/bookmark/${ideaId}`),
  getBookmarks: () => api.get("/users/bookmarks"),
};

export default userService;
