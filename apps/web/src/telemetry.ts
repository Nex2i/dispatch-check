import type posthog from 'posthog-js';

const token = import.meta.env.VITE_POSTHOG_PROJECT_TOKEN?.trim();
const host = import.meta.env.VITE_POSTHOG_HOST?.trim();
const consentKey = 'nex2i:analytics-consent';
let initialized = false;
let client: typeof posthog | undefined;
let pending: Promise<typeof posthog | undefined> | undefined;

export const telemetryAvailable = Boolean(token && host);

export function analyticsConsent(): 'granted' | 'denied' | 'unset' {
  try {
    const value = localStorage.getItem(consentKey);
    return value === 'granted' || value === 'denied' ? value : 'unset';
  } catch {
    return 'unset';
  }
}

async function initialize(): Promise<typeof posthog | undefined> {
  if (!telemetryAvailable || analyticsConsent() !== 'granted') return;
  if (initialized) return client;
  pending ??= import('posthog-js').then(module => module.default).catch(() => undefined);
  const loaded = await pending;
  if (!loaded || analyticsConsent() !== 'granted') return;
  if (!initialized) {
    try {
      const url = new URL(host!);
      if (url.protocol !== 'https:') return;
      loaded.init(token!, {
        api_host: url.origin,
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_dead_clicks: false,
        capture_exceptions: false,
        capture_heatmaps: false,
        capture_performance: false,
        disable_session_recording: true,
        disable_surveys: true,
        advanced_disable_flags: true,
        ip: false,
        save_campaign_params: false,
        save_referrer: false,
        property_denylist: ['$current_url', '$referrer', '$initial_current_url', '$initial_referrer'],
        persistence: 'memory',
        person_profiles: 'identified_only'
      });
      loaded.opt_in_capturing();
      client = loaded;
      initialized = true;
    } catch {
      return;
    }
  }
  return client;
}

export async function startTelemetry(): Promise<void> {
  const loaded = await initialize();
  if (loaded && analyticsConsent() === 'granted') loaded.capture('landing_viewed');
}

export function setAnalyticsConsent(granted: boolean): boolean {
  try {
    localStorage.setItem(consentKey, granted ? 'granted' : 'denied');
  } catch {
    // Storage can be unavailable in private browsing; leave analytics disabled.
    return false;
  }
  if (granted) {
    if (client) client.opt_in_capturing();
    void startTelemetry();
  }
  else if (initialized) {
    client?.opt_out_capturing();
    client?.reset();
  }
  return true;
}

export async function captureTelemetry(event: 'waitlist_submit_succeeded' | 'waitlist_submit_failed'): Promise<void> {
  const loaded = await initialize();
  if (loaded && analyticsConsent() === 'granted') loaded.capture(event);
}
