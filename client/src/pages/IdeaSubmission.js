import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import ideaService from "../services/ideaService";

const categories = [
  "Technology",
  "Business",
  "Social Impact",
  "Education",
  "Healthcare",
  "Environment",
  "Other",
];

const stages = ["Concept", "Prototype", "MVP", "Scaling"];

function IdeaSubmission() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Technology",
    stage: "Concept",
    tags: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim() || !formData.description.trim()) {
      setError("Title and description are required");
      return;
    }

    if (formData.description.trim().length < 20) {
      setError("Description must be at least 20 characters");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        tags: formData.tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t),
      };
      const res = await ideaService.create(payload);
      navigate(`/ideas/${res.data.data._id}`);
    } catch (err) {
      setError(err.message || "Failed to submit idea");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="submission-page">
      <div className="form-card">
        <h2>Submit a New Idea</h2>
        <p className="text-muted">Share your idea with the community</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Idea Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Give your idea a catchy title"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your idea in detail — problem, solution, target audience..."
              rows={6}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="stage">Stage</label>
              <select
                id="stage"
                name="stage"
                value={formData.stage}
                onChange={handleChange}
              >
                {stages.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g. AI, sustainability, mobile app"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit Idea"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default IdeaSubmission;
