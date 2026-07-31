import { useState } from "react";
import IdeaInput from "./components/IdeaInput";
import ResearchFeed from "./components/ResearchFeed";
import PanelDebate from "./components/PanelDebate";
import FinalReport from "./components/FinalReport";
import "./App.css";

// The 4 screens of the app
const SCREENS = {
  INPUT: "input",
  RESEARCH: "research",
  PANEL: "panel",
  REPORT: "report",
};

export default function App() {
  const [screen, setScreen] = useState(SCREENS.INPUT);
  const [idea, setIdea] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(ideaText) {
    setIdea(ideaText);
    setError(null);
    setScreen(SCREENS.RESEARCH); // Go to live feed screen

    try {
      const response = await fetch("https://startup-idea-validator-uewv.onrender.com/api/validate",{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: ideaText }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data);
      setScreen(SCREENS.PANEL); // Move to panel debate
    } catch (err) {
      setError(err.message);
      setScreen(SCREENS.INPUT); // Go back to input on error
    }
  }

  function handleViewReport() {
    setScreen(SCREENS.REPORT);
  }

  function handleReset() {
    setScreen(SCREENS.INPUT);
    setIdea("");
    setResult(null);
    setError(null);
  }

  return (
    <div className="app">
      {screen === SCREENS.INPUT && (
        <IdeaInput onSubmit={handleSubmit} error={error} />
      )}
      {screen === SCREENS.RESEARCH && (
        <ResearchFeed idea={idea} />
      )}
      {screen === SCREENS.PANEL && result && (
        <PanelDebate result={result} onViewReport={handleViewReport} onReset={handleReset} />
      )}
      {screen === SCREENS.REPORT && result && (
        <FinalReport result={result} onReset={handleReset} />
      )}
    </div>
  );
}
