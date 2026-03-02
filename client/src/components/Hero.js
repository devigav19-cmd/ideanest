import React from "react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="landing-hero">
      <div className="landing-hero__orb landing-hero__orb--1" />
      <div className="landing-hero__orb landing-hero__orb--2" />
      <div className="landing-hero__content">
        <h1 className="landing-hero__title">
          Turn Your Ideas Into <span>Reality</span>
        </h1>
        <p className="landing-hero__subtitle">
          IdeaNest is a collaborative platform where creators share ideas,
          get feedback, find collaborators, and connect with investors.
        </p>
        <div className="landing-hero__actions">
          <Link to="/register" className="landing-btn landing-btn--primary">
            Get Started Free
          </Link>
          <Link to="/login" className="landing-btn landing-btn--outline">
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Hero;
