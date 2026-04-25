# Scribe.ai — Architecture & Technical Design

> Technical reference for the Scribe.ai platform. Covers system architecture, tech stack decisions, data models, API design, AI strategy, and local development setup.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │  Web App      │  │  Portfolio   │  │  Browser Extension    │  │
│  │  (Next.js)    │  │  Sites (SSR) │  │  (Chrome/Firefox)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬────────────┘  │
└─────────┼─────────────────┼─────────────────────┼───────────────┘
          │                 │                     │
          ▼                 ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY                               │
│                   (Rate Limiting, Auth, CORS)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          ▼                  ▼                  ▼
┌──────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│  AUTH SERVICE    │ │  CORE API       │ │  AI SERVICE         │
│  (NextAuth)      │ │  (Express)      │ │  (FastAPI / Python) │
│                  │ │                 │ │                     │
│  - OAuth flows   │ │  - Profile CRUD │ │  - Resume parsing   │
│  - Session mgmt  │ │  - Resume mgmt  │ │  - JD analysis      │
│  - JWT tokens    │ │  - Job tracking │ │  - Tailoring engine  │
│                  │ │  - Templates    │ │  - ATS scoring       │
│                  │ │  - Typst export │ │  - Cover letter gen  │
│                  │ │  - Email (NM)   │ │  - OCR (image→text) │
└──────────────────┘ └────────┬────────┘ └──────────┬──────────┘
                              │                     │
                    ┌─────────┼─────────────────────┼──────┐
                    ▼         ▼                     ▼      ▼
             ┌────────────┐ ┌───────┐ ┌──────────┐ ┌──────────────┐
             │ PostgreSQL │ │ Redis │ │ Local FS │ │ Ollama (dev) │
             │ (Data)     │ │(Cache)│ │ (Files)  │ │ API (prod)   │
             └────────────┘ └───────┘ └──────────┘ └──────────────┘
