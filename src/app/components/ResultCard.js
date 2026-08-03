'use client';

import { useState } from 'react';

const VERDICT_LABELS = {
  faithful: 'Factually accurate',
  mostly_faithful: 'Mostly accurate',
  distorted: 'Review recommended',
};

/** @param {{ data: object; onReset: () => void }} props */
export default function ResultCard({ data, onReset }) {
  const [view, setView] = useState('rewrite'); // 'rewrite' | 'compare'
  const [showFacts, setShowFacts] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    title = 'Untitled article',
    category,
    summary,
    facts = [],
    rewrite = '',
    means,
    readTime,
    guardrail = {},
    articleText,
  } = data;

  const verdict = guardrail.verdict || 'mostly_faithful';
  const score = guardrail.score ?? 85;
  const issues = guardrail.issues || [];

  async function handleCopy() {
    const textToCopy = means ? `${rewrite}\n\nFor you: ${means}` : rewrite;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable in this context
    }
  }

  return (
    <div className="result-shell">
      {/* Meta row */}
      <div className="result-meta">
        <div className="meta-left">
          {category && (
            <span
              className="category-badge"
              aria-label={`Category: ${category}`}
            >
              {category}
            </span>
          )}
          {readTime && (
            <span
              className="read-time"
              aria-label={`Reading time: ${readTime}`}
            >
              {readTime}
            </span>
          )}
        </div>

        <span
          className={`accuracy-badge ${verdict}`}
          title={`Fact-check score: ${score}/100`}
          aria-label={`Accuracy: ${VERDICT_LABELS[verdict]}, score ${score} out of 100`}
        >
          <svg
            width="11"
            height="11"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            {verdict === 'faithful' ? (
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path d="M12 9v4m0 4h.01M12 3a9 9 0 100 18A9 9 0 0012 3z" />
            )}
          </svg>
          {VERDICT_LABELS[verdict]}
        </span>
      </div>

      {/* Title and summary */}
      <h1 className="result-title">{title}</h1>
      {summary && <p className="result-summary">{summary}</p>}

      {/* View toggle (only when we have the original text for comparison) */}
      {articleText && (
        <div
          className="view-toggle"
          role="tablist"
          aria-label="Article view"
        >
          <button
            id="tab-rewrite"
            role="tab"
            aria-selected={view === 'rewrite'}
            className={`view-btn${view === 'rewrite' ? ' active' : ''}`}
            onClick={() => setView('rewrite')}
          >
            Rewrite
          </button>
          <button
            id="tab-compare"
            role="tab"
            aria-selected={view === 'compare'}
            className={`view-btn${view === 'compare' ? ' active' : ''}`}
            onClick={() => setView('compare')}
          >
            Compare original
          </button>
        </div>
      )}

      {/* Content panels */}
      {view === 'rewrite' ? (
        <div
          className="article-body"
          id="panel-rewrite"
          role="tabpanel"
          aria-labelledby="tab-rewrite"
        >
          {rewrite
            .split(/\n+/)
            .filter(Boolean)
            .map((para, i) => (
              <p key={i}>{para}</p>
            ))}

          {means && (
            <div className="means-card">
              <div className="means-label">What this means for you</div>
              <p>{means}</p>
            </div>
          )}
        </div>
      ) : (
        <div
          className="compare-grid"
          id="panel-compare"
          role="tabpanel"
          aria-labelledby="tab-compare"
        >
          <div>
            <div className="compare-col-label">Original article</div>
            <div className="compare-text">
              {articleText.length > 1600
                ? `${articleText.slice(0, 1600)}...`
                : articleText}
            </div>
          </div>
          <div>
            <div className="compare-col-label">Rewritten version</div>
            <div className="compare-text">
              {rewrite}
              {means && ` For you: ${means}`}
            </div>
          </div>
        </div>
      )}

      {/* Accuracy issues (only if distorted) */}
      {issues.length > 0 && verdict === 'distorted' && (
        <div className="issues-section" role="alert">
          <div className="issues-label">Accuracy notes</div>
          {issues.map((issue, i) => (
            <p key={i} className="issue-item">
              Claim: &ldquo;{issue.claim}&rdquo; - {issue.issue}
            </p>
          ))}
        </div>
      )}

      {/* Facts accordion */}
      <div className="facts-section">
        <button
          id="facts-toggle"
          type="button"
          className="facts-header"
          onClick={() => setShowFacts(v => !v)}
          aria-expanded={showFacts}
          aria-controls="facts-body"
        >
          <div className="facts-header-left">
            <span className="facts-title">Source facts used</span>
            <span className="facts-count">{facts.length} facts</span>
          </div>
          <svg
            className={`chev${showFacts ? ' open' : ''}`}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {showFacts && (
          <div className="facts-body" id="facts-body">
            <ul className="facts-list" aria-label="Extracted source facts">
              {facts.map((fact, i) => (
                <li key={i} className="fact-item">
                  <span className="fact-num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span>{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="result-actions">
        <button
          id="copy-btn"
          type="button"
          className="action-btn primary"
          onClick={handleCopy}
          aria-label={copied ? 'Copied to clipboard' : 'Copy the rewritten article'}
        >
          {copied ? (
            <>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              Copy article
            </>
          )}
        </button>

        <button
          id="reset-btn"
          type="button"
          className="action-btn"
          onClick={onReset}
          aria-label="Rewrite a different article"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M2.5 2v6h6M21.5 22v-6h-6" />
            <path d="M22 11.5A10 10 0 003.2 7.2M2 12.5a10 10 0 0018.8 4.3" />
          </svg>
          Rewrite another
        </button>
      </div>
    </div>
  );
}
