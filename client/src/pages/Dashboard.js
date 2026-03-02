import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ideaService from "../services/ideaService";
import collaborationService from "../services/collaborationService";
import investmentService from "../services/investmentService";
import userService from "../services/userService";
import IdeaCard from "../components/ideas/IdeaCard";
import Spinner from "../components/common/Spinner";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [myIdeas, setMyIdeas] = useState([]);
  const [trendingIdeas, setTrendingIdeas] = useState([]);
  const [collabRequests, setCollabRequests] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin");
      return;
    }
    loadDashboardData();
    // eslint-disable-next-line
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (user?.role === "creator") {
        const [ideasRes, collabRes] = await Promise.all([
          ideaService.getMy(),
          collaborationService.getMy(),
        ]);
        setMyIdeas(ideasRes.data.data);
        setCollabRequests(collabRes.data.data.filter((c) => c.status === "pending"));
      }

      if (user?.role === "investor") {
        const [trendRes, invRes, bookRes] = await Promise.all([
          ideaService.getTrending(),
          investmentService.getMy(),
          userService.getBookmarks(),
        ]);
        setTrendingIdeas(trendRes.data.data.slice(0, 6));
        setInvestments(invRes.data.data);
        setBookmarks(bookRes.data.data);
      }

      if (user?.role === "collaborator") {
        const [trendRes, collabRes] = await Promise.all([
          ideaService.getTrending(),
          collaborationService.getMy(),
        ]);
        setTrendingIdeas(trendRes.data.data.slice(0, 6));
        setCollabRequests(collabRes.data.data);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome, {user?.name}!</h1>
        <p className="role-badge">{user?.role}</p>
      </div>

      {/* ===== CREATOR DASHBOARD ===== */}
      {user?.role === "creator" && (
        <>
          <section className="dashboard-section">
            <div className="section-header">
              <h2>My Ideas ({myIdeas.length})</h2>
              <Link to="/submit-idea" className="btn btn-primary btn-sm">
                + New Idea
              </Link>
            </div>
            {myIdeas.length === 0 ? (
              <div className="empty-state">
                <p>You haven't submitted any ideas yet.</p>
                <Link to="/submit-idea" className="btn btn-primary">Submit Your First Idea</Link>
              </div>
            ) : (
              <div className="ideas-grid">
                {myIdeas.map((idea) => (
                  <IdeaCard key={idea._id} idea={idea} />
                ))}
              </div>
            )}
          </section>

          <section className="dashboard-section">
            <h2>Pending Collaboration Requests ({collabRequests.length})</h2>
            {collabRequests.length === 0 ? (
              <p className="text-muted">No pending requests.</p>
            ) : (
              <div className="requests-list">
                {collabRequests.map((req) => (
                  <div key={req._id} className="request-card">
                    <div>
                      <strong>{req.requester?.name}</strong> wants to collaborate on{" "}
                      <Link to={`/ideas/${req.idea?._id || req.idea}`}>
                        {req.idea?.title || "an idea"}
                      </Link>
                    </div>
                    <p className="text-muted">{req.message}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}

      {/* ===== INVESTOR DASHBOARD ===== */}
      {user?.role === "investor" && (
        <>
          <section className="dashboard-section">
            <div className="section-header">
              <h2>Trending Ideas</h2>
              <Link to="/investors" className="btn btn-outline btn-sm">
                Browse All
              </Link>
            </div>
            <div className="ideas-grid">
              {trendingIdeas.map((idea) => (
                <IdeaCard key={idea._id} idea={idea} />
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <h2>My Investment Interests ({investments.length})</h2>
            {investments.length === 0 ? (
              <p className="text-muted">You haven't expressed interest in any ideas yet.</p>
            ) : (
              <div className="requests-list">
                {investments.map((inv) => (
                  <div key={inv._id} className="request-card">
                    <div>
                      <Link to={`/ideas/${inv.idea?._id || inv.idea}`}>
                        {inv.idea?.title || "Idea"}
                      </Link>
                    </div>
                    <span className={`status-badge status-${inv.status}`}>{inv.status}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {bookmarks.length > 0 && (
            <section className="dashboard-section">
              <h2>Bookmarked Ideas ({bookmarks.length})</h2>
              <div className="ideas-grid">
                {bookmarks.map((idea) => (
                  <IdeaCard key={idea._id} idea={idea} />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* ===== COLLABORATOR DASHBOARD ===== */}
      {user?.role === "collaborator" && (
        <>
          <section className="dashboard-section">
            <h2>Explore Trending Ideas</h2>
            <div className="ideas-grid">
              {trendingIdeas.map((idea) => (
                <IdeaCard key={idea._id} idea={idea} />
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <h2>My Collaboration Requests ({collabRequests.length})</h2>
            {collabRequests.length === 0 ? (
              <p className="text-muted">You haven't sent any collaboration requests yet.</p>
            ) : (
              <div className="requests-list">
                {collabRequests.map((req) => (
                  <div key={req._id} className="request-card">
                    <div>
                      <Link to={`/ideas/${req.idea?._id || req.idea}`}>
                        {req.idea?.title || "Idea"}
                      </Link>
                    </div>
                    <span className={`status-badge status-${req.status}`}>{req.status}</span>
                    <p className="text-muted">{req.message}</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;