```

---

## 2. Tech Stack

### 2.1 Frontend

| Concern | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 15 (App Router)** | SSR for portfolio pages, RSC for performance, great DX |
| Styling | **TailwindCSS v4** | Rapid UI development, design system consistency |
| Animations | **Framer Motion** | Smooth micro-animations, drag-and-drop for Kanban |
| State Management | **Zustand** | Lightweight, minimal boilerplate vs. Redux |
| Forms | **React Hook Form + Zod** | Type-safe validation, performant form handling |
| Rich Text | **Tiptap** | For cover letter and summary editing with AI suggestions |
| Icons | **Lucide React** | Consistent, lightweight icon set |
| Toasts/Notifications | **Sonner** | Beautiful, accessible toast notifications with minimal config |
| Charts | **Recharts** | Lightweight charting for simple application analytics |

### 2.2 Backend

| Concern | Choice | Rationale |
|---|---|---|
| API Server | **Node.js + Express** | Familiar ecosystem, strong middleware support |
| AI Service | **Python + FastAPI** | ML ecosystem (spaCy, Tesseract), async performance |
| ORM | **Prisma** | Type-safe queries, migrations, great Next.js integration |
| Validation | **Zod** (Node) / **Pydantic** (Python) | Shared validation schemas where possible |
| Job Queue | **BullMQ + Redis** | Background tasks: Typst compilation, AI processing, email |
| WebSockets | **Socket.io** | Real-time updates (tailoring progress, notifications) |
| Email | **Nodemailer** | Local-first, zero vendor lock-in, works with any SMTP |
| Logging | **pino** (Node) / **loguru** (Python) | Structured, colorized, leveled logging for dev and prod |

### 2.3 Document Generation — Typst

| Concern | Choice | Rationale |
|---|---|---|
| PDF Engine | **Typst** | Millisecond compilation, beautiful typography, programmable templates |
| Typst Runtime | **typst CLI** (installed locally) | Called from Node via `child_process` or Python via `subprocess` |
| Template System | **`.typ` files with JSON data injection** | Templates are Typst files; structured profile data is passed as JSON |
| DOCX Export | **docx** npm package (or `python-docx`) | Separate path for DOCX; Typst handles PDF only |
| TXT Export | **Direct string rendering** | Flatten structured data to plain text |

**How Typst templates work:**

```
1. User picks template "modern-01"
2. Backend loads `templates/resume/modern-01.typ`
3. Backend serializes resume data to JSON
4. Backend calls: `typst compile --input data=<json> modern-01.typ output.pdf`
5. Returns PDF to client
```

Benefits over LaTeX/React-PDF:
- **10–100x faster** compilation than LaTeX
- **Cleaner syntax** — templates are readable and maintainable
- **Programmatic** — conditionals, loops, functions in templates
- **Perfect typography** — kerning, ligatures, hyphenation out of the box
- **Single binary** — no TeX distribution needed (Typst is ~30MB)

### 2.4 Database & Storage

| Concern | Choice | Rationale |
|---|---|---|
| Primary DB | **PostgreSQL** (Docker locally, managed in prod) | Relational data, JSONB for flexible profile fields |
| Cache / Queue | **Redis** (Docker locally, managed in prod) | Session cache, rate limiting, BullMQ backend |
| File Storage | **Local filesystem** (dev) → **Cloudflare R2** (prod) | Resume uploads, generated PDFs, portfolio assets |

### 2.5 Email System

| Concern | Choice | Rationale |
|---|---|---|
| Transport | **Nodemailer** | Universal SMTP client, zero external dependencies |
| Local Dev | **Mailpit** (Docker) | Modern local SMTP server with beautiful web UI at `localhost:8025` |
| Production | **Any SMTP** (Gmail, Zoho, Brevo free tier, etc.) | Swap SMTP credentials in env vars, zero code changes |
| Templates | **Custom HTML email templates** | Handcrafted, beautiful, responsive email designs |
| Template Engine | **MJML** → compiled to HTML | Write responsive emails easily, compile to bulletproof HTML |

**Email types:**
- Welcome email (on signup)
- Application deadline reminders
- Follow-up nudges (7 days after applying, no response)
- Weekly activity digest (opt-in)
- Portfolio view notification

### 2.6 Infrastructure & DevOps

| Concern | Choice (Dev) | Choice (Prod) |
|---|---|---|
| Frontend | `next dev` (localhost:3000) | Vercel |
| Backend API | `nodemon` (localhost:3001) | Render |
| AI Service | `uvicorn` (localhost:8000) | Render |
| Database | Docker PostgreSQL (localhost:5432) | Supabase |
| Cache | Docker Redis (localhost:6379) | Upstash |
| Email | Docker Mailpit (localhost:8025) | SMTP provider |
| LLM | Ollama (localhost:11434) | API provider |
| File Storage | `./uploads/` local dir | Cloudflare R2 |
| Monitoring | Console logs (pino/loguru) | Sentry (errors) |
| Payments | Stripe test mode | Stripe live mode |

### 2.7 Browser Extension

| Concern | Choice | Rationale |
|---|---|---|
| Manifest | **Chrome Manifest V3** | Required for Chrome Web Store |
| Cross-Browser | **WebExtension API** | Firefox/Edge compatibility |
| Build Tool | **WXT** | Modern extension framework with HMR, TypeScript |

---

## 3. AI Architecture — Cost-Efficient Design

> **Principle:** Use the LLM as a scalpel, not a chainsaw. Every token counts.

### 3.1 Provider Abstraction Layer

```
┌─────────────────────────────────────┐
│          LLM Provider Interface     │
│                                     │
│  generate(prompt, options) → string │
│  stream(prompt, options) → stream   │
│  embed(text) → float[]             │
└─────────┬───────────────────────────┘
          │
    ┌─────┼─────────────┐
    ▼     ▼             ▼
