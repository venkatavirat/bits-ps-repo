import { useState } from "react";
import "./PanelDebate.css";

const PERSONA_CONFIG = {
  vc: {
    name: "Venture Capitalist",
    emoji: "🏦",
    color: "var(--vc)",
    dim: "var(--vc-dim)",
    glow: "var(--vc-glow)",
    title: "Focused on market size, moat & returns",
  },
  pm: {
    name: "Product Manager",
    emoji: "🛠️",
    color: "var(--pm)",
    dim: "var(--pm-dim)",
    glow: "var(--pm-glow)",
    title: "Focused on execution, MVP & user journey",
  },
  customer: {
    name: "Target Customer",
    emoji: "👤",
    color: "var(--customer)",
    dim: "var(--customer-dim)",
    glow: "var(--customer-glow)",
    title: "Focused on real value & willingness to pay",
  },
};

const SENTIMENT_COLORS = {
  excited: "#10C79A",
  cautious: "#F6C90E",
  skeptical: "#F59E0B",
  negative: "#F56565",
};

export default function PanelDebate({ result, onViewReport, onReset }) {
  const [round, setRound] = useState(1);
  const { stages } = result;

  return (
    <div className="panel-screen">
      <div className="panel-bg" />

      {/* Top bar */}
      <div className="panel-topbar">
        <div className="panel-topbar-left">
          <span className="panel-logo">⚡ Validator</span>
          <span className="panel-idea-preview">
            "{result.idea.length > 50 ? result.idea.substring(0, 50) + "..." : result.idea}"
          </span>
        </div>
        <div className="panel-topbar-right">
          <button className="btn-ghost" onClick={onReset}>← New Idea</button>
          <button className="btn-primary" onClick={onViewReport}>View Full Report →</button>
        </div>
      </div>

      <div className="panel-content">
        {/* Title */}
        <div className="panel-title-section">
          <h2 className="panel-title">The Panel Debate</h2>
          <p className="panel-subtitle">Three evaluators. Two rounds. Real friction.</p>

          {/* Round toggle */}
          <div className="round-toggle">
            <button
              className={`round-btn ${round === 1 ? "active" : ""}`}
              onClick={() => setRound(1)}
            >
              Round 1 — Independent Takes
            </button>
            <button
              className={`round-btn ${round === 2 ? "active" : ""}`}
              onClick={() => setRound(2)}
            >
              Round 2 — Reactions
            </button>
          </div>
        </div>

        {/* Market context bar */}
        <div className="market-bar">
          <div className="market-item">
            <span className="market-label">Market</span>
            <span className="market-value">{stages.market.market_size.split(",")[0]}</span>
          </div>
          <div className="market-divider" />
          <div className="market-item">
            <span className="market-label">Trend</span>
            <span className="market-value">{stages.market.market_trend.split(".")[0]}</span>
          </div>
          <div className="market-divider" />
          <div className="market-item">
            <span className="market-label">Top Competitor</span>
            <span className="market-value">{stages.market.competitors[0]?.name?.split("(")[0]?.trim()}</span>
          </div>
        </div>

        {/* Persona cards */}
        <div className="personas-grid">
          {Object.entries(PERSONA_CONFIG).map(([key, config]) => {
            const r1 = stages.round1[key];
            const r2 = stages.round2[key];

            return (
              <div
                key={key}
                className="persona-card"
                style={{ "--persona-color": config.color, "--persona-dim": config.dim, "--persona-glow": config.glow }}
              >
                {/* Card header */}
                <div className="persona-header">
                  <div className="persona-avatar">
                    <span>{config.emoji}</span>
                  </div>
                  <div className="persona-info">
                    <div className="persona-name">{config.name}</div>
                    <div className="persona-title">{config.title}</div>
                  </div>
                  <div className="persona-score">
                    <span className="score-num" style={{ color: config.color }}>
                      {round === 1 ? r1.confidence_score : r2.revised_confidence}
                    </span>
                    <span className="score-label">/10</span>
                  </div>
                </div>

                {round === 1 ? (
                  <div className="persona-body">
                    {/* Sentiment badge */}
                    <div className="sentiment-row">
                      <span
                        className="sentiment-badge"
                        style={{
                          background: `${SENTIMENT_COLORS[r1.overall_sentiment]}20`,
                          color: SENTIMENT_COLORS[r1.overall_sentiment],
                          border: `1px solid ${SENTIMENT_COLORS[r1.overall_sentiment]}40`,
                        }}
                      >
                        {r1.overall_sentiment}
                      </span>
                    </div>

                    {/* Verdict */}
                    <p className="persona-verdict">"{r1.one_line_verdict}"</p>

                    {/* Strengths */}
                    <div className="persona-section">
                      <div className="section-label strengths-label">Strengths</div>
                      {r1.key_strengths.map((s, i) => (
                        <div key={i} className="point-item strength-item">
                          <span className="point-dot">+</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>

                    {/* Concerns */}
                    <div className="persona-section">
                      <div className="section-label concerns-label">Concerns</div>
                      {r1.key_concerns.map((c, i) => (
                        <div key={i} className="point-item concern-item">
                          <span className="point-dot">−</span>
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="persona-body">
                    {/* Revised verdict */}
                    <p className="persona-verdict">"{r2.revised_verdict}"</p>

                    {/* Agreements */}
                    {r2.agreements?.length > 0 && (
                      <div className="persona-section">
                        <div className="section-label strengths-label">Agrees with panel</div>
                        {r2.agreements.map((a, i) => (
                          <div key={i} className="point-item strength-item">
                            <span className="point-dot">✓</span>
                            <span>{a}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Disagreements */}
                    {r2.disagreements?.length > 0 && (
                      <div className="persona-section">
                        <div className="section-label concerns-label">Pushes back</div>
                        {r2.disagreements.map((d, i) => (
                          <div key={i} className="point-item concern-item">
                            <span className="point-dot">↩</span>
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* New insight */}
                    {r2.new_insight && (
                      <div className="new-insight">
                        <span className="insight-icon">💡</span>
                        <span>{r2.new_insight}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Panel summary row */}
        <div className="panel-summary-row">
          <div className="summary-card">
            <div className="summary-icon">🤝</div>
            <div>
              <div className="summary-label">Panel agrees on</div>
              <div className="summary-text">{stages.synthesis.panel_consensus}</div>
            </div>
          </div>
          <div className="summary-card tension">
            <div className="summary-icon">⚡</div>
            <div>
              <div className="summary-label">Biggest tension</div>
              <div className="summary-text">{stages.synthesis.panel_tension}</div>
            </div>
          </div>
        </div>

        <div className="panel-cta">
          <button className="btn-primary" onClick={onViewReport} style={{ padding: "14px 40px" }}>
            See the Full Report & SWOT →
          </button>
        </div>
      </div>
    </div>
  );
}
