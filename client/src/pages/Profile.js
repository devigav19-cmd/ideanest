import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import userService from "../services/userService";
import Spinner from "../components/common/Spinner";

function Profile() {
  const { user, fetchUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    skills: "",
    portfolioLinks: "",
    areasOfInterest: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        bio: user.bio || "",
        skills: user.skills?.join(", ") || "",
        portfolioLinks: user.portfolioLinks?.join("\n") || "",
        areasOfInterest: user.areasOfInterest?.join(", ") || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s),
        portfolioLinks: formData.portfolioLinks
          .split("\n")
          .map((l) => l.trim())
          .filter((l) => l),
        areasOfInterest: formData.areasOfInterest
          .split(",")
          .map((a) => a.trim())
          .filter((a) => a),
      };
      await userService.updateProfile(payload);
      await fetchUser();
      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Spinner />;

  return (
    <div className="profile-page">
      <div className="form-card">
        <div className="profile-header">
          <div className="avatar-circle">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2>{user.name}</h2>
            <p className="role-badge">{user.role}</p>
            <p className="text-muted">{user.email}</p>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="form-group">
            <label htmlFor="skills">Skills (comma separated)</label>
            <input
              type="text"
              id="skills"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, UI Design"
            />
          </div>

          <div className="form-group">
            <label htmlFor="portfolioLinks">Portfolio / Links (one per line)</label>
            <textarea
              id="portfolioLinks"
              name="portfolioLinks"
              value={formData.portfolioLinks}
              onChange={handleChange}
              placeholder="https://github.com/username&#10;https://linkedin.com/in/username"
              rows={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="areasOfInterest">Areas of Interest (comma separated)</label>
            <input
              type="text"
              id="areasOfInterest"
              name="areasOfInterest"
              value={formData.areasOfInterest}
              onChange={handleChange}
              placeholder="e.g. AI, FinTech, CleanTech"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Saving..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