┌────────┐ ┌──────────┐ ┌─────────────┐
│ Ollama │ │ OpenAI   │ │ Groq / etc  │
│ (dev)  │ │ (prod)   │ │ (fallback)  │
└────────┘ └──────────┘ └─────────────┘
```

**Config-driven provider switching:**
```env
# .env
LLM_PROVIDER=ollama          # ollama | openai | groq | anthropic
LLM_MODEL=llama3.2:8b        # model name for the provider
LLM_BASE_URL=http://localhost:11434  # only needed for ollama/custom
LLM_API_KEY=                  # not needed for ollama
```

Switch from local Ollama to a cloud API by changing **two env vars**. Zero code changes.

### 3.2 Cost Optimization Strategies

| Strategy | How | Savings |
|---|---|---|
| **Rule-first, LLM-second** | ATS checks are 90% rule-based (regex, DOM checks). LLM only for semantic analysis. | ~80% fewer ATS tokens |
| **Keyword extraction sans LLM** | Use spaCy NER + TF-IDF for JD keyword extraction. LLM only for ambiguous cases. | ~70% fewer parse tokens |
| **Match scoring sans LLM** | Cosine similarity on TF-IDF vectors or lightweight embeddings. No LLM needed. | 100% savings |
| **Focused prompts** | Don't send full profile + full JD. Send only the relevant section being rewritten. | ~60% fewer tailor tokens |
| **Cached results** | Same JD URL → same parsed keywords (Redis, 24h TTL). Same profile + same JD → same match score. | Eliminates repeat calls |
| **Incremental tailoring** | Tailor individual bullet points, not the entire resume at once. User accepts/rejects each. | Fewer retries |
| **Structured output (JSON mode)** | Force JSON responses to avoid parsing failures and retries. | Fewer failed calls |
| **Small model for small tasks** | Use a smaller model (e.g., llama3.2:3b) for simple tasks like tone detection. | Lower compute |

### 3.3 AI Task Breakdown — What Needs LLM vs. What Doesn't

| Task | LLM Required? | Approach |
|---|---|---|
| **Resume PDF parsing** | ❌ No | pdf-parse + regex + spaCy NER for structured extraction |
| **Image/screenshot OCR** | ❌ No | Tesseract OCR → plain text → same parsing pipeline |
| **JD keyword extraction** | ⚠️ Minimal | spaCy NER + TF-IDF primary. LLM fallback for edge cases. |
| **Company tone detection** | ⚠️ Minimal | Simple classifier (formal/startup/casual) — few-shot LLM or fine-tuned small model |
| **Match scoring** | ❌ No | TF-IDF cosine similarity + skill taxonomy matching. Pure math. |
| **Bullet point rewriting** | ✅ Yes (core) | LLM rewrites individual bullets with JD context. **This is where tokens matter most.** |
| **Summary rewriting** | ✅ Yes | LLM generates new summary tailored to JD. Single call. |
| **Cover letter generation** | ✅ Yes | LLM generates full letter. Single call with streaming. |
| **Achievement quantification** | ✅ Yes | LLM enhances vague bullets with numbers/impact. |
| **ATS formatting checks** | ❌ No | Pure rule engine: check for tables, headers, fonts, encoding. |
| **ATS keyword density** | ❌ No | TF-IDF comparison: resume keywords vs. JD keywords. Math. |
| **Skill suggestions** | ⚠️ Minimal | Static skill taxonomy + trending skills from aggregated JD data. LLM optional. |

### 3.4 Token Budget Per Operation (Estimated)

| Operation | Input Tokens | Output Tokens | Total | Cost (GPT-4o-mini) |
|---|---|---|---|---|
| Tailor 1 bullet | ~200 | ~80 | ~280 | $0.00004 |
| Tailor full resume (10 bullets) | ~2,000 | ~800 | ~2,800 | $0.0004 |
| Rewrite summary | ~500 | ~150 | ~650 | $0.0001 |
| Generate cover letter | ~800 | ~500 | ~1,300 | $0.0002 |
| Parse JD (LLM fallback) | ~1,000 | ~300 | ~1,300 | $0.0002 |
| **Full tailor cycle** | — | — | **~6,000** | **~$0.001** |

**Result:** A full resume tailoring costs ~$0.001 with GPT-4o-mini. Even at 1,000 users/day, that's ~$1/day.

### 3.5 Ollama Local Development Setup

**Recommended models:**

| Task | Model | Size | Why |
|---|---|---|---|
| All-purpose (dev) | `llama3.2:8b` | ~4.7GB | Good quality, runs on most machines |
| Lightweight tasks | `llama3.2:3b` | ~2GB | Tone detection, simple classification |
| Production API | `gpt-4o-mini` or `groq/llama-3.1-8b` | Cloud | Cheap, fast, reliable |

**Ollama setup:**
```bash
# Install Ollama (one-time)
# Windows: Download from https://ollama.com/download

