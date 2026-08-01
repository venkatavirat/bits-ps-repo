'use client';

import { useState, useEffect } from 'react';

const STEPS = [
  {
    label: 'Reading the article',
    desc: 'Fetching and extracting content from the source',
  },
  {
    label: 'Extracting the facts',
    desc: 'Identifying every key claim before any rewriting begins',
  },
  {
    label: 'Rewriting the story',
    desc: 'Translating into student-friendly language, facts intact',
  },
  {
    label: 'Checking accuracy',
    desc: 'Verifying the rewrite against all source facts',
  },
];

// Approximate times (ms) at which each subsequent step becomes active
const STEP_DELAYS = [1800, 5000, 9500];

export default function LoadingState() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timers = STEP_DELAYS.map((delay, i) =>
      setTimeout(() => setActiveStep(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      className="loading-shell"
      role="status"
      aria-live="polite"
      aria-label="Processing your article"
    >
      <div className="loading-header">
        <div className="loading-title">Working on it</div>
        <p className="loading-sub">This usually takes 15 to 25 seconds</p>
      </div>

      <div className="pipeline" role="list">
        {STEPS.map((step, i) => {
          const isDone = i < activeStep;
          const isActive = i === activeStep;
          const cls = `pipeline-step${isDone ? ' done' : isActive ? ' active' : ''}`;

          return (
            <div
              key={i}
              className={cls}
              role="listitem"
              aria-current={isActive ? 'step' : undefined}
            >
              <div className="step-indicator" aria-hidden="true">
                {isDone ? (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="step-num">{i + 1}</span>
                )}
              </div>

              <div className="step-body">
                <div className="step-label">
                  {step.label}
                  {isActive && (
                    <span
                      className="spinner"
                      aria-label="Loading"
                    />
                  )}
                </div>
                {isActive && (
                  <p className="step-desc">{step.desc}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
