# Scribe.ai — Development Roadmap

> Phased plan for building Scribe.ai from zero to launch. Each phase is self-contained and can be handed to an agent as an independent unit of work.

---

## Phase 0: Project Setup & Scaffolding

**Goal:** Get the monorepo structure, tooling, and dev environment running.

- [ ] Initialize monorepo (Turborepo)
- [ ] Scaffold Next.js frontend (`apps/web`)
- [ ] Scaffold Express backend (`apps/api`)
- [ ] Scaffold Python FastAPI AI service (`apps/ai`)
- [ ] Set up shared packages (`packages/types`, `packages/utils`)
- [ ] Configure TailwindCSS v4, fonts (Inter/Outfit), base design tokens
- [ ] Set up ESLint, Prettier, TypeScript configs
- [ ] Create `docker-compose.yml` (PostgreSQL + Redis + Mailpit)
- [ ] Set up Prisma with PostgreSQL (Docker container)
- [ ] Set up Redis (Docker container)
- [ ] Install and verify Typst CLI (`typst --version`)
- [ ] Install and verify Ollama + pull `llama3.2:8b` model
- [ ] Set up Nodemailer + verify with Mailpit (send test email)
- [ ] Configure environment variables (`.env.example` with all vars)
- [ ] Set up pino logger (Node) + loguru (Python) with colorized output
- [ ] Set up GitHub repo + GitHub Actions CI (lint + type-check)
- [ ] Create seed data script (sample users, profiles, jobs)
- [ ] Create `uploads/` directory structure (resumes, exports, images)

**Deliverable:** `pnpm dev` starts all services. Docker infra running. Ollama responding. Empty app loads in browser.

---

## Phase 1: Auth & Profile Builder

**Goal:** Users can sign up, log in, and build their professional profile.

- [ ] Implement OAuth login (Google first, then LinkedIn, GitHub)
- [ ] Set up session management (JWT + refresh tokens)
- [ ] Build Profile CRUD API endpoints
- [ ] Build Profile Dashboard UI
  - [ ] Section editor: Summary, Experience, Education, Skills, Projects, Certifications
  - [ ] Add/edit/delete/reorder items within sections
  - [ ] AI skill suggestions (basic — from a static list first, LLM later)
- [ ] Build PDF/DOCX import endpoint (basic parsing)
  - [ ] Upload UI with drag-and-drop
  - [ ] Parse uploaded file → pre-fill profile
  - [ ] User reviews and confirms imported data

**Deliverable:** User can log in, fill out their profile manually or via upload, and see it rendered.

---

## Phase 2: Resume Builder & Typst Templates

**Goal:** Users can create resumes from their profile and choose templates. PDF generation via Typst.

- [ ] Build Resume CRUD API
- [ ] Build Multi-Resume Versioning (create, name, duplicate, delete versions)
- [ ] Build Typst template system
  - [ ] Create shared Typst library (`templates/shared/lib.typ`) — layout helpers, styling functions
  - [ ] Design and implement 5 resume `.typ` templates (Modern, Classic, Compact, Minimalist, Bold)
  - [ ] Build `typst.service.ts` — Node wrapper that calls Typst CLI with JSON data
  - [ ] Template selection UI with live preview
  - [ ] Customization controls: font, spacing, accent color, section order
- [ ] Build section visibility toggles (show/hide per resume version)
- [ ] Build Resume Preview component (React preview in browser, matching Typst output)
- [ ] Implement Export endpoints
  - [ ] PDF export via Typst compilation (~50-200ms per doc)
  - [ ] DOCX export via `docx` npm package
  - [ ] TXT export (flatten structured data)
- [ ] Build Export UI (format selector, download button)
- [ ] Build QR code generator for resume links

**Deliverable:** User can create multiple resume versions, pick Typst templates, customize, preview, and export beautiful PDFs.

---

## Phase 3: AI Tailoring Engine (Ollama-First)

**Goal:** The core differentiator — paste a JD, get a tailored resume. Runs on local Ollama during dev.

- [ ] Build LLM provider abstraction layer (Python)
  - [ ] Abstract `LLMProvider` interface (`generate`, `stream`)
  - [ ] Ollama provider (local dev)
  - [ ] OpenAI provider (production)
  - [ ] Groq provider (cheap fallback)
  - [ ] Provider factory — reads `LLM_PROVIDER` env var
- [ ] Build Job CRUD API
- [ ] Build JD parsing pipeline (Python AI service)
  - [ ] Multiple input methods: paste text, paste URL, upload image
  - [ ] URL fetching + text extraction (LinkedIn, Indeed, Glassdoor)
  - [ ] Image OCR via Tesseract → extract text from screenshots/photos
  - [ ] Keyword extraction via spaCy NER + TF-IDF (NO LLM for this step)
  - [ ] Company tone detection (simple classifier, minimal LLM)
- [ ] Build Match Scoring algorithm
  - [ ] TF-IDF cosine similarity + skill taxonomy matching (NO LLM — pure math)
  - [ ] Categorize: strong matches, partial matches, gaps
- [ ] Build Tailoring Engine
  - [ ] LLM-powered bullet rewriting (focused prompts, one bullet at a time)
  - [ ] Section reordering based on relevance (rule-based, no LLM)
  - [ ] Keyword injection (contextual, LLM-assisted)
  - [ ] Achievement quantification (LLM)
