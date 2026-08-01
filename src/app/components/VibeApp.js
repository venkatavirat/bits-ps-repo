'use client';

import { useState, useCallback } from 'react';
import InputForm from './InputForm';
import LoadingState from './LoadingState';
import ResultCard from './ResultCard';

/**
 * State machine:
 *   idle -> loading -> result
 *   idle -> loading -> error (returns to idle with error shown)
 */
export default function VibeApp() {
  const [state, setState] = useState({ status: 'idle', error: null });

  const handleSubmit = useCallback(async ({ input, inputType, length }) => {
    setState({ status: 'loading', error: null });

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, inputType, length }),
      });

      const data = await response.json();

      if (!response.ok) {
        setState({
          status: 'idle',
          error: data.error || 'Something went wrong. Please try again.',
        });
        return;
      }

      setState({ status: 'result', data, error: null });
    } catch {
      setState({
        status: 'idle',
        error:
          'Could not reach the server. Please check your connection and try again.',
      });
    }
  }, []);

  const handleReset = useCallback(() => {
    setState({ status: 'idle', error: null });
  }, []);

  return (
    <div className="page-shell">
      <header className="site-header" role="banner">
        <div className="site-header-inner">
          <a href="/" className="wordmark" aria-label="Vibe News home">
            <span className="wordmark-mark" aria-hidden="true">V</span>
            <span className="wordmark-text">
              vibe<span className="wordmark-dot">.</span>news
            </span>
          </a>
          <span className="site-tagline" aria-hidden="true">
            news, but actually readable
          </span>
        </div>
      </header>

      <main className="main-content" id="main" role="main">
        <div className="content-col">
          {state.status === 'idle' && (
            <InputForm
              onSubmit={handleSubmit}
              initialError={state.error}
            />
          )}
          {state.status === 'loading' && <LoadingState />}
          {state.status === 'result' && (
            <ResultCard data={state.data} onReset={handleReset} />
          )}
        </div>
      </main>

      <footer className="site-footer" role="contentinfo">
        <div>Vibe News</div>
        <div>Powered by the Gemini API.</div>
      </footer>
    </div>
  );
}