# Pull models
ollama pull llama3.2:8b

# Verify it's running
curl http://localhost:11434/api/tags
```

---

## 4. Data Models (Core Entities)

### 4.1 User

```
User
├── id                  UUID (PK)
├── email               String (unique)
├── name                String
├── avatarUrl           String?
├── oauthProvider       Enum (google, linkedin, github)
├── oauthId             String
├── plan                Enum (free, pro, lifetime)
├── vanitySlug          String? (unique) → scribe.ai/slug
├── createdAt           DateTime
├── updatedAt           DateTime
│
├── Profile             1:1
├── Resumes             1:N
├── CoverLetters        1:N
├── Jobs                1:N
└── Applications        1:N
```

### 4.2 Profile

```
Profile
├── id                  UUID (PK)
├── userId              UUID (FK → User)
├── summary             Text
├── headline            String
├── location            String?
├── phone               String?
├── website             String?
├── linkedinUrl         String?
├── githubUrl           String?
│
├── experiences         JSON[] — { title, company, location, startDate, endDate, bullets[], current }
├── education           JSON[] — { degree, school, field, startDate, endDate, gpa?, honors? }
├── skills              JSON[] — { name, category, proficiency? }
├── projects            JSON[] — { name, description, url?, techStack[], bullets[] }
├── certifications      JSON[] — { name, issuer, date, expiryDate?, url? }
├── publications        JSON[] — { title, venue, date, url? }
├── volunteerWork       JSON[] — { role, organization, startDate, endDate, bullets[] }
│
├── createdAt           DateTime
└── updatedAt           DateTime
```

### 4.3 Resume

```
Resume
├── id                  UUID (PK)
├── userId              UUID (FK → User)
├── name                String — "Backend Engineer v1"
├── baseProfileSnapshot JSON — frozen copy of profile sections at creation
├── tailoredContent     JSON? — AI-modified content for a specific job
├── templateId          String — reference to Typst template
├── customStyles        JSON? — font, spacing, color overrides
├── sectionOrder        String[] — ordered list of visible sections
├── sectionVisibility   JSON — { skills: true, projects: false, ... }
├── atsScore            Int? — last computed ATS score
├── atsReport           JSON? — detailed ATS check results
├── jobId               UUID? (FK → Job) — if tailored for a specific job
│
├── createdAt           DateTime
└── updatedAt           DateTime
```

### 4.4 CoverLetter

```
CoverLetter
├── id                  UUID (PK)
├── userId              UUID (FK → User)
├── jobId               UUID? (FK → Job)
├── resumeId            UUID? (FK → Resume)
├── content             Text — the generated/edited letter
├── tone                Enum (formal, conversational, storytelling)
├── templateId          String? — Typst template
│
├── createdAt           DateTime
└── updatedAt           DateTime
```

### 4.5 Job

```
Job
├── id                  UUID (PK)
├── userId              UUID (FK → User)
├── title               String
├── company             String
├── location            String?
├── url                 String? — original job posting URL
├── source              Enum (manual, linkedin, indeed, glassdoor, extension, image)
├── rawDescription      Text — full JD text
├── parsedKeywords      JSON — { required: [], preferred: [], tools: [], softSkills: [] }
├── companyTone         Enum? (startup, corporate, creative, academic)
├── matchScore          Int? — 0–100
├── matchBreakdown      JSON? — { strong: [], partial: [], gaps: [] }
│
├── createdAt           DateTime
└── updatedAt           DateTime
```

### 4.6 Application

```
Application
├── id                  UUID (PK)
├── userId              UUID (FK → User)
├── jobId               UUID (FK → Job)
├── resumeId            UUID? (FK → Resume) — which resume version was sent
├── coverLetterId       UUID? (FK → CoverLetter)
├── status              Enum (saved, applied, screening, interview, offer, rejected, withdrawn)
├── appliedAt           DateTime?
├── notes               Text?
├── contactName         String?
├── contactEmail        String?
├── salaryRange         String?
├── nextDeadline        DateTime?
├── reminderSent        Boolean (default false)
│
├── createdAt           DateTime
└── updatedAt           DateTime
```

### 4.7 Template

```
Template
├── id                  String (PK) — "modern-01"
├── name                String — "Modern Clean"
├── category            Enum (modern, classic, compact, bold, minimalist, academic, creative)
├── type                Enum (resume, coverLetter, portfolio)
├── thumbnailUrl        String
├── typstFile           String — path to .typ template file
├── isPremium           Boolean
├── config              JSON — layout rules, spacing defaults, font defaults
│
├── createdAt           DateTime
└── updatedAt           DateTime
```

### 4.8 EmailTemplate

```
EmailTemplate
├── id                  String (PK) — "welcome", "deadline-reminder"
├── name                String — "Welcome Email"
├── subject             String — "Welcome to Scribe.ai, {{name}}!"
├── mjmlSource          Text — MJML template source
├── compiledHtml        Text — Pre-compiled HTML (cached)
│
├── createdAt           DateTime
└── updatedAt           DateTime
```

---

## 5. API Design (Key Endpoints)

### Auth
```
POST   /api/auth/login          — OAuth login (Google/LinkedIn/GitHub)
POST   /api/auth/refresh        — Refresh access token
POST   /api/auth/logout         — End session
GET    /api/auth/me             — Current user + profile summary
```

### Profile
```
GET    /api/profile              — Get full profile
PUT    /api/profile              — Update profile sections
POST   /api/profile/import       — Import from PDF/DOCX upload
POST   /api/profile/import/url   — Import from LinkedIn URL
POST   /api/profile/import/image — Import from image (OCR → parse)
```

### Resumes
```
GET    /api/resumes                  — List all resumes
POST   /api/resumes                  — Create new resume version
GET    /api/resumes/:id              — Get resume detail
PUT    /api/resumes/:id              — Update resume
DELETE /api/resumes/:id              — Delete resume
POST   /api/resumes/:id/tailor       — Tailor resume for a job (accepts jobId)
GET    /api/resumes/:id/ats-score    — Run ATS check
GET    /api/resumes/:id/export/:fmt  — Export (pdf via Typst, docx, txt, json)
GET    /api/resumes/:id/diff/:otherId — Compare two resume versions
```

### Cover Letters
```
GET    /api/cover-letters            — List all
POST   /api/cover-letters/generate   — Generate for a job (accepts jobId, tone)
GET    /api/cover-letters/:id        — Get detail
PUT    /api/cover-letters/:id        — Edit
DELETE /api/cover-letters/:id        — Delete
GET    /api/cover-letters/:id/export/:fmt — Export (pdf via Typst, docx)
```

### Jobs
```
GET    /api/jobs                     — List saved jobs
POST   /api/jobs                     — Save a job (paste JD text, URL, or image upload)
GET    /api/jobs/:id                 — Get parsed job detail + match score
DELETE /api/jobs/:id                 — Delete
POST   /api/jobs/:id/analyze         — (Re)analyze JD, compute match score
```

### Applications
```
GET    /api/applications             — List all (filterable by status)
POST   /api/applications             — Create application (link job + resume)
GET    /api/applications/:id         — Detail
PUT    /api/applications/:id         — Update status, notes, etc.
DELETE /api/applications/:id         — Delete
GET    /api/applications/stats       — Aggregate stats (response rate, etc.)
```

### Templates
```
GET    /api/templates                — List available templates (filter by type, category)
GET    /api/templates/:id            — Template detail + preview
```

### Portfolio
```
GET    /api/portfolio/config         — Get portfolio settings
PUT    /api/portfolio/config         — Update template, colors, visibility
GET    /p/:slug                      — Public portfolio page (SSR)
```

### AI (Internal / Python Service)
```
POST   /ai/parse-resume              — Extract structured data from PDF/DOCX
POST   /ai/parse-image               — OCR image → extract text
POST   /ai/parse-jd                  — Extract keywords and tone from JD
POST   /ai/tailor                    — Generate tailored resume content
POST   /ai/cover-letter              — Generate cover letter
POST   /ai/ats-check                 — Run ATS compatibility checks
POST   /ai/match-score               — Compute JD–profile match score
POST   /ai/health                    — Health check + current model info
```

---

## 6. Key Data Flows

### 6.1 Resume Tailoring Flow

```
User pastes JD (text / URL / image)
       │
       ├── [URL?] → Fetch page content → extract text
       ├── [Image?] → Tesseract OCR → extract text
       ├── [Text?] → Use directly
       │
       ▼
  [JD Parsing]  →  spaCy NER + TF-IDF keyword extraction
       │              (LLM fallback for ambiguous JDs)
       ▼
  [Match Scoring]  →  TF-IDF cosine similarity + skill taxonomy → 0–100 score
       │                (NO LLM — pure computation)
       ▼
  [Tailoring Engine]  →  LLM rewrites bullets individually (focused prompts)
       │                   Reorders sections by relevance (rule-based)
       │                   Injects keywords contextually (LLM)
       ▼
  [ATS Check]  →  Rule engine validates formatting → score + flagged issues
       │            (NO LLM — regex + DOM analysis)
       ▼
  [Preview]  →  Typst compiles tailored content + template → PDF preview
       │
       ▼
  [Export]  →  PDF (Typst) / DOCX (docx lib) / TXT (flatten)
