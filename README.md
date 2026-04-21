# Scribe.ai Developer Guide

Welcome to the Scribe.ai monorepo! This guide will help you get your local development environment up and running.

## Prerequisites

- **Node.js**: >= 20.0.0
- **pnpm**: >= 10.28.2 (We use `pnpm` as the package manager)
- **Python**: >= 3.11 (For the AI service)
- **Docker** & **Docker Compose**: For running the database, cache, and other infrastructure services.

## Services Overview

- **Web (Frontend)**: Next.js app located in `apps/web`
- **API (Backend)**: Express + Prisma app located in `apps/api`
- **AI Service**: FastAPI app located in `apps/ai`
- **Infrastructure**: Postgres, Redis, and Mailpit via Docker Compose

---

## 1. Start Infrastructure Services

First, start the required background services using Docker Compose from the root directory:

```bash
docker-compose up -d
```

This will spin up:
- **Postgres** (Database) on port `5433`
- **Redis** (Cache) on port `6379`
- **Mailpit** (Local SMTP testing) on port `8025` (Web UI) and `1025` (SMTP)

---

## 2. Start the Web & API Services

We use [Turborepo](https://turbo.build/) to manage our Node.js services.

1. Install dependencies from the root directory:
   ```bash
   pnpm install
   ```

2. Generate the Prisma Client (if you haven't already):
   ```bash
   cd apps/api
   npx prisma generate
   ```

3. Start the Web and API services in parallel from the root directory:
   ```bash
   pnpm run dev
   ```
   - **Web App** will be available at: http://localhost:3000 (default Next.js port)
   - **API Server** will watch for changes and restart automatically.

---

## 3. Start the AI Service

The AI service is a standalone FastAPI application running on Python.

1. Navigate to the AI app directory:
   ```bash
   cd apps/ai
   ```

2. Activate the virtual environment (assuming you've already created it during setup):
   - **Windows**: `venv\Scripts\activate`
   - **Mac/Linux**: `source venv/bin/activate`

3. Install dependencies (if needed):
   ```bash
   pip install -r requirements.txt
   # OR if using pyproject.toml / hatchling
   pip install -e .
   ```

4. Run the development server:
   ```bash
   python -m uvicorn app.main:app --reload --port 8000
   ```
   - **AI Service** will be available at: http://localhost:8000
   - **Swagger Docs**: http://localhost:8000/docs
   - **Health Check**: http://localhost:8000/ai/health

---

## Verifying Everything Works

1. **Database & Infrastructure**: Run `docker ps` to ensure `scribe-db`, `scribe-redis`, and `scribe-mail` are running.
2. **Web**: Open http://localhost:3000 in your browser.
3. **AI**: Open http://localhost:8000/docs to see the FastAPI Swagger UI and test the `/ai/health` endpoint.

---

## Stopping the Services

To shut everything down and free up your ports:

1. **Stop Docker Services**: From the root directory, run:
   ```bash
   docker-compose down
   ```
   *This will stop and remove the Postgres, Redis, and Mailpit containers while keeping your data safe in volumes.*

2. **Stop Web, API & AI Services**: If you have them running in your terminal, simply press `Ctrl + C` in the respective terminal windows to terminate the processes.

Happy coding!

