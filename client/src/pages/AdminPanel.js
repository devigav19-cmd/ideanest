import React, { useEffect, useState } from "react";
import { FiUsers, FiZap, FiTrash2, FiBarChart2 } from "react-icons/fi";
import adminService from "../services/adminService";
import Spinner from "../components/common/Spinner";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, ideasRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getIdeas(),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setIdeas(ideasRes.data.data);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminService.deleteUser(userId);
      setUsers(users.filter((u) => u._id !== userId));
    } catch (err) {
      alert(err.message || "Failed to delete user");
    }
  };

  const handleDeleteIdea = async (ideaId) => {
    if (!window.confirm("Are you sure you want to delete this idea?")) return;
    try {
      await adminService.deleteIdea(ideaId);
      setIdeas(ideas.filter((i) => i._id !== ideaId));
    } catch (err) {
      alert(err.message || "Failed to delete idea");
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
        >
          <FiBarChart2 /> Stats
        </button>
        <button
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <FiUsers /> Users ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "ideas" ? "active" : ""}`}
          onClick={() => setActiveTab("ideas")}
        >
          <FiZap /> Ideas ({ideas.length})
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === "stats" && stats && (
        <div className="admin-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats.totalUsers}</h3>
              <p>Total Users</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalIdeas}</h3>
              <p>Total Ideas</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalComments}</h3>
              <p>Total Comments</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalCollaborations}</h3>
              <p>Collaborations</p>
            </div>
            <div className="stat-card">
              <h3>{stats.totalInvestments}</h3>
              <p>Investment Interests</p>
            </div>
          </div>

          {stats.usersByRole && (
            <div className="stats-section">
              <h3>Users by Role</h3>
              <div className="stats-list">
                {stats.usersByRole.map((r) => (
                  <div key={r._id} className="stats-row">
                    <span>{r._id}</span>
                    <strong>{r.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {stats.ideasByCategory && (
            <div className="stats-section">
              <h3>Ideas by Category</h3>
              <div className="stats-list">
                {stats.ideasByCategory.map((c) => (
                  <div key={c._id} className="stats-row">
                    <span>{c._id}</span>
                    <strong>{c.count}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="role-badge">{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDeleteUser(u._id)}
                      title="Delete user"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ideas Tab */}
      {activeTab === "ideas" && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Stage</th>
                <th>Author</th>
                <th>Votes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ideas.map((idea) => (
                <tr key={idea._id}>
                  <td>{idea.title}</td>
                  <td>{idea.category}</td>
                  <td><span className="idea-stage-badge">{idea.stage}</span></td>
                  <td>{idea.author?.name || "Unknown"}</td>
                  <td>
                    👍 {idea.upvotes?.length || 0} / 👎 {idea.downvotes?.length || 0}
                  </td>
                  <td>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDeleteIdea(idea._id)}
                      title="Delete idea"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