```

### 6.2 Profile Import Flow

```
User uploads file (PDF / DOCX / Image)
       │
       ├── [PDF]   → pdf-parse extracts raw text
       ├── [DOCX]  → mammoth extracts raw text
       ├── [Image] → Tesseract OCR extracts raw text
       │
       ▼
  [Structured Extraction]  →  spaCy NER identifies entities (names, dates, orgs, skills)
       │                       Regex patterns for emails, phones, URLs
       │                       Section detection via heading analysis
       ▼
  [LLM Structuring]  →  Single LLM call: raw extracted data → profile JSON schema
       │                  (This is where LLM IS needed — understanding context)
       ▼
  [Profile Draft]  →  Pre-filled profile shown for user review/editing
       │
       ▼
  [Save]  →  Profile stored in PostgreSQL
```

### 6.3 Document Export Flow (Typst)

```
User clicks "Export PDF"
       │
       ▼
  [Load Template]  →  Read .typ file for selected template
       │
       ▼
  [Serialize Data]  →  Convert resume/cover-letter data to JSON
       │
       ▼
  [Typst Compile]  →  typst compile --input data=<json> template.typ output.pdf
       │                (~50-200ms, queued via BullMQ if under load)
       ▼
  [Return File]  →  Stream PDF back to client / store in uploads dir
