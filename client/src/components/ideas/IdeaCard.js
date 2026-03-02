import React from "react";
import { Link } from "react-router-dom";
import { FiThumbsUp, FiThumbsDown, FiEye, FiStar } from "react-icons/fi";

function IdeaCard({ idea }) {
  const stageColors = {
    Concept: "#6366f1",
    Prototype: "#f59e0b",
    MVP: "#10b981",
    Scaling: "#ef4444",
  };

  return (
    <div className="idea-card">
      <div className="idea-card-header">
        <span
          className="idea-stage-badge"
          style={{ backgroundColor: stageColors[idea.stage] || "#6366f1" }}
        >
          {idea.stage}
        </span>
        <span className="idea-category">{idea.category}</span>
      </div>

      <Link to={`/ideas/${idea._id}`} className="idea-card-title">
        {idea.title}
      </Link>

      <p className="idea-card-desc">
        {idea.description?.substring(0, 120)}
        {idea.description?.length > 120 ? "..." : ""}
      </p>

      {idea.tags && idea.tags.length > 0 && (
        <div className="idea-tags">
          {idea.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="idea-tag">#{tag}</span>
          ))}
        </div>
      )}

      <div className="idea-card-footer">
        <div className="idea-stats">
          <span className="stat">
            <FiThumbsUp /> {idea.upvotes?.length || 0}
          </span>
          <span className="stat">
            <FiThumbsDown /> {idea.downvotes?.length || 0}
          </span>
          <span className="stat">
            <FiEye /> {idea.views || 0}
          </span>
          <span className="stat">
            <FiStar /> {idea.averageRating || 0}
          </span>
        </div>
        <div className="idea-author">
          by <strong>{idea.author?.name || "Unknown"}</strong>
        </div>
      </div>
    </div>
  );
}

export default IdeaCard;
