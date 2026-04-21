# Scribe.ai — Local Development Setup

> Complete guide to setting up the Scribe.ai development environment on Windows. Hybrid approach: Docker for infrastructure, native for app services.

---

## Architecture Overview (Local Dev)

```
┌─────────────── YOUR MACHINE ────────────────────────────┐
│                                                          │
│  NATIVE (fast HMR, instant feedback)                     │
│  ┌────────────────────────────────────────────────────┐   │
│  │  Next.js (web)        → localhost:3000             │   │
│  │  Express (api)        → localhost:3001             │   │
│  │  FastAPI (ai)         → localhost:8000             │   │
│  │  Ollama               → localhost:11434            │   │
│  └────────────────────────────────────────────────────┘   │
│                                                          │
│  DOCKER (stateful services, zero install headache)       │
│  ┌────────────────────────────────────────────────────┐   │
│  │  PostgreSQL           → localhost:5432             │   │
│  │  Redis                → localhost:6379             │   │
│  │  Mailpit              → localhost:8025 (UI)        │   │
│  │                         localhost:1025 (SMTP)      │   │
│  └────────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Why This Hybrid Approach?

| Approach | Pros | Cons |
|---|---|---|
| **Everything in Docker** | Reproducible, isolated | Slow HMR if code is mounted, complex volume setup on Windows, file watching issues with WSL |
| **Everything native** | Fastest iteration | Need to install Postgres, Redis natively — annoying on Windows, version conflicts |
| **Hybrid (recommended)** | Fast HMR for app code + zero-install for infra | Slightly more ports to manage |

**Rule of thumb:**
- **Docker** = things you don't edit (databases, mail server)
- **Native** = things you edit every minute (your app code, Ollama)

---

## Prerequisites

### Required Software

| Tool | Version | Install |
|---|---|---|
| **Node.js** | 20 LTS+ | [nodejs.org](https://nodejs.org/) or `winget install OpenJS.NodeJS.LTS` |
| **Python** | 3.11+ | [python.org](https://python.org/) or `winget install Python.Python.3.11` |
| **Docker Desktop** | Latest | [docker.com](https://www.docker.com/products/docker-desktop/) |
| **Ollama** | Latest | [ollama.com/download](https://ollama.com/download) |
| **Typst** | Latest | `winget install Typst.Typst` or [typst.app/downloads](https://github.com/typst/typst/releases) |
| **Git** | Latest | Should already have it |
| **pnpm** (recommended) | Latest | `npm install -g pnpm` |

### Verify installations

```powershell
node --version        # v20.x+
python --version      # 3.11+
docker --version      # 24.x+
ollama --version      # 0.x+
typst --version       # 0.x+
pnpm --version        # 9.x+
```

---

## Step 1: Clone & Install

```powershell
git clone https://github.com/yourusername/scribe.git
cd scribe

# Install all dependencies (monorepo)
pnpm install

# Install Python dependencies
cd apps/ai
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ../..
```

---

## Step 2: Start Docker Infrastructure

### docker-compose.yml

This file lives at the project root. It runs only the stateful services.

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: scribe-db
    environment:
      POSTGRES_USER: scribe
      POSTGRES_PASSWORD: scribe_dev_password
      POSTGRES_DB: scribe_dev
    ports:
      - "5432:5432"
    volumes:
      - scribe_pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U scribe"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: scribe-redis
    ports:
      - "6379:6379"
    volumes:
      - scribe_redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  mailpit:
    image: axllent/mailpit:latest
    container_name: scribe-mail
    ports:
      - "1025:1025"   # SMTP server
      - "8025:8025"   # Web UI
    environment:
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1

volumes:
  scribe_pgdata:
  scribe_redis:
```

### Start infrastructure

```powershell
# Start all infrastructure services
docker compose up -d

# Verify everything is running
docker compose ps

# Expected output:
# scribe-db     running   0.0.0.0:5432->5432/tcp
# scribe-redis  running   0.0.0.0:6379->6379/tcp
# scribe-mail   running   0.0.0.0:1025->1025/tcp, 0.0.0.0:8025->8025/tcp
```

### Verify services

```powershell
# PostgreSQL
psql -h localhost -U scribe -d scribe_dev -c "SELECT 1"

# Redis
redis-cli ping
# → PONG

# Mailpit — open browser
start http://localhost:8025
```

---

## Step 3: Environment Variables

### `.env` (root — shared)

