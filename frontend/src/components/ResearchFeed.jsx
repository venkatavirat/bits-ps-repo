import { useEffect, useState } from "react";
import "./ResearchFeed.css";

// Simulated status messages — shown while the real API runs
const FEED_STAGES = [
  { delay: 300,  text: "Reading your idea...", icon: "📋" },
  { delay: 1800, text: "Extracting the core problem statement", icon: "🔍" },
  { delay: 3500, text: "Mapping the market landscape", icon: "📊" },
  { delay: 5500, text: "Identifying real competitors", icon: "🎯" },
  { delay: 7500, text: "Briefing the Venture Capitalist", icon: "🏦" },
  { delay: 9000, text: "Briefing the Product Manager", icon: "🛠️" },
  { delay: 10500,text: "Briefing the Customer", icon: "👤" },
  { delay: 13000,text: "Panel debate — Round 1 underway", icon: "💬" },
  { delay: 18000,text: "Personas reacting to each other — Round 2", icon: "🔄" },
  { delay: 23000,text: "Synthesizing the final report...", icon: "🧠" },
];

export default function ResearchFeed({ idea }) {
  const [visibleLines, setVisibleLines] = useState([]);
  const [dots, setDots] = useState(".");

  useEffect(() => {
    // Show each line after its delay
    const timers = FEED_STAGES.map((stage) =>
      setTimeout(() => {
        setVisibleLines((prev) => [...prev, stage]);
      }, stage.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "." : d + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="feed-screen">
      <div className="feed-bg" />
      <div className="feed-orb" />

      <div className="feed-container">
        <div className="feed-header">
          <div className="feed-badge">
            <span className="pulse-dot" />
            <span>Running analysis</span>
          </div>
          <h2 className="feed-title">Evaluating your idea{dots}</h2>
          <p className="feed-idea">"{idea.length > 80 ? idea.substring(0, 80) + "..." : idea}"</p>
        </div>

        <div className="feed-terminal">
          <div className="terminal-header">
            <div className="terminal-dot" style={{ background: "#FF5F57" }} />
            <div className="terminal-dot" style={{ background: "#FEBC2E" }} />
            <div className="terminal-dot" style={{ background: "#28C840" }} />
            <span className="terminal-title">agent.log</span>
          </div>
          <div className="terminal-body">
            {visibleLines.map((line, i) => (
              <div key={i} className="feed-line">
                <span className="feed-line-icon">{line.icon}</span>
                <span className="feed-line-text">{line.text}</span>
                <span className="feed-line-check">✓</span>
              </div>
            ))}
            <div className="feed-cursor">
              <span className="feed-spinner">▋</span>
              <span className="feed-cursor-text">Processing</span>
            </div>
          </div>
        </div>

        <div className="feed-stages-bar">
          {["Problem", "Market", "Round 1", "Round 2", "Synthesis"].map((s, i) => (
            <div key={i} className="stage-pill">
              <div
                className="stage-fill"
                style={{
                  width: visibleLines.length > i * 2 ? "100%" : "0%",
                  transition: "width 1s ease",
                }}
              />
              <span>{s}</span>
            </div>
          ))}
        </div>

        <p className="feed-note">
          This usually takes 20–40 seconds. The panel is working through your idea carefully.
        </p>
      </div>
    </div>
  );
}
