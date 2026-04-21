# Scribe.ai — Project Structure

> File and folder layout for the Scribe.ai monorepo. Agents should follow this structure when creating new files.

---

## Monorepo Layout

```
scribe/
├── apps/
│   ├── web/                          # Next.js frontend
│   │   ├── public/
│   │   │   ├── fonts/
│   │   │   └── images/
│   │   ├── src/
│   │   │   ├── app/                  # Next.js App Router pages
│   │   │   │   ├── (auth)/           # Auth route group
│   │   │   │   │   ├── login/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── signup/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── (dashboard)/      # Authenticated route group
│   │   │   │   │   ├── dashboard/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── profile/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── resumes/
│   │   │   │   │   │   ├── page.tsx          # Resume list
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       ├── page.tsx      # Resume editor
│   │   │   │   │   │       └── tailor/
│   │   │   │   │   │           └── page.tsx  # Tailoring flow
│   │   │   │   │   ├── cover-letters/
│   │   │   │   │   │   └── [id]/
│   │   │   │   │   │       └── page.tsx
│   │   │   │   │   ├── applications/
│   │   │   │   │   │   └── page.tsx          # Kanban board
│   │   │   │   │   ├── analytics/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── portfolio/
│   │   │   │   │   │   └── page.tsx          # Portfolio settings
│   │   │   │   │   ├── settings/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── layout.tsx            # Dashboard shell (sidebar + topbar)
│   │   │   │   ├── p/                        # Public portfolio routes
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx          # SSR portfolio page
│   │   │   │   ├── layout.tsx                # Root layout
│   │   │   │   ├── page.tsx                  # Landing page
│   │   │   │   └── globals.css
│   │   │   ├── components/
│   │   │   │   ├── ui/                       # Primitive UI components
│   │   │   │   │   ├── button.tsx
│   │   │   │   │   ├── input.tsx
│   │   │   │   │   ├── card.tsx
│   │   │   │   │   ├── badge.tsx
│   │   │   │   │   ├── modal.tsx
│   │   │   │   │   ├── dropdown.tsx
│   │   │   │   │   ├── toast.tsx
│   │   │   │   │   ├── skeleton.tsx
│   │   │   │   │   ├── tooltip.tsx
│   │   │   │   │   └── progress-bar.tsx
│   │   │   │   ├── layout/                   # Layout components
│   │   │   │   │   ├── sidebar.tsx
│   │   │   │   │   ├── topbar.tsx
│   │   │   │   │   ├── mobile-nav.tsx
│   │   │   │   │   └── page-header.tsx
│   │   │   │   ├── profile/                  # Profile-specific components
│   │   │   │   │   ├── section-editor.tsx
│   │   │   │   │   ├── experience-item.tsx
│   │   │   │   │   ├── skill-tags.tsx
│   │   │   │   │   ├── import-modal.tsx
│   │   │   │   │   └── completeness-bar.tsx
│   │   │   │   ├── resume/                   # Resume-specific components
│   │   │   │   │   ├── resume-card.tsx
│   │   │   │   │   ├── resume-preview.tsx
│   │   │   │   │   ├── template-picker.tsx
│   │   │   │   │   ├── customization-panel.tsx
│   │   │   │   │   ├── section-toggles.tsx
│   │   │   │   │   └── ats-score-panel.tsx
│   │   │   │   ├── tailoring/                # Tailoring flow components
│   │   │   │   │   ├── job-input.tsx
│   │   │   │   │   ├── match-score-gauge.tsx
│   │   │   │   │   ├── match-breakdown.tsx
│   │   │   │   │   ├── diff-viewer.tsx
│   │   │   │   │   └── suggestion-card.tsx
│   │   │   │   ├── cover-letter/
│   │   │   │   │   ├── editor.tsx
│   │   │   │   │   └── tone-selector.tsx
│   │   │   │   ├── applications/
│   │   │   │   │   ├── kanban-board.tsx
│   │   │   │   │   ├── kanban-column.tsx
│   │   │   │   │   ├── kanban-card.tsx
│   │   │   │   │   └── application-detail.tsx
│   │   │   │   ├── analytics/
│   │   │   │   │   ├── stats-row.tsx
│   │   │   │   │   └── charts.tsx
│   │   │   │   ├── portfolio/
│   │   │   │   │   ├── portfolio-preview.tsx
│   │   │   │   │   └── portfolio-controls.tsx
│   │   │   │   └── landing/
│   │   │   │       ├── hero.tsx
│   │   │   │       ├── features-grid.tsx
│   │   │   │       ├── how-it-works.tsx
│   │   │   │       └── cta-footer.tsx
│   │   │   ├── hooks/                        # Custom React hooks
│   │   │   │   ├── use-profile.ts
│   │   │   │   ├── use-resumes.ts
│   │   │   │   ├── use-jobs.ts
│   │   │   │   ├── use-applications.ts
│   │   │   │   ├── use-auth.ts
│   │   │   │   ├── use-debounce.ts
│   │   │   │   └── use-media-query.ts
│   │   │   ├── lib/                          # Utilities and helpers
│   │   │   │   ├── api-client.ts             # Axios/fetch wrapper
│   │   │   │   ├── auth.ts                   # Auth helpers
│   │   │   │   ├── constants.ts
│   │   │   │   ├── utils.ts                  # General utilities
│   │   │   │   └── format.ts                 # Date, number formatters
│   │   │   ├── stores/                       # Zustand stores
│   │   │   │   ├── auth-store.ts
│   │   │   │   ├── profile-store.ts
│   │   │   │   ├── resume-store.ts
│   │   │   │   └── app-store.ts              # UI state (theme, sidebar)
│   │   │   └── templates/                    # React preview templates (browser)
│   │   │       ├── resume/
│   │   │       │   ├── modern.tsx             # Browser preview renderer
│   │   │       │   ├── classic.tsx
│   │   │       │   ├── compact.tsx
│   │   │       │   ├── minimalist.tsx
│   │   │       │   └── bold.tsx
│   │   │       └── portfolio/
│   │   │           ├── developer.tsx
│   │   │           ├── professional.tsx
│   │   │           └── creative.tsx
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── api/                          # Node.js backend API
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── profile.routes.ts
│   │   │   │   ├── resume.routes.ts
│   │   │   │   ├── cover-letter.routes.ts
│   │   │   │   ├── job.routes.ts
│   │   │   │   ├── application.routes.ts
│   │   │   │   ├── template.routes.ts
│   │   │   │   └── portfolio.routes.ts
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── profile.controller.ts
│   │   │   │   ├── resume.controller.ts
│   │   │   │   ├── cover-letter.controller.ts
│   │   │   │   ├── job.controller.ts
│   │   │   │   ├── application.controller.ts
│   │   │   │   ├── template.controller.ts
│   │   │   │   └── portfolio.controller.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── profile.service.ts
│   │   │   │   ├── resume.service.ts
│   │   │   │   ├── typst.service.ts        # Typst CLI wrapper for PDF generation
│   │   │   │   ├── export.service.ts       # DOCX/TXT generation (non-Typst)
│   │   │   │   ├── job.service.ts
│   │   │   │   ├── application.service.ts
│   │   │   │   ├── ai-client.service.ts    # HTTP client to Python AI service
│   │   │   │   └── email.service.ts        # Nodemailer wrapper
│   │   │   ├── middleware/
│   │   │   │   ├── auth.middleware.ts       # JWT verification
│   │   │   │   ├── rate-limit.middleware.ts
│   │   │   │   ├── validate.middleware.ts   # Zod schema validation
│   │   │   │   └── error-handler.middleware.ts
│   │   │   ├── emails/                      # MJML email templates
│   │   │   │   ├── templates/
│   │   │   │   │   ├── welcome.mjml
│   │   │   │   │   ├── deadline-reminder.mjml
│   │   │   │   │   ├── follow-up-nudge.mjml
│   │   │   │   │   ├── weekly-digest.mjml
│   │   │   │   │   └── portfolio-view.mjml
│   │   │   │   └── compile.ts              # MJML → HTML compiler script
│   │   │   ├── jobs/                        # Background jobs (BullMQ)
│   │   │   │   ├── typst-export.job.ts
│   │   │   │   ├── reminder.job.ts
│   │   │   │   └── analytics.job.ts
│   │   │   ├── lib/
│   │   │   │   ├── prisma.ts               # Prisma client singleton
│   │   │   │   ├── redis.ts                # Redis client
│   │   │   │   ├── storage.ts              # Local FS (dev) / R2 (prod) abstraction
│   │   │   │   ├── stripe.ts               # Stripe client
│   │   │   │   └── logger.ts               # pino — structured, colorized logging
│   │   │   ├── schemas/                     # Zod validation schemas
│   │   │   │   ├── profile.schema.ts
│   │   │   │   ├── resume.schema.ts
│   │   │   │   ├── job.schema.ts
│   │   │   │   └── application.schema.ts
│   │   │   └── index.ts                     # App entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma               # Database schema
│   │   │   ├── migrations/
│   │   │   └── seed.ts                     # Seed data script
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── ai/                           # Python AI service
│   │   ├── app/
│   │   │   ├── main.py               # FastAPI app entry
│   │   │   ├── routes/
│   │   │   │   ├── parse.py           # /ai/parse-resume, /ai/parse-jd, /ai/parse-image
│   │   │   │   ├── tailor.py          # /ai/tailor, /ai/cover-letter
│   │   │   │   └── ats.py             # /ai/ats-check, /ai/match-score
│   │   │   ├── services/
│   │   │   │   ├── resume_parser.py   # PDF/DOCX → structured data
│   │   │   │   ├── jd_parser.py       # JD text → keywords + tone (spaCy + TF-IDF)
│   │   │   │   ├── ocr.py             # Tesseract OCR — image → text
│   │   │   │   ├── matcher.py         # Profile ↔ JD matching (cosine similarity)
│   │   │   │   ├── tailoring.py       # LLM-powered content rewriting
│   │   │   │   ├── cover_letter.py    # Cover letter generation
│   │   │   │   └── ats_checker.py     # ATS rule engine (regex, no LLM)
│   │   │   ├── models/                # Pydantic models
│   │   │   │   ├── profile.py
│   │   │   │   ├── job.py
│   │   │   │   └── ats.py
│   │   │   ├── prompts/               # LLM prompt templates
│   │   │   │   ├── tailor_resume.py
│   │   │   │   ├── cover_letter.py
│   │   │   │   ├── parse_resume.py
│   │   │   │   └── parse_jd.py
│   │   │   └── providers/             # LLM provider abstraction
│   │   │       ├── base.py            # Abstract LLMProvider interface
│   │   │       ├── ollama.py          # Ollama (local dev)
│   │   │       ├── openai.py          # OpenAI (production)
│   │   │       ├── groq.py            # Groq (fast + cheap fallback)
│   │   │       └── factory.py         # Provider factory — reads LLM_PROVIDER env
│   │   ├── requirements.txt
│   │   ├── Dockerfile
│   │   └── pyproject.toml
│   │
│   └── extension/                     # Browser extension
│       ├── src/
│       │   ├── popup/                 # Extension popup UI
│       │   ├── content/               # Content scripts (JD detection)
│       │   ├── background/            # Service worker
│       │   └── lib/                   # Shared utilities
│       ├── manifest.json
│       └── package.json
│
├── packages/
│   ├── types/                         # Shared TypeScript types
│   │   ├── src/
│   │   │   ├── user.ts
│   │   │   ├── profile.ts
│   │   │   ├── resume.ts
│   │   │   ├── job.ts
│   │   │   ├── application.ts
│   │   │   ├── template.ts
│   │   │   └── index.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── utils/                         # Shared utilities
│       ├── src/
│       │   ├── format.ts
│       │   ├── validation.ts
│       │   └── index.ts
│       ├── tsconfig.json
│       └── package.json
│
├── templates/                         # Typst document templates
│   ├── resume/
│   │   ├── modern-01.typ              # Modern resume template
│   │   ├── classic-01.typ
│   │   ├── compact-01.typ
│   │   ├── minimalist-01.typ
│   │   └── bold-01.typ
│   ├── cover-letter/
│   │   ├── formal-01.typ
│   │   ├── conversational-01.typ
│   │   └── storytelling-01.typ
│   └── shared/
│       ├── fonts/                     # Bundled fonts for Typst
│       ├── icons/                     # Small icons for templates
│       └── lib.typ                    # Shared Typst functions/helpers
│
├── uploads/                           # Local file storage (dev only, gitignored)
│   ├── resumes/
│   ├── exports/
│   └── images/
│
├── docs/                              # Documentation
│   ├── idea.md
│   ├── architecture.md
│   ├── roadmap.md
│   ├── ui-spec.md
│   ├── project-structure.md
│   ├── api-reference.md
│   └── dev-setup.md
│
├── turbo.json                         # Turborepo config
├── package.json                       # Root package.json (workspaces)
├── .env.example
├── .gitignore
├── docker-compose.yml                 # Local dev: Postgres + Redis + Mailpit
└── README.md
```

---

## Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Files (components) | `kebab-case.tsx` | `kanban-board.tsx` |
| Files (utilities) | `kebab-case.ts` | `api-client.ts` |
| Components | `PascalCase` | `KanbanBoard` |
| Hooks | `camelCase` with `use` prefix | `useResumes` |
| Stores | `camelCase` with `-store` suffix | `resume-store.ts` |
| Routes | `kebab-case` | `cover-letter.routes.ts` |
| API endpoints | `kebab-case` paths | `/api/cover-letters/:id` |
| Database tables | `PascalCase` (Prisma convention) | `CoverLetter` |
| Environment vars | `SCREAMING_SNAKE_CASE` | `DATABASE_URL` |
| CSS classes | TailwindCSS utility classes | — |

---

*Last Updated: April 21, 2026*
