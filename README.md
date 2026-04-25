# Scribe.ai

<p align="center">
  <img src="https://raw.githubusercontent.com/zaynbaluch/scribe.ai/main/apps/web/public/logo-light.png" width="120" alt="Scribe.ai Logo" />
</p>

<p align="center">
  <strong>Your career story, intelligently told.</strong>
</p>

<p align="center">
  <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js" /></a>
  <a href="https://tailwindcss.com"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind" /></a>
  <a href="https://www.prisma.io"><img src="https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat-square&logo=prisma" alt="Prisma" /></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-AI-05998B?style=flat-square&logo=fastapi" alt="FastAPI" /></a>
  <a href="https://turbo.build"><img src="https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=flat-square&logo=turborepo" alt="Turborepo" /></a>
</p>

---

**Scribe.ai** is an advanced agentic platform designed to take the guesswork out of the job hunt. From instant AI-powered resume tailoring to automated application tracking and professional portfolio hosting, Scribe provides a seamless, premium end-to-end experience for high-performance professionals.

## ✨ Key Features

- 🧠 **AI Tailoring Engine**: Instant mapping of your experiences to job descriptions using local LLMs (Ollama) or OpenAI.
- 📄 **Typst-Powered Resumes**: Generate beautiful, ATS-optimized PDFs in milliseconds using the Typst typesetting system.
- 📊 **ATS Simulator**: Get real-time feedback on your resume's compatibility with modern tracking systems.
- 📋 **Kanban Command Center**: Track your applications, interviews, and offers in a fluid, interactive dashboard.
- 🌐 **Shareable Portfolios**: Instantly deploy a professional, password-protected portfolio site linked to your master profile.
- 🧩 **Browser Extension**: Capture job descriptions directly from LinkedIn and Indeed with a single click.

## 🛠️ Tech Stack

### Frontend & Web
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 + Framer Motion
- **State Management**: Zustand + React Query

### Backend & AI
- **API Engine**: Node.js + Express + Prisma ORM
- **AI Service**: Python FastAPI + Ollama (Local) / OpenAI (Production)
- **Database**: PostgreSQL
- **Caching**: Redis

### Infrastructure
- **Typesetting**: Typst CLI
- **Monorepo**: Turborepo + pnpm
- **DevOps**: Docker Compose (Postgres, Redis, Mailpit)

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: >= 20.0.0
- **pnpm**: >= 10.x
- **Docker**: For database and infrastructure
- **Python**: >= 3.11 (For AI service)

### 1. Clone & Install
```bash
git clone https://github.com/zaynbaluch/scribe.ai.git
cd scribe.ai
pnpm install
```

### 2. Infrastructure
Spin up the database, cache, and mail server:
```bash
docker-compose up -d
```

### 3. Environment Setup
Copy the example environment variables:
```bash
cp .env.example .env
```

### 4. Run Development
Launch all services (Web, API, AI) in parallel:
```bash
pnpm run dev
```

---

## 📂 Project Structure

```text
scribe.ai/
├── apps/
│   ├── web/          # Next.js Frontend
│   ├── api/          # Express Backend
│   ├── ai/           # FastAPI AI Service
│   └── extension/    # WXT Browser Extension
├── packages/
│   ├── types/        # Shared TypeScript Types
│   └── utils/        # Shared Utility Functions
├── docs/             # Comprehensive Documentation
└── docker-compose.yml
```

## 📖 Documentation

For detailed technical guides, architecture deep-dives, and UI guidelines, please refer to the [docs](./docs) directory:

- [Architecture Overview](./docs/architecture.md)
- [UI Guidelines & Design System](./docs/ui-guidelines.md)
- [API Reference](./docs/api-reference.md)
- [Project Roadmap](./docs/roadmap.md)

---

<p align="center">
  Built with ❤️ by the Scribe Team
</p>
