import React from "react";
import { Link } from "react-router-dom";
import { RiLightbulbFlashLine } from "react-icons/ri";

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <RiLightbulbFlashLine /> IdeaNest
          </Link>
          <p>Your central hub for idea creation, collaboration, and validation.</p>
        </div>
        <div className="footer-links">
          <div>
            <h4>Platform</h4>
            <Link to="/">Home</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
          <div>
            <h4>Features</h4>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/submit-idea">Submit Idea</Link>
            <Link to="/investors">Investors</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} IdeaNest. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
