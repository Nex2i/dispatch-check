import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { analyticsConsent, captureTelemetry, setAnalyticsConsent, startTelemetry, telemetryAvailable } from './telemetry';
import './style.css';

void startTelemetry();

function App() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState<'granted' | 'denied' | 'unset'>(analyticsConsent);

  function chooseAnalytics(granted: boolean) {
    if (setAnalyticsConsent(granted)) setConsent(granted ? 'granted' : 'denied');
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setState('sending');
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Please try again.');
      setState('success');
      setMessage('Thanks. You are on the list.');
      setEmail('');
      void captureTelemetry('waitlist_submit_succeeded');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Please try again.');
      void captureTelemetry('waitlist_submit_failed');
    }
  }

  return (
    <main>
      <nav><strong>Nex2i</strong><span>Idea → MVP</span></nav>
      <section className="hero">
        <p className="eyebrow">A focused experiment</p>
        <h1>One painful task.<br /><em>One useful result.</em></h1>
        <p className="lead">This is the reusable starting point. Replace this promise with the selected buyer’s job and show the accepted output before expanding the product.</p>
        <form onSubmit={submit}>
          <label htmlFor="email">Get launch updates</label>
          <div className="row">
            <input id="email" type="email" required placeholder="you@company.com" value={email} onChange={event => setEmail(event.target.value)} />
            <button disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Join waitlist'}</button>
          </div>
          <p className="status" role="status">{message}</p>
        </form>
      </section>
      <footer>
        <span>Built to test one commercial hypothesis at a time.</span>
        {telemetryAvailable && (
          <div className="analytics-choice">
            {consent === 'unset' ? (
              <><span>Allow anonymous usage analytics?</span><button type="button" onClick={() => chooseAnalytics(true)}>Allow</button><button type="button" onClick={() => chooseAnalytics(false)}>Decline</button></>
            ) : (
              <button type="button" onClick={() => chooseAnalytics(consent !== 'granted')}>{consent === 'granted' ? 'Disable analytics' : 'Enable analytics'}</button>
            )}
          </div>
        )}
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