```env
# ──── Database ────
DATABASE_URL=postgresql://scribe:scribe_dev_password@localhost:5432/scribe_dev

# ──── Redis ────
REDIS_URL=redis://localhost:6379

# ──── AI / LLM ────
LLM_PROVIDER=ollama
LLM_MODEL=llama3.2:8b
LLM_BASE_URL=http://localhost:11434
LLM_API_KEY=
# When switching to cloud:
# LLM_PROVIDER=openai
# LLM_MODEL=gpt-4o-mini
# LLM_API_KEY=sk-...

# ──── Email (Nodemailer) ────
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@scribe.local

# ──── Auth (OAuth) ────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
JWT_SECRET=your-dev-jwt-secret-change-in-prod
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# ──── File Storage ────
UPLOAD_DIR=./uploads
MAX_FILE_SIZE_MB=10

# ──── Typst ────
TYPST_BIN=typst
TEMPLATES_DIR=./templates

# ──── Stripe (test mode) ────
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ──── App ────
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001
AI_SERVICE_URL=http://localhost:8000
LOG_LEVEL=debug
```

---

## Step 4: Setup Ollama

```powershell
# Pull the development model
ollama pull llama3.2:8b

# (Optional) Pull a lighter model for quick tasks
ollama pull llama3.2:3b

# Verify Ollama is serving
curl http://localhost:11434/api/tags
# Should list your downloaded models
```

> **Note:** Ollama runs as a native service on Windows. It starts automatically with the system tray app. No Docker needed.

---

## Step 5: Initialize Database

```powershell
cd apps/api

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npx prisma db seed

cd ../..
```

---

## Step 6: Start All Services

Open **4 terminals** (or use a tool like `concurrently`):

### Terminal 1: Next.js Frontend
```powershell
cd apps/web
pnpm dev
# → http://localhost:3000
```

### Terminal 2: Express API
```powershell
cd apps/api
pnpm dev
# → http://localhost:3001
```

### Terminal 3: Python AI Service
```powershell
cd apps/ai
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000
```

### Terminal 4: (Optional) Watch all with Turborepo
```powershell
# From root — starts web + api together
pnpm dev
```

### All URLs at a Glance

| Service | URL | Purpose |
|---|---|---|
| Frontend | http://localhost:3000 | Next.js web app |
| API | http://localhost:3001 | Express REST API |
| AI Service | http://localhost:8000 | FastAPI + Ollama |
| AI Docs | http://localhost:8000/docs | FastAPI Swagger UI |
| Ollama | http://localhost:11434 | LLM API |
| Mailpit UI | http://localhost:8025 | View sent emails |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache/Queue |

---

## Common Commands

### Database
```powershell
# Open Prisma Studio (visual DB browser)
cd apps/api && npx prisma studio
# → http://localhost:5555

# Create a new migration
npx prisma migrate dev --name add_field_name

# Reset database (WARNING: drops all data)
npx prisma migrate reset

# View current schema
npx prisma format
```

### Docker
```powershell
# Start infrastructure
docker compose up -d

# Stop infrastructure (preserves data)
docker compose stop

# Stop and remove containers + volumes (DELETES DATA)
docker compose down -v

# View logs
docker compose logs -f postgres
docker compose logs -f mailpit
```

### Testing
```powershell
# Run all tests
pnpm test

# Run tests for specific app
pnpm --filter web test
pnpm --filter api test

# Run Python tests
cd apps/ai && python -m pytest
```

### Linting & Formatting
```powershell
# Lint all
pnpm lint

# Format all
pnpm format

# Type check
pnpm typecheck
```

---

## Troubleshooting

### Port already in use
```powershell
# Find what's using a port
netstat -ano | findstr :3000
# Kill it
taskkill /PID <pid> /F
```

### Docker containers won't start
```powershell
# Check Docker Desktop is running
docker info

# If port conflicts, check existing containers
docker ps -a

# Nuclear option: remove everything
docker compose down -v
docker compose up -d
```

### Ollama not responding
```powershell
# Check if Ollama service is running
ollama list

# Restart Ollama (close/reopen from system tray, or):
ollama serve
```

### Prisma migration issues
```powershell
# If schema is out of sync
npx prisma migrate reset
npx prisma migrate dev
```

### Python venv issues on Windows
```powershell
# If Activate.ps1 fails due to execution policy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\venv\Scripts\Activate.ps1
```

---

*Last Updated: April 21, 2026*
