# QUSAI.DEV

> *I Don't Just Write Code. I Build The Future.*

Bilingual (**English LTR** / **Arabic RTL**) futuristic developer platform and interactive engineering laboratory built by **Qusai Omar Mohammed Ali**.

## Features & Labs

- **Home & Global Search (`/` + `Ctrl/Cmd+K`)**: Hero showcase, platform overview, and quick keyboard navigation (`Alt+1` through `Alt+9`).
- **AI Lab (`/ai-lab`)**: Streaming Gemini engineering assistant (`Ask`, `Explain`, `Debug`, `Architecture`) with conversation history, code context attachment, explicit error states, and transparent Offline Demo walkthroughs when no server API key is configured.
- **Developer Terminal (`/terminal`)**: Safe simulated interactive shell with command history (`help`, `about`, `projects`, `skills`, `contact`, `lang`, `clear`, section navigation).
- **Code Playground (`/playground`)**: Separate HTML, CSS, and JavaScript editors with syntax highlighting, isolated sandbox iframe preview, runtime error capture, copy actions, and fullscreen mode.
- **Developer Tools (`/dev-tools`)**: JSON formatter/validator, Base64 encoder/decoder, URL encoder/decoder, and text case/hash/binary converter.
- **Network Lab (`/network-lab`)**: Mathematically verified IPv4 subnet & CIDR calculator, usable host range calculator, binary octet inspector, and IPv6 address validator/expander.
- **Live Experiments (`/experiments`)**:
  - Interactive Network Topology & Packet Simulator
  - Sorting Algorithm Visualizer (Bubble, Selection, Insertion Sort)
  - Live CSS Visual Playground
  - Digital Logic Gate Lab (`AND`, `OR`, `NOT`, `XOR` with truth tables)
- **Developer Challenges (`/challenges`)**: Programming (Python, JavaScript, HTML/CSS) and Networking challenges with test evaluation, hints, step-by-step explanations, and a rotating Daily Challenge.
- **Knowledge Center (`/knowledge`)**: Bilingual engineering tutorials across programming and networking.
- **Projects (`/projects`), About (`/about`), & Contact (`/contact`)**: Portfolio case studies (`MikroNet`, `Well Manager`, `Hajezaty`, `Smart Exam Identity System`) and validated inquiry submission.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Motion
- **Backend / Serverless**: Express (`server.ts` for local/Node runtime) + Vercel Serverless Functions (`api/*.ts`), sharing core handlers in `server/platformCore.ts`
- **AI Integration**: Server-side `@google/genai` SDK (never exposed in client bundles)
- **Testing**: Vitest 5, Testing Library (`@testing-library/react`, `@testing-library/jest-dom`), jsdom

## Project Structure

```text
├── api/                     # Vercel Serverless Function endpoints (/api/*)
│   ├── ai/
│   │   ├── chat.ts          # POST /api/ai/chat (SSE streaming)
│   │   └── status.ts        # GET /api/ai/status
│   ├── contact.ts           # POST /api/contact
│   └── health.ts            # GET /api/health
├── server/
│   └── platformCore.ts      # Shared server-side validation & Gemini SDK handlers
├── server.ts                # Express server (Vite middleware in dev, dist/ + SPA fallback in prod)
├── src/
│   ├── assets/images/       # Visual assets copied to dist/src/assets during build
│   ├── components/          # UI sections & interactive labs
│   ├── data/                # Challenges, tutorials, projects, terminal/AI demos
│   ├── i18n/                # English (LTR) and Arabic (RTL) translations
│   ├── test/                # Unit & integration tests (40 tests)
│   ├── types/               # Shared TypeScript interfaces
│   └── utils/               # Networking math, dev tools, evaluators, logic/sorting engines
├── .env.example             # Environment variable template (no real secrets)
├── vercel.json              # Vercel build config & SPA routing rewrites
└── vite.config.ts           # Vite build configuration + asset copy plugin
```

## Local Development

### Prerequisites

- **Node.js** `>= 20.0.0` (tested on Node 22)
- **npm** `>= 10`

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` for local development (`.env` is gitignored):

```bash
cp .env.example .env
```

Set `GEMINI_API_KEY` in `.env` if you want live AI Lab responses locally. Leave it unset to run the platform with Offline Demo Mode and explicit status notices.

> **Security Note:** `GEMINI_API_KEY` is read strictly on the server (`server/platformCore.ts`). Do not prefix it with `VITE_` or reference it inside `src/`.

### 3. Run Development Server

```bash
npm run dev
```

Starts Express + Vite middleware at `http://localhost:3000`.

### 4. Run Tests, Type-Checking, and Production Build

```bash
# TypeScript type-check
npm run lint

# Automated unit & integration test suite (Vitest)
npm test

# Production build (outputs static bundle to dist/)
npm run build
```

To test the built `dist/` bundle locally via Express:

```bash
NODE_ENV=production npm start
```

## GitHub Export Checklist

1. Verify `.env` is **not** tracked (`git status` should never list `.env` or secret keys).
2. Confirm `npm run lint`, `npm test`, and `npm run build` all pass cleanly.
3. Push repository to GitHub:

```bash
git init
git add .
git commit -m "chore: prepare QUSAI.DEV for production deployment"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Deploying to Vercel

`vercel.json` is pre-configured for zero-friction Vercel deployment:

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | `Vite` |
| **Install Command** | `npm install` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Node.js Version** | `20.x` or `22.x` |

### Steps

1. Import your GitHub repository in the **Vercel Dashboard**.
2. Keep the detected Vite settings (`npm run build` -> `dist`). `vercel.json` automatically configures:
   - SPA routing rewrites (`/((?!api/|assets/|src/assets/|.*\..*).*)` -> `/index.html`) so direct refreshes on routes like `/network-lab`, `/ai-lab`, `/challenges`, and `/ar` routes work without 404 errors.
   - Serverless API routes under `/api/*` (`/api/health`, `/api/ai/status`, `/api/ai/chat`, `/api/contact`).
3. Add **`GEMINI_API_KEY`** in **Vercel Project Settings -> Environment Variables** (Production, Preview, Development as needed) to enable live Gemini streaming in the AI Lab.
4. Click **Deploy**.
