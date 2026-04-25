# Scribe.ai — Development Roadmap

> Phased plan for building Scribe.ai from zero to launch. Each phase is self-contained and represents the journey of this project.

---

## Phase 0: Project Setup & Scaffolding [COMPLETED]

**Goal:** Get the monorepo structure, tooling, and dev environment running.

- [x] Initialize monorepo (Turborepo)
- [x] Scaffold Next.js frontend (`apps/web`)
- [x] Scaffold Express backend (`apps/api`)
- [x] Scaffold Python FastAPI AI service (`apps/ai`)
- [x] Set up shared packages (`packages/types`, `packages/utils`)
- [x] Configure TailwindCSS v4, fonts (Inter/Outfit), base design tokens
- [x] Set up ESLint, Prettier, TypeScript configs
- [x] Create `docker-compose.yml` (PostgreSQL + Redis + Mailpit)
- [x] Set up Prisma with PostgreSQL (Docker container)
- [x] Set up Redis (Docker container)
- [x] Install and verify Typst CLI (`typst --version`)
- [x] Install and verify Ollama + pull `llama3.2:8b` model
- [x] Set up Nodemailer + verify with Mailpit (send test email)
- [x] Configure environment variables (`.env.example` with all vars)
- [x] Set up pino logger (Node) + loguru (Python) with colorized output
- [x] Set up GitHub repo + GitHub Actions CI (lint + type-check)
- [x] Create seed data script (sample users, profiles, jobs)
- [x] Create `uploads/` directory structure (resumes, exports, images)

---

## Phase 1: Auth & Profile Builder [COMPLETED]

**Goal:** Users can sign up, log in, and build their professional profile.

- [x] Implement OAuth login (Google first, then LinkedIn, GitHub)
- [x] Set up session management (JWT + refresh tokens)
- [x] Build Profile CRUD API endpoints
- [x] Build Profile Dashboard UI
  - [x] Section editor: Summary, Experience, Education, Skills, Projects, Certifications
  - [x] Add/edit/delete/reorder items within sections
  - [x] AI skill suggestions (basic — from a static list first, LLM later)
- [x] Build PDF/DOCX import endpoint (basic parsing)
  - [x] Upload UI with drag-and-drop
  - [x] Parse uploaded file → pre-fill profile
  - [x] User reviews and confirms imported data

---

## Phase 2: Resume Builder & Typst Templates [COMPLETED]

**Goal:** Users can create resumes from their profile and choose templates. PDF generation via Typst.

- [x] Build Resume CRUD API
- [x] Build Multi-Resume Versioning (create, name, duplicate, delete versions)
- [x] Build Typst template system
  - [x] Create shared Typst library (`templates/shared/lib.typ`) — layout helpers, styling functions
  - [x] Design and implement 5 resume `.typ` templates (Modern, Classic, Compact, Minimalist, Bold)
  - [x] Build `typst.service.ts` — Node wrapper that calls Typst CLI with JSON data
  - [x] Template selection UI with live preview
  - [x] Customization controls: font, spacing, accent color, section order
- [x] Build section visibility toggles (show/hide per resume version)
- [x] Build Resume Preview component (React preview in browser, matching Typst output)
- [x] Implement Export endpoints
  - [x] PDF export via Typst compilation (~50-200ms per doc)
  - [x] DOCX export via `docx` npm package
  - [x] TXT export (flatten structured data)
- [x] Build Export UI (format selector, download button)
- [x] Build QR code generator for resume links

---

## Phase 3: AI Tailoring Engine (Ollama-First) [COMPLETED]

**Goal:** The core differentiator — paste a JD, get a tailored resume. Runs on local Ollama during dev.

- [x] Build LLM provider abstraction layer (Python)
  - [x] Abstract `LLMProvider` interface (`generate`, `stream`)
  - [x] Ollama provider (local dev)
  - [x] OpenAI provider (production)
  - [x] Groq provider (cheap fallback)
  - [x] Provider factory — reads `LLM_PROVIDER` env var
- [x] Build Job CRUD API
- [x] Build JD parsing pipeline (Python AI service)
  - [x] Multiple input methods: paste text, paste URL, upload image
  - [x] URL fetching + text extraction (LinkedIn, Indeed, Glassdoor)
  - [x] Image OCR via Tesseract → extract text from screenshots/photos
  - [x] Keyword extraction via spaCy NER + TF-IDF (NO LLM for this step)
  - [x] Company tone detection (simple classifier, minimal LLM)
- [x] Build Match Scoring algorithm
  - [x] TF-IDF cosine similarity + skill taxonomy matching (NO LLM — pure math)
  - [x] Categorize: strong matches, partial matches, gaps
