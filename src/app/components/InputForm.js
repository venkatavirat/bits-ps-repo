'use client';

import { useState, useEffect } from 'react';

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

/**
 * @param {{ onSubmit: Function; initialError?: string | null }} props
 */
export default function InputForm({ onSubmit, initialError }) {
  const [mode, setMode] = useState('url');
  const [input, setInput] = useState('');
  const [length, setLength] = useState('full');
  const [error, setError] = useState(initialError || null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialError) setError(initialError);
  }, [initialError]);

  function switchMode(next) {
    setMode(next);
    setInput('');
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const value = input.trim();

    if (!value) {
      setError(
        mode === 'url'
          ? 'Please enter a URL.'
          : 'Please paste some article text.'
      );
      return;
    }

    if (mode === 'url' && !isValidUrl(value)) {
      setError(
        'That does not look like a valid URL. Please include https:// at the start.'
      );
      return;
    }

    if (mode === 'text' && value.length < 80) {
      setError(
        'The article text is too short. Please paste at least a couple of paragraphs.'
      );
      return;
    }

    setSubmitting(true);
    await onSubmit({ input: value, inputType: mode, length });
    setSubmitting(false);
  }

  const wordCount =
    mode === 'text'
      ? input.trim().split(/\s+/).filter(Boolean).length
      : null;

  return (
    <>
      {/* Hero */}
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-eyebrow">AI-powered news translator</div>
        <h1 className="hero-title" id="hero-title">
          News that students
          <br />
          actually <span className="accent">want to read</span>
        </h1>
        <p className="hero-sub">
          Drop in a URL or paste article text. We extract the facts, rewrite in
          a natural student voice, then verify every claim stayed accurate.
        </p>
      </section>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        aria-label="Article input"
        noValidate
      >
        <div className="input-card">
          {/* Mode toggle */}
          <div
            className="mode-toggle"
            role="group"
            aria-label="Choose input type"
          >
            <button
              type="button"
              id="mode-url"
              className={`mode-btn${mode === 'url' ? ' active' : ''}`}
              onClick={() => switchMode('url')}
              aria-pressed={mode === 'url'}
            >
              Paste a URL
            </button>
            <button
              type="button"
              id="mode-text"
              className={`mode-btn${mode === 'text' ? ' active' : ''}`}
              onClick={() => switchMode('text')}
              aria-pressed={mode === 'text'}
            >
              Paste article text
            </button>
          </div>

          {/* Input area */}
          <div className="input-wrap">
            {mode === 'url' ? (
              <input
                id="url-field"
                type="url"
                className="url-input"
                placeholder="https://www.bbc.co.uk/news/..."
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  setError(null);
                }}
                aria-label="Article URL"
                autoComplete="url"
                spellCheck={false}
              />
            ) : (
              <textarea
                id="text-field"
                className="text-input"
                placeholder="Paste the full article text here..."
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  setError(null);
                }}
                aria-label="Article text"
                rows={8}
              />
            )}
          </div>

          {/* Footer options */}
          <div className="input-footer">
            <span className="input-hint" aria-live="polite">
              {mode === 'url'
                ? 'BBC, Reuters, Guardian, and most news sites work'
                : wordCount > 0
                ? `${wordCount} words`
                : 'Paste at least 2 paragraphs'}
            </span>

            <div
              className="length-toggle"
              role="group"
              aria-label="Output length"
            >
              <button
                type="button"
                id="length-quick"
                className={`length-btn${length === 'quick' ? ' active' : ''}`}
                onClick={() => setLength('quick')}
                aria-pressed={length === 'quick'}
              >
                Quick hit
              </button>
              <button
                type="button"
                id="length-full"
                className={`length-btn${length === 'full' ? ' active' : ''}`}
                onClick={() => setLength('full')}
                aria-pressed={length === 'full'}
              >
                Full take
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="submit-row">
            <button
              id="submit-btn"
              type="submit"
              className="submit-btn"
              disabled={submitting || !input.trim()}
            >
              {submitting ? (
                'Processing...'
              ) : (
                <>
                  Rewrite this article
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {error && (
            <p
              id="form-error"
              className="error-msg"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          )}
        </div>
      </form>
    </>
  );
}