```

---

## 7. Error Handling & User Experience

### 7.1 Frontend Error Strategy

**User-facing toast notifications (via Sonner):**

| Scenario | Toast Type | Message Example |
|---|---|---|
| Network error | `error` | "Couldn't reach the server. Check your connection and try again." |
| AI service down | `warning` | "AI is temporarily unavailable. You can still edit manually." |
| Invalid file upload | `error` | "Only PDF and DOCX files are supported. Please try again." |
| Successful tailor | `success` | "Resume tailored! Review the suggestions below." |
| Auto-save | `info` (subtle) | "Changes saved" (small, bottom-right, auto-dismiss 2s) |
| Rate limited | `warning` | "You're generating too fast. Please wait a moment." |
| Export ready | `success` | "Your PDF is ready!" with download action button |

**Rules:**
- NEVER show raw error codes or stack traces to users.
- ALWAYS provide an actionable next step ("try again", "contact support", "use alternative").
- Use **optimistic UI** — update the UI immediately, roll back on error.
- Show **skeleton loaders** during data fetches, NEVER blank screens.

### 7.2 Backend Logging Strategy

**Node.js (pino):**
```
[16:42:03] INFO  ✅ Server listening on :3001
[16:42:05] INFO  🔐 OAuth login: user=zayn@email.com provider=google
[16:42:06] DEBUG 📄 Profile fetched: userId=abc123 sections=7
[16:42:08] INFO  🤖 AI request: POST /ai/tailor userId=abc123 jobId=def456
[16:42:12] INFO  ✅ Tailoring complete: userId=abc123 tokens=2,847 latency=3.2s
[16:42:15] WARN  ⚠️  Rate limit approaching: userId=abc123 remaining=3/10
[16:42:20] ERROR ❌ Typst compilation failed: template=modern-01 error="missing font"
```

**Python (loguru):**
```
[16:42:08] INFO  | 🤖 Tailoring request received | user=abc123 | job=def456
[16:42:08] DEBUG | 📊 JD parsed: keywords=12 tone=startup | cached=false
[16:42:09] DEBUG | 🔗 LLM call: provider=ollama model=llama3.2:8b tokens_in=487
[16:42:11] INFO  | ✅ LLM response: tokens_out=203 latency=2.1s
[16:42:12] INFO  | 📋 Tailor complete: bullets_changed=6/10 score_delta=+18
```

**Features:**
- Color-coded by level (DEBUG=gray, INFO=green, WARN=yellow, ERROR=red)
- Emoji prefixes for quick visual scanning
- Structured fields (userId, latency, tokens) for easy filtering
- Request ID tracking across services for distributed tracing

### 7.3 JD Input — Multiple Methods

Users should have these options on the job input screen:

1. **Paste Text** — Large textarea, paste the full JD. Default and simplest.
2. **Paste URL** — Input field for LinkedIn/Indeed/Glassdoor URLs. Backend fetches and extracts.
3. **Upload Image** — Drag-and-drop or file picker for screenshots/photos of job postings. Tesseract OCR on backend converts to text.
4. **Upload File** — PDF/DOCX of a job description (less common, but supported).

**UI Design:**
- Tab-style switcher at the top: `[ Paste Text ] [ Paste URL ] [ Upload Image ]`
- Each tab shows the appropriate input
- After submission, ALL paths converge to the same parsed JD view (keywords, tone, match score)

---

## 8. Security Considerations

- **Auth:** OAuth 2.0 only (no password storage). JWTs with short expiry + refresh tokens.
- **Data Encryption:** All PII encrypted at rest (AES-256). TLS 1.3 in transit.
- **File Uploads:** Validated file types (PDF/DOCX/PNG/JPG only), max 10MB.
- **Rate Limiting:** Per-user rate limits on AI endpoints to prevent abuse.
- **API Keys:** LLM API keys stored in environment variables, never exposed to client.
- **CORS:** Whitelist only known frontend origins.
- **GDPR:** User data export and account deletion endpoints.
- **AI Service:** Internal only — not exposed to public internet. Only Core API can call it.

---

## 9. Performance & Caching

- **Typst PDF Gen:** ~50–200ms per compile. No queue needed for single documents. BullMQ only for batch exports.
- **AI Latency:** Tailoring takes 3–10s (Ollama local) or 2–5s (cloud API). Use streaming + progress indicators.
- **Caching (Redis):**
  - Parsed JDs: same URL → same parse (24h TTL)
  - Match scores: same profile hash + same JD hash (1h TTL, invalidate on profile update)
  - Template configs: cache in memory (rarely change)
  - ATS rule sets: loaded once on startup
- **Database Indexes:** on `userId`, `status`, `createdAt` for fast application queries.

---

*Last Updated: April 25, 2026*
