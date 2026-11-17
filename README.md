# QUSAI.DEV

Personal developer portfolio of **Qusai Omar Mohammed Ali** — *Programmer & Software Developer*.

Bilingual (**English LTR** / **Arabic RTL**) portfolio featuring responsive dark glassmorphism design, project showcases, technical skills, direct contact channels, and a server-backed Gemini AI Assistant.

## Sections

- **Home (`/`)**: Developer introduction, modern hero layout, and direct CTAs (**Explore My Projects** & **Contact Me**).
- **About (`/about`)**: Background as a Computer Science student and software developer, with skill cards covering **Flutter, Dart, Python, JavaScript, React, PHP, Laravel, MySQL, Firebase, and Networking**.
- **Projects (`/projects`)**: Showcase cards for **MikroNet**, **Well Manager**, **Hajezaty**, and **Smart Exam Identity System** with category filters and technology stacks.
- **AI Assistant (`/ai-assistant`)**: Bilingual conversational Gemini assistant powered via `/api/ai/chat` with streaming replies, session history, error handling, and a Clear Conversation control.
- **Contact (`/contact`)**: Direct **Email Me** (`mailto:hackone465@gmail.com`) and **WhatsApp Me** (`https://wa.me/967772350689`) actions plus a validated inquiry form (`/api/contact`).

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, Motion
- **Typography**: `Outfit` & `Plus Jakarta Sans` (English), `Cairo` (Arabic RTL), `JetBrains Mono`
- **Backend / Serverless**: Express (`server.ts` for local/Node runtime) + Vercel Serverless Functions (`api/*.ts`), sharing core handlers in `server/platformCore.ts`
- **AI Integration**: Server-side `@google/genai` SDK (`gemini-4-hydrogen`), never exposed in client bundles
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
│   ├── assets/images/       # Portfolio visuals copied to dist/src/assets during build
│   ├── components/          # Home, About, Projects, AI Assistant, Contact, Navbar, Footer
│   ├── data/                # Featured portfolio projects
│   ├── i18n/                # English (LTR) & Arabic (RTL) copy + skills list
│   ├── test/                # Portfolio integration tests
│   └── types/               # Shared TypeScript interfaces
├── .env.example             # Environment variable template (no real secrets)
├── vercel.json              # Vercel build config & SPA routing rewrites
└── vite.config.ts           # Vite build configuration + asset copy plugin
```

## Local Development

### Prerequisites

- **Node.js** `>= 20.0.0`
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

Set `GEMINI_API_KEY` in `.env` to enable live Gemini responses in the AI Assistant.

> **Security Note:** `GEMINI_API_KEY` is read strictly on the server (`server/platformCore.ts`). Never prefix it with `VITE_` or reference it in `src/`.

### 3. Run Development Server, Tests, Type-Check, and Build

```bash
# Start local Express + Vite dev server at http://localhost:3000
npm run dev

# TypeScript type-check
npm run lint

# Run automated tests
npm test

# Production build (outputs to dist/)
npm run build
```

## Deploying to Vercel & GitHub

`vercel.json` is configured for Vercel Vite deployments:

| Setting | Value |
| :--- | :--- |
| **Framework Preset** | `Vite` |
| **Install Command** | `npm install` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

1. Push your updates to your GitHub repository (`main` branch).
2. Import or redeploy in **Vercel**.
3. Set **`GEMINI_API_KEY`** in **Vercel Project Settings → Environment Variables**.
