# Hosting decision research

Current founder decision: always use Nex2i GitHub + the existing Netlify account + Ryan's Render workspace + a unique `<idea-slug>.nex2i.com` domain. Customer-ready durability is mandatory; missing budget is a release blocker. The alternatives below are historical research, not permission to select another deployment path. See [the execution runbook](mvp-runbook.md).

Research date: 2026-10-03. Prices and quotas are current source claims, not account-specific guarantees. Check the actual account plan before provisioning.

| Path | Cash cost at small scale | What works | Material limitation |
| --- | --- | --- | --- |
| Netlify Free + Render Free web and Postgres | $0 infrastructure within quotas | Fast public experiment, managed deploys, little server upkeep | Render Free Postgres expires after 30 days and has no backups; Free web spins down after 15 minutes. Netlify Free has 300 monthly credits and pauses at its hard limit. |
| Netlify Free + paid Render web/Postgres | Roughly $13/month for entry web plus database, before growth | Managed persistent stack and less server work | More expensive per separate MVP; cross-site authentication needs same-origin proxy or shared domain. Verify actual plan and database backup terms. |
| Self-hosted Coolify on one VPS | Coolify software $0 + VM, domain, email, off-server backups | Persistent Postgres, Git deploys, several small MVPs on one server, one-origin routing | You operate OS, Docker, Coolify, database, security, backups, restores, and outage response. One small VM is a single failure domain. |
| Coolify Cloud + VPS | $5/month Coolify base plus VM and other services | Managed Coolify control plane | You still operate the VM and app data. This is not an all-inclusive $5 hosting plan. |

Coolify documents a **2 vCPU, 2 GB RAM, 10 GB disk minimum for Coolify itself**. A VM at that minimum leaves little room for Postgres and multiple apps; size for the combined workloads. Hetzner's June 2026 published CX23 price table lists about €5.49/month EU or $6.49/month US, but its product page currently flags CX23 as unavailable, so do not budget on actually obtaining that exact SKU. A VM quote must be checked in the chosen region. [Coolify minimum](https://coolify.io/docs/start-with-self-hosted), [Hetzner price adjustment](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/), [Hetzner availability](https://www.hetzner.com/cloud/cost-optimized/)

**Selected deployment:** Netlify + Render in the established founder accounts. Free, expiring resources may support development but do not satisfy customer persistence and backup gates. Establish approved durable capacity before customer release. Coolify/other providers are not the selected path unless the founder explicitly changes that decision.

## Cost and operational assumptions

- Email: Resend currently lists a Free tier of 3,000 emails/month and 100/day; it still needs a verified domain and is a separate provider. [Resend pricing](https://resend.com/pricing)
- Backups: Coolify can schedule database dumps and send them to S3-compatible storage, but an on-VM backup does not protect against VM loss. A restore test is necessary. [Coolify backup docs](https://coolify.io/docs/databases/backups)
- Netlify: Free is 300 credits/month, with 15 credits per production deploy, plus bandwidth and requests. Publishing many MVPs from one Netlify team shares that budget. [Netlify pricing](https://www.netlify.com/pricing/)
- GitHub Actions: standard hosted runner minutes are free for public repos; a private Free organization has 2,000 minutes/month. [GitHub billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- AI research and coding: the [Codex GitHub Action](https://github.com/openai/codex-action) requires an API key. That usage is separate from the hosting free tiers and should be opt-in with a spending cap.

## Deployment shape

Prefer a **single browser origin**. With Netlify + Render, proxy `/api/*` through Netlify to Render and set the authentication base URL to the public Netlify URL. With Coolify, route the frontend and API under one domain through its proxy. This avoids the third-party cookie problem of `*.netlify.app` calling `*.onrender.com` directly. [Better Auth cookie guidance](https://better-auth.com/docs/concepts/cookies), [Netlify proxy docs](https://docs.netlify.com/manage/routing/redirects/rewrites-proxies/)

Do not put a Coolify VM order or paid account change on autopilot. Provision only after a concrete VM quote, region, budget, backup destination, and target domain are selected.
