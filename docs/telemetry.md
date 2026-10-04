# Optional PostHog telemetry

PostHog is installed in the web workspace but **disabled unless both** `VITE_POSTHOG_PROJECT_TOKEN` and `VITE_POSTHOG_HOST` are set at build time. Use one PostHog project per MVP so its events, retention, access, and budget stay separate. The project token is a browser-visible identifier, not a secret; never put a personal API key in a `VITE_` variable. Use the ingestion host shown in that project's setup page, such as `https://us.i.posthog.com` or `https://eu.i.posthog.com`. [PostHog React/JS setup](https://posthog.com/docs/libraries/react), [privacy guidance](https://posthog.com/docs/privacy)

The module at `apps/web/src/telemetry.ts` loads the SDK only after a visitor chooses **Allow**. It uses memory persistence, disables automatic clicks, pageviews, dead clicks, exceptions, heatmaps, performance capture, session replay, surveys, and remote flags, and never identifies a visitor. It excludes current and referring URLs from event properties and disables IP enrichment. A visitor can decline or later disable analytics. The app sends only these named product events (the SDK may also record its internal consent event):

| Event | When | Properties |
| --- | --- | --- |
| `landing_viewed` | A consented visitor loads the page or enables analytics | None |
| `waitlist_submit_succeeded` | The API accepts a waitlist submission | None |
| `waitlist_submit_failed` | The API rejects or cannot complete the submission | None |

Do not add email, username, password, URL query strings, form values, request bodies, reset tokens, or raw errors to events. When auth is implemented, use a non-email app user ID only if there is a justified need to identify users and the privacy policy and consent choice cover it. Keep server logs and product analytics separate: Render logs are for service diagnosis; PostHog measures product behavior. [PostHog anonymous events](https://posthog.com/docs/data/anonymous-vs-identified-events)

For each new MVP: create a PostHog project in the intended region, set the two Netlify build variables, trigger a new build, confirm an allowed page view and a successful task event in PostHog Live Events, and verify that **Decline** sends nothing. Define a small dashboard around the buyer task (arrival → task started → task accepted) and set a usage or billing limit before increasing event volume. Confirm your notice and consent approach for the locations and data you actually serve. [PostHog pricing](https://posthog.com/pricing)

The current demo is configured on Netlify with the Nex2i PostHog organization's unused default project and the US ingestion host. These deployment values are not committed. Create a separate PostHog project and set its token for each new MVP. The existing `ta.nex2i.com` DNS entry was not used because its PostHog project association was not verified.
