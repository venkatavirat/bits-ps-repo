import { useState } from "react";
import "./IdeaInput.css";

export default function IdeaInput({ onSubmit, error }) {
  const [idea, setIdea] = useState("");

  function handleSubmit() {
    if (idea.trim().length < 10) return;
    onSubmit(idea.trim());
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  }

  const examples = [
    "An AI tool that helps small restaurants reduce food waste by predicting daily demand",
    "A marketplace connecting retired professionals with startups that need part-time mentorship",
    "An app that gamifies habit building for college students using social accountability",
  ];

  return (
    <div className="input-screen">
      {/* Background grid */}
      <div className="grid-bg" />

      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div className="input-container">
        {/* Header */}
        <div className="input-header">
          <div className="logo-badge">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Validator</span>
          </div>
          <h1 className="input-title">
            Your startup idea,<br />
            <span className="title-gradient">pressure tested.</span>
          </h1>
          <p className="input-subtitle">
            A VC, a PM, and your target customer walk into a room.
            They debate your idea — then tell you the truth.
          </p>
        </div>

        {/* Input box */}
        <div className="input-card">
          <label className="input-label">Describe your startup idea</label>
          <textarea
            className="idea-textarea"
            placeholder="e.g. An app that connects freelance chefs with busy professionals who want home-cooked meals..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={4}
          />
          <div className="input-footer">
            <span className="char-hint">
              {idea.length < 10 ? `${10 - idea.length} more characters needed` : `${idea.length} characters`}
            </span>
            <span className="shortcut-hint">⌘ + Enter to submit</span>
          </div>

          {error && <div className="error-banner">⚠ {error}</div>}

          <button
            className="btn-primary submit-btn"
            onClick={handleSubmit}
            disabled={idea.trim().length < 10}
          >
            Run the Panel →
          </button>
        </div>

        {/* Example ideas */}
        <div className="examples-section">
          <p className="examples-label">Try an example</p>
          <div className="examples-list">
            {examples.map((ex, i) => (
              <button
                key={i}
                className="example-chip"
                onClick={() => setIdea(ex)}
              >
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* What you get */}
        <div className="what-you-get">
          <div className="wyg-item">
            <span className="wyg-icon" style={{ color: "var(--vc)" }}>🏦</span>
            <span>VC perspective</span>
          </div>
          <div className="wyg-divider" />
          <div className="wyg-item">
            <span className="wyg-icon" style={{ color: "var(--pm)" }}>🛠️</span>
            <span>PM perspective</span>
          </div>
          <div className="wyg-divider" />
          <div className="wyg-item">
            <span className="wyg-icon" style={{ color: "var(--customer)" }}>👤</span>
            <span>Customer perspective</span>
          </div>
          <div className="wyg-divider" />
          <div className="wyg-item">
            <span className="wyg-icon" style={{ color: "#F6C90E" }}>📊</span>
            <span>SWOT + Score</span>
          </div>
        </div>
      </div>
    </div>
  );
}
