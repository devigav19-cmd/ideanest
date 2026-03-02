import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiThumbsUp,
  FiThumbsDown,
  FiStar,
  FiEye,
  FiBookmark,
  FiSend,
  FiUsers,
  FiDollarSign,
  FiTrash2,
} from "react-icons/fi";
import { AuthContext } from "../context/AuthContext";
import ideaService from "../services/ideaService";
import commentService from "../services/commentService";
import collaborationService from "../services/collaborationService";
import investmentService from "../services/investmentService";
import userService from "../services/userService";
import Spinner from "../components/common/Spinner";

function IdeaDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [idea, setIdea] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState("feedback");
  const [activeTab, setActiveTab] = useState("feedback");
  const [rating, setRating] = useState(0);
  const [collabMessage, setCollabMessage] = useState("");
  const [investMessage, setInvestMessage] = useState("");
  const [showCollabForm, setShowCollabForm] = useState(false);
  const [showInvestForm, setShowInvestForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadIdea();
    loadComments();
    // eslint-disable-next-line
  }, [id]);

  const loadIdea = async () => {
    try {
      setLoading(true);
      const res = await ideaService.getById(id);
      setIdea(res.data.data);
    } catch (err) {
      setError("Idea not found");
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async () => {
    try {
      const res = await commentService.getByIdea(id);
      setComments(res.data.data);
    } catch (err) {
      console.error("Failed to load comments");
    }
  };

  const handleUpvote = async () => {
    try {
      const res = await ideaService.upvote(id);
      setIdea(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownvote = async () => {
    try {
      const res = await ideaService.downvote(id);
      setIdea(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRate = async (score) => {
    try {
      setRating(score);
      const res = await ideaService.rate(id, score);
      setIdea(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBookmark = async () => {
    try {
      await userService.toggleBookmark(id);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      await commentService.create(id, { content: commentText, type: commentType });
      setCommentText("");
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.remove(commentId);
      loadComments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCollabRequest = async (e) => {
    e.preventDefault();
    try {
      await collaborationService.request({
        ideaId: id,
        message: collabMessage,
      });
      setShowCollabForm(false);
      setCollabMessage("");
      alert("Collaboration request sent!");
    } catch (err) {
      alert(err.message || "Failed to send request");
    }
  };

  const handleInvestInterest = async (e) => {
    e.preventDefault();
    try {
      await investmentService.sendInterest({
        ideaId: id,
        message: investMessage,
      });
      setShowInvestForm(false);
      setInvestMessage("");
      alert("Investment interest sent!");
    } catch (err) {
      alert(err.message || "Failed to send interest");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this idea?")) return;
    try {
      await ideaService.remove(id);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredComments = comments.filter((c) => c.type === activeTab);
  const isOwner = user && idea && user._id === (idea.author?._id || idea.author);
  const hasUpvoted = idea?.upvotes?.includes(user?._id);
  const hasDownvoted = idea?.downvotes?.includes(user?._id);

  if (loading) return <Spinner />;
  if (error) return <div className="error-page"><h2>{error}</h2></div>;
  if (!idea) return null;

  return (
    <div className="idea-details-page">
      {/* Header */}
      <div className="idea-detail-header">
        <div className="idea-meta-top">
          <span className="idea-stage-badge">{idea.stage}</span>
          <span className="idea-category">{idea.category}</span>
          <span className="idea-views"><FiEye /> {idea.views} views</span>
        </div>
        <h1>{idea.title}</h1>
        <div className="idea-author-info">
          <span>by <strong>{idea.author?.name || "Unknown"}</strong></span>
          <span className="text-muted">
            {new Date(idea.createdAt).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="idea-detail-body">
        <p>{idea.description}</p>

        {idea.tags?.length > 0 && (
          <div className="idea-tags">
            {idea.tags.map((tag, i) => (
              <span key={i} className="idea-tag">#{tag}</span>
            ))}
          </div>
        )}

        {idea.collaborators?.length > 0 && (
          <div className="collaborators-list">
            <h4>Collaborators:</h4>
            {idea.collaborators.map((c) => (
              <span key={c._id} className="collaborator-chip">{c.name}</span>
            ))}
          </div>
        )}
      </div>

      {/* Action Bar */}
      {user && (
        <div className="idea-actions-bar">
          <button
            className={`action-btn ${hasUpvoted ? "active-up" : ""}`}
            onClick={handleUpvote}
          >
            <FiThumbsUp /> {idea.upvotes?.length || 0}
          </button>
          <button
            className={`action-btn ${hasDownvoted ? "active-down" : ""}`}
            onClick={handleDownvote}
          >
            <FiThumbsDown /> {idea.downvotes?.length || 0}
          </button>

          <div className="rating-stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`star-btn ${star <= rating ? "star-active" : ""}`}
                onClick={() => handleRate(star)}
              >
                <FiStar />
              </button>
            ))}
            <span className="avg-rating">
              ({idea.averageRating || 0} avg)
            </span>
          </div>

          <button className="action-btn" onClick={handleBookmark}>
            <FiBookmark /> Bookmark
          </button>

          {!isOwner && (user?.role === "collaborator" || user?.role === "creator") && (
            <button
              className="action-btn"
              onClick={() => setShowCollabForm(!showCollabForm)}
            >
              <FiUsers /> Collaborate
            </button>
          )}

          {user?.role === "investor" && (
            <button
              className="action-btn"
              onClick={() => setShowInvestForm(!showInvestForm)}
            >
              <FiDollarSign /> Invest Interest
            </button>
          )}

          {(isOwner || user?.role === "admin") && (
            <button className="action-btn danger" onClick={handleDelete}>
              <FiTrash2 /> Delete
            </button>
          )}
        </div>
      )}

      {/* Collaboration Form */}
      {showCollabForm && (
        <div className="inline-form">
          <h3>Request Collaboration</h3>
          <form onSubmit={handleCollabRequest}>
            <textarea
              value={collabMessage}
              onChange={(e) => setCollabMessage(e.target.value)}
              placeholder="Explain how you'd like to collaborate..."
              rows={3}
              required
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Send Request
            </button>
          </form>
        </div>
      )}

      {/* Investment Form */}
      {showInvestForm && (
        <div className="inline-form">
          <h3>Express Investment Interest</h3>
          <form onSubmit={handleInvestInterest}>
            <textarea
              value={investMessage}
              onChange={(e) => setInvestMessage(e.target.value)}
              placeholder="Share your investment interest and questions..."
              rows={3}
              required
            />
            <button type="submit" className="btn btn-primary btn-sm">
              Send Interest
            </button>
          </form>
        </div>
      )}

      {/* Comments Section */}
      <div className="comments-section">
        <h2>Discussion & Feedback</h2>
        <div className="comment-tabs">
          <button
            className={`tab-btn ${activeTab === "feedback" ? "active" : ""}`}
            onClick={() => setActiveTab("feedback")}
          >
            Feedback ({comments.filter((c) => c.type === "feedback").length})
          </button>
          <button
            className={`tab-btn ${activeTab === "discussion" ? "active" : ""}`}
            onClick={() => setActiveTab("discussion")}
          >
            Discussion ({comments.filter((c) => c.type === "discussion").length})
          </button>
        </div>

        {user && (
          <form onSubmit={handleAddComment} className="comment-form">
            <select
              value={commentType}
              onChange={(e) => setCommentType(e.target.value)}
            >
              <option value="feedback">Feedback</option>
              <option value="discussion">Discussion</option>
            </select>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write your comment..."
              rows={3}
              required
            />
            <button type="submit" className="btn btn-primary btn-sm">
              <FiSend /> Post Comment
            </button>
          </form>
        )}

        <div className="comments-list">
          {filteredComments.length === 0 ? (
            <p className="text-muted">No {activeTab} comments yet. Be the first!</p>
          ) : (
            filteredComments.map((c) => (
              <div key={c._id} className="comment-card">
                <div className="comment-header">
                  <strong>{c.author?.name || "User"}</strong>
                  <span className="text-muted">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                  {(user?._id === c.author?._id || user?.role === "admin") && (
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDeleteComment(c._id)}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
                <p>{c.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default IdeaDetails;
