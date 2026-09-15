# ⚡ CF Worker Insights

A modern, high-density real-time observability dashboard for monitoring **Cloudflare Workers**. Track daily free tier quotas, CPU execution budgets, latency distributions (P50/P90/P99), HTTP status codes, edge geographic distribution, and client invocation logs with Cloudflare Ray IDs.

---

### 📊 Build & Deployment Stats

| Metric | Status / Value | Details |
|---|---|---|
| **CI Build Status** | ![Build Passing](https://img.shields.io/badge/build-passing-brightgreen?style=flat-square&logo=github-actions&logoColor=white) | GitHub Actions automated test & typecheck pipeline |
| **Vercel Deploy** | ![Vercel Ready](https://img.shields.io/badge/Vercel-ready-black?style=flat-square&logo=vercel&logoColor=white) | Zero-config serverless proxy + Vite SPA |
| **Netlify Deploy** | ![Netlify Ready](https://img.shields.io/badge/Netlify-ready-00C7B7?style=flat-square&logo=netlify&logoColor=white) | Serverless functions (`netlify/functions/server.ts`) |
| **Cloudflare Pages** | ![Pages Ready](https://img.shields.io/badge/Cloudflare_Pages-ready-F38020?style=flat-square&logo=cloudflare&logoColor=white) | Direct edge static assets deployment |
| **TypeScript Strictness** | ![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict_Checked-3178C6?style=flat-square&logo=typescript&logoColor=white) | 0 compilation errors, 100% type safety |
| **Linter Status** | ![Lint Passing](https://img.shields.io/badge/lint-passing-brightgreen?style=flat-square) | Passed `tsc --noEmit` & static analysis |
| **Bundle Efficiency** | ![Vite Gzip](https://img.shields.io/badge/bundle-optimized-blueviolet?style=flat-square&logo=vite&logoColor=white) | Tree-shaken ESM, vendor-split, ~278 kB gzip |
| **Runtime Target** | ![Node 20+](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=nodedotjs&logoColor=white) | Node.js 20 LTS & modern browser ES2022 |

---

## 🚀 One-Click Deploy

Deploy your own instance of CF Worker Insights in seconds to your preferred platform:

### 1. Deploy with Vercel (Recommended)

Click the button below to fork and deploy directly to Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-username%2Fcf-worker-insights&env=CLOUDFLARE_API_TOKEN,CLOUDFLARE_ACCOUNT_ID&envDescription=Enter%20your%20Cloudflare%20API%20credentials%20for%20worker%20telemetry&project-name=cf-worker-insights)

- Pre-configured with `vercel.json` and `/api/index.ts` serverless functions.
- Securely proxies calls to Cloudflare GraphQL API without exposing tokens to the client.

### 2. Deploy with Netlify

Click the button below to fork and deploy to Netlify:

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/your-username/cf-worker-insights)

- Pre-configured with `netlify.toml` and `netlify/functions/server.ts`.
- Automatically mounts serverless endpoints for live Cloudflare metrics.

### 3. Deploy with Cloudflare Pages

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/your-username/cf-worker-insights)

- Direct static deployment to Cloudflare's global edge network.
- Build settings:
  - **Build Command**: `npm run build`
  - **Build Output Directory**: `dist`
  - **Node.js Version**: `20`

---

## ✨ Key Features

- ⏱️ **Free Tier & Quota Sentinel**: Live circular progress tracking your daily 100,000 requests limit, remaining capacity, and exact UTC countdown to the 00:00 UTC quota reset.
- ⚡ **CPU Execution Time & Latency Metrics**: Real-time evaluation against the 10 ms Free Tier threshold, tracking P50, P90, and P99 tail latency percentiles.
- 📈 **Interactive Request Timeline**: Multi-series area chart tracking 2xx Success, 4xx Client Error, and 5xx/1042 Worker Exception invocations.
- 🍩 **HTTP Status Breakdown**: Interactive donut chart categorizing status codes (200, 401, 429, 500, 1042) with cross-filtering support.
- 🌍 **Geographic Edge Colos**: Top traffic regions with ISO flags, percentage share of global traffic, and edge latency benchmarks.
- 🔍 **Client Analytics Event Log**: Real-time invocation stream with masked IPs (`198.51.***.42`), Cloudflare Ray IDs, HTTP methods, device user-agents, TLS versions, and expandable request diagnostics.
- 🧪 **Live GraphQL Query Inspector & Edge Sandbox**: Built-in viewer for Cloudflare's `workersInvocationsAdaptive` GraphQL schema and triggers to simulate traffic spikes and worker error surges.
- 🌗 **Adaptive Theme**: High-contrast dark and light modes styled with Tailwind CSS.

---

## 🔗 Environment Variables Configuration

Set these environment variables in your deployment dashboard (Vercel Project Settings, Netlify Site Configuration, or local `.env` file):

| Variable Name | Required | Description | Example |
|---|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Yes | Cloudflare API Token with `Account.Analytics: Read` and `Workers Scripts: Read` | `cfut_...` |
| `CLOUDFLARE_ACCOUNT_ID` | Yes | 32-character Cloudflare Account Tag ID | `59b4d522e7c39647242811ed9584432f` |
| `CLOUDFLARE_DEFAULT_WORKER` | No | Default worker script to load initially | `speed-cloudflare-com` |

---

## 📁 Repository Structure & Deployment Files

```
cf-worker-insights/
├── api/
│   └── index.ts                 # Vercel Serverless Function entrypoint
├── netlify/
│   └── functions/
│       └── server.ts            # Netlify Serverless Function entrypoint
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated GitHub Actions CI/CD pipeline
├── src/                         # React 19 Frontend Dashboard
│   ├── components/              # Charts, KPI cards, tables & GraphQL modal
│   ├── data/                    # Type definitions and fallback data generators
│   └── App.tsx                  # Main application orchestrator
├── server.ts                    # Full-Stack Express Server (Node.js & Local Dev)
├── vercel.json                  # Vercel deployment configuration & routing rules
├── netlify.toml                 # Netlify deployment configuration & redirect rules
├── vite.config.ts               # Vite build configuration with Tailwind v4
└── package.json                 # Scripts and dependencies
```

---

## 💻 Local Development

Clone the repository and run the local development server:

```bash
# 1. Clone repository
git clone https://github.com/your-username/cf-worker-insights.git
cd cf-worker-insights

# 2. Install dependencies
npm install

# 3. Create .env file with your Cloudflare API credentials
cp .env.example .env

# 4. Start local development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts development server on port 3000 |
| `npm run build` | Compiles production assets into `/dist` and bundles server for production |
| `npm run start` | Boots production server (`node dist/server.cjs`) |
| `npm run lint` | Runs TypeScript compiler checks (`tsc --noEmit`) |
| `npm run clean` | Cleans build artifacts |

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
