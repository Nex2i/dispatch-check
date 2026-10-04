# Reusable authentication design

**Preferred library for the current TypeScript scaffold:** Better Auth with its [username plugin](https://better-auth.com/docs/plugins/username), Postgres adapter, email/password flow, server-side sessions, email verification, and password reset. It directly supports the requested username login and email recovery. The app must provide a transactional email sender and migrations. [Better Auth email](https://better-auth.com/docs/concepts/email), [Postgres adapter](https://better-auth.com/docs/adapters/postgresql), [Fastify integration](https://better-auth.com/docs/integrations/fastify)

This is a selected implementation design, **not yet installed or shipped** in the scaffold. The current waitlist has no login and must not be used as a customer account system.

## Configuration contract

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection for app and auth tables |
| `BETTER_AUTH_SECRET` | Long random session and token secret; hosting secret, never public |
| `BETTER_AUTH_URL` | Public browser origin, including `/api/auth` routing |
| `APP_ORIGIN` | Exact allowed frontend origin |
| `RESEND_API_KEY` | Transactional email API key |
| `EMAIL_FROM` | Verified sender address |

Create the auth instance once in the API, not separately per feature. Set `emailAndPassword.enabled`, `requireEmailVerification`, `sendResetPassword`, `revokeSessionsOnPasswordReset`, `emailVerification.sendVerificationEmail`, the username plugin, explicit `baseURL`, and exact trusted origins. Generate and apply auth migrations before serving traffic. Better Auth's defaults include HttpOnly cookies and production Secure cookies; verify the deployed cookie attributes and keep CSRF/origin checks enabled. [Options](https://better-auth.com/docs/reference/options), [cookies](https://better-auth.com/docs/concepts/cookies)

The browser uses `/api/auth` on its own origin. Netlify's build creates an `/api/*` proxy rule from `NETLIFY_PROXY_ORIGIN`; Coolify routes it to the API container. This avoids third-party cookie loss in Safari. The server validates each protected request using the session API, then applies app-specific authorization. [Cross-domain cookie guidance](https://better-auth.com/docs/concepts/cookies)

The public origin for each MVP is `https://<idea-slug>.nex2i.com`. Set `BETTER_AUTH_URL` and `APP_ORIGIN` to that exact origin and route `/api/auth` to its API. Keep cookies host-only rather than setting `Domain=.nex2i.com`, so accounts and sessions do not leak between MVPs.

For login, allow a username and password. Registration still requires an email because verification and reset depend on it. Treat email as private and username as potentially visible. Rate-limit auth routes, use generic forgot-password responses, and log safe event metadata. These controls come from [OWASP Authentication](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html) and [Forgot Password](https://cheatsheetseries.owasp.org/cheatsheets/Forgot_Password_Cheat_Sheet.html); library support alone does not prove the deployed flow meets them.

If the API changes to C# later, ASP.NET Core Identity is a strong equivalent with email confirmation and reset support. Reuse the **behavior contract** above rather than assuming session tokens or database tables can be shared across frameworks. [Microsoft Identity guidance](https://learn.microsoft.com/en-us/aspnet/core/security/authentication/accconfirm?view=aspnetcore-10.0)
