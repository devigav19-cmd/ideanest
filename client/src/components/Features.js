import React from "react";

const features = [
  {
    icon: "💡",
    title: "Idea Validation",
    desc: "Users can test and refine ideas with community feedback.",
  },
  {
    icon: "🤝",
    title: "Collaboration",
    desc: "Find teammates and build projects together.",
  },
  {
    icon: "📈",
    title: "Growth Tracking",
    desc: "Track the development of your idea over time.",
  },
  {
    icon: "🔒",
    title: "Secure Platform",
    desc: "Your ideas are safe and protected with us.",
  },
];

function Features() {
  return (
    <section className="landing-features">
      <h2 className="landing-features__title">Why IdeaNest?</h2>
      <div className="landing-features__grid">
        {features.map((f, i) => (
          <div className="landing-features__card" key={i}>
            <span className="landing-features__icon">{f.icon}</span>
            <h3 className="landing-features__card-title">{f.title}</h3>
            <p className="landing-features__card-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Features;
