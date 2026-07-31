import "./FinalReport.css";

const RECOMMENDATION_CONFIG = {
  "Strong Pass": { color: "#10C79A", bg: "rgba(16,199,154,0.1)", border: "rgba(16,199,154,0.3)", icon: "🚀" },
  "Conditional Pass": { color: "#F6C90E", bg: "rgba(246,201,14,0.1)", border: "rgba(246,201,14,0.3)", icon: "⚡" },
  "Needs Rework": { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)", icon: "🔧" },
  "Pass": { color: "#F56565", bg: "rgba(245,101,101,0.1)", border: "rgba(245,101,101,0.3)", icon: "🚫" },
};

function ScoreBar({ label, value, color = "var(--accent)" }) {
  return (
    <div className="score-bar-row">
      <div className="score-bar-label">{label}</div>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <div className="score-bar-value" style={{ color }}>{value}</div>
    </div>
  );
}

export default function FinalReport({ result, onReset }) {
  const { stages } = result;
  const { synthesis } = stages;
  const rec = RECOMMENDATION_CONFIG[synthesis.investment_recommendation] || RECOMMENDATION_CONFIG["Conditional Pass"];

  const score = synthesis.pitch_readiness_score;
  const scoreColor = score >= 75 ? "#10C79A" : score >= 50 ? "#F6C90E" : "#F56565";

  return (
    <div className="report-screen">
      <div className="report-bg" />

      {/* Top bar */}
      <div className="report-topbar">
        <span className="panel-logo">⚡ Validator</span>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-ghost" onClick={() => window.history.back()}>← Panel</button>
          <button className="btn-ghost" onClick={onReset}>New Idea</button>
        </div>
      </div>

      <div className="report-content">
        {/* Hero section */}
        <div className="report-hero">
          <div className="report-hero-left">
            <div className="report-eyebrow">Final Evaluation Report</div>
            <h1 className="report-idea-title">
              {result.idea.length > 70 ? result.idea.substring(0, 70) + "..." : result.idea}
            </h1>
            <p className="report-problem">{stages.problem.problem_statement}</p>

            {/* Recommendation badge */}
            <div
              className="rec-badge"
              style={{ background: rec.bg, border: `1px solid ${rec.border}`, color: rec.color }}
            >
              <span>{rec.icon}</span>
              <span className="rec-text">{synthesis.investment_recommendation}</span>
            </div>
            <p className="rec-rationale">{synthesis.recommendation_rationale}</p>
          </div>

          {/* Score circle */}
          <div className="score-circle-container">
            <div className="score-circle" style={{ "--score-color": scoreColor }}>
              <svg viewBox="0 0 120 120" className="score-svg">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke={scoreColor}
                  strokeWidth="8"
                  strokeDasharray={`${(score / 100) * 327} 327`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                  style={{ transition: "stroke-dasharray 1.5s ease" }}
                />
              </svg>
              <div className="score-inner">
                <div className="score-number" style={{ color: scoreColor }}>{score}</div>
                <div className="score-denom">/100</div>
                <div className="score-tag">Pitch Ready</div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="score-breakdown">
              <ScoreBar label="Market Timing" value={synthesis.pitch_readiness_breakdown.market_timing} color="var(--vc)" />
              <ScoreBar label="Differentiation" value={synthesis.pitch_readiness_breakdown.differentiation} color="var(--pm)" />
              <ScoreBar label="Execution" value={synthesis.pitch_readiness_breakdown.execution_risk} color="var(--customer)" />
              <ScoreBar label="Clarity" value={synthesis.pitch_readiness_breakdown.founder_clarity} color="#F6C90E" />
            </div>
          </div>
        </div>

        {/* Biggest risk callout */}
        <div className="risk-callout">
          <div className="risk-label">⚠ Biggest Risk</div>
          <p className="risk-text">{synthesis.biggest_risk}</p>
        </div>

        {/* SWOT grid */}
        <div className="swot-section">
          <h3 className="section-heading">SWOT Analysis</h3>
          <div className="swot-grid">
            <div className="swot-card swot-strengths">
              <div className="swot-header">
                <span className="swot-icon">💪</span>
                <span className="swot-title">Strengths</span>
              </div>
              {synthesis.swot.strengths.map((s, i) => (
                <div key={i} className="swot-item">
                  <span className="swot-dot">+</span><span>{s}</span>
                </div>
              ))}
            </div>
            <div className="swot-card swot-weaknesses">
              <div className="swot-header">
                <span className="swot-icon">⚠️</span>
                <span className="swot-title">Weaknesses</span>
              </div>
              {synthesis.swot.weaknesses.map((s, i) => (
                <div key={i} className="swot-item">
                  <span className="swot-dot">−</span><span>{s}</span>
                </div>
              ))}
            </div>
            <div className="swot-card swot-opportunities">
              <div className="swot-header">
                <span className="swot-icon">🎯</span>
                <span className="swot-title">Opportunities</span>
              </div>
              {synthesis.swot.opportunities.map((s, i) => (
                <div key={i} className="swot-item">
                  <span className="swot-dot">→</span><span>{s}</span>
                </div>
              ))}
            </div>
            <div className="swot-card swot-threats">
              <div className="swot-header">
                <span className="swot-icon">🛡️</span>
                <span className="swot-title">Threats</span>
              </div>
              {synthesis.swot.threats.map((s, i) => (
                <div key={i} className="swot-item">
                  <span className="swot-dot">!</span><span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action plan */}
        <div className="action-section">
          <h3 className="section-heading">Founder Action Plan</h3>
          <p className="action-subtitle">Three concrete things to do this week</p>
          <div className="action-list">
            {synthesis.founder_action_plan.map((action, i) => (
              <div key={i} className="action-item">
                <div className="action-num">{i + 1}</div>
                <div className="action-text">{action}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="report-footer">
          <button className="btn-primary" onClick={onReset} style={{ padding: "14px 40px" }}>
            Validate Another Idea →
          </button>
        </div>
      </div>
    </div>
  );
}