- [x] Build Tailoring Engine
  - [x] LLM-powered bullet rewriting (focused prompts, one bullet at a time)
  - [x] Section reordering based on relevance (rule-based, no LLM)
  - [x] Keyword injection (contextual, LLM-assisted)
  - [x] Achievement quantification (LLM)
- [x] Build Tailoring UI
  - [x] Job input form with tabs: Paste Text | Paste URL | Upload Image
  - [x] Match score display with animated gauge + breakdown cards
  - [x] Side-by-side: original vs. tailored resume (highlighted diffs)
  - [x] Accept/reject individual suggestions
  - [x] User-friendly error toasts for all failure modes
- [x] Build Cover Letter Generator
  - [x] Tone selector (formal, conversational, storytelling)
  - [x] Rich text editor (Tiptap) with AI rewrite per paragraph
  - [x] Export via Typst (PDF) and docx (DOCX)
- [x] Redis caching: parsed JDs (24h TTL), match scores (1h TTL)

---

## Phase 4: ATS Optimization [COMPLETED]

**Goal:** Every resume gets an ATS compatibility score and actionable fixes.

- [x] Build ATS rule engine (formatting checks)
  - [x] Check for tables, columns, graphics, headers/footers
  - [x] Check section headings against ATS-standard names
  - [x] Check for missing contact info
  - [x] Font and encoding validation
- [x] Build ATS semantic analysis (LLM-assisted)
  - [x] Keyword density check
  - [x] Section completeness scoring
- [x] Build ATS Simulator UI
  - [x] Visual "what the ATS sees" plain-text render
  - [x] Score badge (0–100) with color coding
  - [x] Issue list with fix suggestions (auto-fixable where possible)
- [x] Integrate ATS check into resume export flow (warn before export if score < 80)

---

## Phase 5: Job Hunt Command Center [COMPLETED]

**Goal:** Application tracking with Kanban board, email reminders, and basic analytics.

- [x] Build Application CRUD API
- [x] Build Kanban Board UI
  - [x] Columns: Saved, Applied, Screening, Interview, Offer, Rejected
  - [x] Drag-and-drop status changes (Framer Motion)
  - [x] Per-application detail panel (notes, contacts, salary, deadlines)
- [x] Build email reminder system (Nodemailer + Mailpit for testing)
  - [x] Design MJML email templates:
    - [x] `deadline-reminder.mjml` — upcoming deadline alert
    - [x] `follow-up-nudge.mjml` — 7 days after applying with no response
    - [x] `weekly-digest.mjml` — weekly activity summary (opt-in)
  - [x] Build MJML → HTML compiler script
  - [x] BullMQ scheduled jobs for sending reminders
- [x] Build Application Analytics (simple)
  - [x] Response rate, interview rate, offer rate
  - [x] Simple bar/line charts (Recharts)
  - [x] Activity summary on dashboard
- [x] Link applications to jobs, resumes, and cover letters

---

## Phase 6: Shareable Portfolio Site [COMPLETED]

**Goal:** Auto-generated portfolio website from user profile.

- [x] Build Portfolio config API (template, colors, visibility)
- [x] Design 3 portfolio templates (aligned with resume template families)
- [x] Build SSR portfolio page route (`/p/:slug`)
  - [x] Pull profile data and render with selected template
  - [x] Responsive design (mobile + desktop)
- [x] Build vanity URL system (slug uniqueness, validation)
- [x] Add password protection option
- [x] Add basic view tracking (total views, recent activity)
- [x] Build portfolio settings UI in dashboard

---

## Phase 7: Browser Extension [COMPLETED]

**Goal:** Capture jobs and auto-fill applications from any job board.

- [x] Scaffold extension project (WXT, Manifest V3)
- [x] Build JD detection + capture on job board pages
  - [x] LinkedIn, Indeed, Glassdoor content scripts
  - [x] "Save to Scribe.ai" floating button
- [x] Build extension popup
  - [x] Quick match score preview
  - [x] "Tailor Resume" action
  - [x] Status: logged in / out
- [x] Build auto-fill for common application forms
- [x] Publish to Chrome Web Store (and Firefox Add-ons)

---

## Phase 8: Polish, Testing & Launch Prep [COMPLETED]

**Goal:** Production-ready quality, performance, and launch assets.

- [x] End-to-end testing (Playwright)
- [x] Mobile responsiveness pass on all pages
- [x] Performance audit (Lighthouse, Core Web Vitals)
- [x] Error handling and edge cases (empty states, failed AI calls, network errors)
- [x] Loading states and skeleton screens everywhere
- [x] Onboarding flow (first-time user guided tour)
- [x] Landing page with product demo
- [x] SEO: meta tags, OG images, sitemap
- [x] Legal: Privacy Policy, Terms of Service
- [x] Production deployment (Vercel + Render + Supabase)
- [x] Monitoring: Sentry error tracking, PostHog analytics

---

*Last Updated: April 25, 2026*
