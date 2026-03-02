import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMenu, FiX, FiLogOut, FiUser, FiBell } from "react-icons/fi";
import { RiLightbulbFlashLine } from "react-icons/ri";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <RiLightbulbFlashLine className="logo-icon" />
          <span>IdeaNest</span>
        </Link>

        {/* Desktop Links */}
        <div className="navbar-links">
          {user && <Link to="/dashboard" className="nav-link">Dashboard</Link>}
          {user && <Link to="/submit-idea" className="nav-link">Submit Idea</Link>}
          {user && <Link to="/investors" className="nav-link">Investors</Link>}
          {user && user.role === "admin" && (
            <Link to="/admin" className="nav-link">Admin</Link>
          )}
        </div>

        {/* Auth Buttons */}
        <div className="navbar-auth">
          <Link to="/" className="nav-link">Home</Link>
          {user ? (
            <div className="user-menu">
              <Link to="/profile" className="nav-link user-link">
                <FiUser /> {user.name}
              </Link>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                <FiLogOut /> Logout
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link to="/" className="mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
          {user && <Link to="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
          {user && <Link to="/submit-idea" className="mobile-link" onClick={() => setMenuOpen(false)}>Submit Idea</Link>}
          {user && <Link to="/investors" className="mobile-link" onClick={() => setMenuOpen(false)}>Investors</Link>}
          {user && user.role === "admin" && (
            <Link to="/admin" className="mobile-link" onClick={() => setMenuOpen(false)}>Admin</Link>
          )}
          {user ? (
            <>
              <Link to="/profile" className="mobile-link" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button className="mobile-link" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-link" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