- [ ] Build Tailoring UI
  - [ ] Job input form with tabs: Paste Text | Paste URL | Upload Image
  - [ ] Match score display with animated gauge + breakdown cards
  - [ ] Side-by-side: original vs. tailored resume (highlighted diffs)
  - [ ] Accept/reject individual suggestions
  - [ ] User-friendly error toasts for all failure modes
- [ ] Build Cover Letter Generator
  - [ ] Tone selector (formal, conversational, storytelling)
  - [ ] Rich text editor (Tiptap) with AI rewrite per paragraph
  - [ ] Export via Typst (PDF) and docx (DOCX)
- [ ] Redis caching: parsed JDs (24h TTL), match scores (1h TTL)

**Deliverable:** User pastes/uploads a JD → sees match score → one-click tailored resume + cover letter. Works with local Ollama.

---

## Phase 4: ATS Optimization

**Goal:** Every resume gets an ATS compatibility score and actionable fixes.

- [ ] Build ATS rule engine (formatting checks)
  - [ ] Check for tables, columns, graphics, headers/footers
  - [ ] Check section headings against ATS-standard names
  - [ ] Check for missing contact info
  - [ ] Font and encoding validation
- [ ] Build ATS semantic analysis (LLM-assisted)
  - [ ] Keyword density check
  - [ ] Section completeness scoring
- [ ] Build ATS Simulator UI
  - [ ] Visual "what the ATS sees" plain-text render
  - [ ] Score badge (0–100) with color coding
  - [ ] Issue list with fix suggestions (auto-fixable where possible)
- [ ] Integrate ATS check into resume export flow (warn before export if score < 80)

**Deliverable:** Every resume shows an ATS score. Users can see + fix issues before exporting.

---

## Phase 5: Job Hunt Command Center

**Goal:** Application tracking with Kanban board, email reminders, and basic analytics.

- [ ] Build Application CRUD API
- [ ] Build Kanban Board UI
  - [ ] Columns: Saved, Applied, Screening, Interview, Offer, Rejected
  - [ ] Drag-and-drop status changes (Framer Motion)
  - [ ] Per-application detail panel (notes, contacts, salary, deadlines)
- [ ] Build email reminder system (Nodemailer + Mailpit for testing)
  - [ ] Design MJML email templates:
    - [ ] `deadline-reminder.mjml` — upcoming deadline alert
    - [ ] `follow-up-nudge.mjml` — 7 days after applying with no response
    - [ ] `weekly-digest.mjml` — weekly activity summary (opt-in)
  - [ ] Build MJML → HTML compiler script
  - [ ] BullMQ scheduled jobs for sending reminders
- [ ] Build Application Analytics (simple)
  - [ ] Response rate, interview rate, offer rate
  - [ ] Simple bar/line charts (Recharts)
  - [ ] Activity summary on dashboard
- [ ] Link applications to jobs, resumes, and cover letters

**Deliverable:** Full Kanban tracker with linked resume versions, beautiful email reminders, and basic analytics.

---

## Phase 6: Shareable Portfolio Site

**Goal:** Auto-generated portfolio website from user profile.

- [ ] Build Portfolio config API (template, colors, visibility)
- [ ] Design 3 portfolio templates (aligned with resume template families)
- [ ] Build SSR portfolio page route (`/p/:slug`)
  - [ ] Pull profile data and render with selected template
  - [ ] Responsive design (mobile + desktop)
- [ ] Build vanity URL system (slug uniqueness, validation)
- [ ] Add password protection option
- [ ] Add basic view tracking (total views, recent activity)
- [ ] Build portfolio settings UI in dashboard

**Deliverable:** Users get a live, styled portfolio at `scribe.ai/username`.

---

## Phase 7: Browser Extension

**Goal:** Capture jobs and auto-fill applications from any job board.

- [ ] Scaffold extension project (Plasmo or WXT, Manifest V3)
- [ ] Build JD detection + capture on job board pages
  - [ ] LinkedIn, Indeed, Glassdoor content scripts
  - [ ] "Save to Scribe.ai" floating button
- [ ] Build extension popup
  - [ ] Quick match score preview
  - [ ] "Tailor Resume" action
  - [ ] Status: logged in / out
- [ ] Build auto-fill for common application forms
- [ ] Publish to Chrome Web Store (and Firefox Add-ons)

**Deliverable:** Extension captures jobs, triggers tailoring, and helps fill applications.

---

## Phase 8: Polish, Testing & Launch Prep

**Goal:** Production-ready quality, performance, and launch assets.

- [ ] End-to-end testing (Playwright)
- [ ] Mobile responsiveness pass on all pages
- [ ] Performance audit (Lighthouse, Core Web Vitals)
- [ ] Error handling and edge cases (empty states, failed AI calls, network errors)
- [ ] Loading states and skeleton screens everywhere
- [ ] Onboarding flow (first-time user guided tour)
- [ ] Landing page with product demo
- [ ] SEO: meta tags, OG images, sitemap
- [ ] Legal: Privacy Policy, Terms of Service
- [ ] Production deployment (Vercel + Railway + Supabase)
- [ ] Monitoring: Sentry error tracking, PostHog analytics

**Deliverable:** Ship it. 🚀

---

*Last Updated: April 21, 2026*
