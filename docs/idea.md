# Scribe.ai — Product Idea

> **Tagline:** _Your career story, intelligently told._
>
> Scribe.ai is an AI-powered career platform that transforms raw professional history into laser-targeted application materials — resumes, cover letters, and a shareable portfolio — tailored to every job description in seconds.

---

## 1. Vision & Problem Statement

### The Problem

Job seekers — especially university students and early-career professionals — face three chronic pain points:

1. **Resume Roulette:** Sending the same generic resume to dozens of jobs and hearing nothing back.
2. **ATS Black Holes:** ~75% of resumes are rejected by Applicant Tracking Systems before a human ever sees them, usually due to formatting or keyword mismatches.
3. **Application Fatigue:** Managing 50+ applications across boards, deadlines, and follow-ups is overwhelming and disorganized.

### The Vision

Scribe.ai eliminates these frictions by acting as an **intelligent career co-pilot** — it understands who you are professionally, what each employer is looking for, and bridges the gap automatically.

---

## 2. Target Audience

| Segment | Description | Key Need |
|---|---|---|
| **University Students** | Final-year / fresh graduates applying for internships and entry-level roles | Free, fast, ATS-safe resume generation |
| **Early-Career Professionals** | 0–5 years experience in tech, engineering, data science | Tailoring resumes per role without rewriting from scratch |
| **Career Switchers** | Professionals pivoting to new industries | Reframing existing experience with new industry keywords |
| **Freelancers & Contractors** | Gig workers applying to multiple short-term roles frequently | Rapid generation of role-specific proposals/resumes |
| **Bootcamp Graduates** | Self-taught / bootcamp devs with non-traditional backgrounds | Presenting projects and skills compellingly |

---

## 3. Core Features

### 3.1 Smart Profile Builder

- **OAuth Login** via Google, LinkedIn, and GitHub.
- **Auto-Import Pipeline:**
  - Upload PDF/DOCX resume → AI parses skills, experience, education, projects, certifications.
  - Connect LinkedIn URL → scrape and structure public profile data.
  - *Future:* GitHub integration to auto-extract project descriptions, tech stacks, and contribution stats.
- **Editable Profile Dashboard:**
  - Structured sections: Summary, Experience, Education, Skills, Projects, Certifications, Publications, Volunteer Work.
  - AI-suggested skills based on current job market trends (pulled from job board data).
  - Certification expiry tracking with renewal reminders.
- **Multi-Resume Versioning:**
  - Save multiple base profiles (e.g., "Backend Engineer v1", "ML Engineer v2").
  - Toggle individual sections/bullets on/off per version.
  - Diff view to compare versions side-by-side.

---

### 3.2 AI Job Tailoring Engine ⭐ (Core Differentiator)

This is the heart of Scribe.ai — the feature that makes everything else worth using.

- **Job Description Intake:**
  - Paste raw job description text.
  - Paste a LinkedIn/Indeed/Glassdoor URL → auto-fetch and parse the JD.
  - Browser extension: one-click capture from any job board.
- **AI Analysis Pipeline:**
  1. **Keyword Extraction:** Identify required skills, tools, frameworks, soft skills, and qualifications.
  2. **Company Vibe Analysis:** Detect tone (startup-casual vs. corporate-formal) to match writing style.
  3. **Match Scoring:** Generate a 0–100 compatibility score with a prioritized breakdown:
     - ✅ Strong matches
     - ⚠️ Partial matches (skills you have but didn't highlight)
     - ❌ Gaps (skills you're missing — with learning resource suggestions)
- **One-Click Tailoring:**
  - Reorder bullet points to front-load relevant experience.
  - Rewrite summaries and objective statements to mirror JD language.
  - Contextually inject missing keywords (without keyword stuffing).
  - Quantify achievements automatically (e.g., "Led ML project" → "Led ML project, improving OCR accuracy by 25% across 10K+ documents").
- **Cover Letter Generator:**
  - Generate role-specific cover letters matching the company's tone.
  - Customizable templates: formal, conversational, storytelling.
  - Paragraph-level editing with AI rewrite suggestions.

---

### 3.3 ATS Optimization Engine

- **ATS Simulator:**
  - Simulate parsing through major ATS systems (Taleo, Workday, Greenhouse, Lever, iCIMS).
  - Visual report showing exactly what the ATS "sees" vs. what you intended.
- **23+ ATS Checks** including:
  - ❌ Tables, columns, graphics, headers/footers that break parsing
  - ❌ Non-standard section headings
  - ❌ Missing contact information fields
  - ❌ Incompatible fonts or encoding
  - ❌ Excessive formatting (colors, icons)
  - ✅ Keyword density analysis
  - ✅ Section completeness scoring
  - ✅ File format compatibility
- **Target:** 95%+ ATS pass rate on all generated documents.

---

### 3.4 Templates & Export

- **25+ ATS-Friendly Templates:**
  - Categories: Modern, Classic, Compact, Bold, Minimalist, Academic, Creative.
  - All templates stress-tested against top ATS systems.
  - Customizable: fonts, spacing, accent colors, section ordering.
- **Export Formats:**
  - PDF (print-ready, ATS-optimized)
  - DOCX (editable)
  - TXT / Plain text (for copy-paste into online forms)
  - LaTeX (for academic users)
  - JSON (structured data export for developers)
- **QR Code Generator:**
  - Embed QR code in physical resumes linking to your digital profile.
  - Customizable QR code styling (colors, logo embed).

---

### 3.5 Shareable Portfolio Site

A styled, one-page portfolio website auto-generated from the user's Scribe.ai profile.

- **Built from Profile Data:**
  - Pulls Summary, Experience, Education, Skills, Projects, and Certifications directly from the user's profile.
  - Always in sync — update your profile, portfolio updates automatically.
- **Template-Based Design:**
  - Multiple curated portfolio templates (matching the resume template aesthetic families).
  - Customizable accent colors, layout order, and visibility toggles per section.
- **Shareable URL:**
  - Custom vanity URL: `scribe.ai/yourname`
  - Password-protected option for private sharing.
  - Basic view analytics: total views and clicks.

---

### 3.6 Job Hunt Command Center

- **Application Tracker:**
  - Kanban board with customizable stages: Saved → Applied → Screening → Interview → Offer → Rejected.
  - Drag-and-drop interface.
  - Per-application notes, contacts, salary info, deadlines.
  - Automated reminders: follow-up emails, interview prep, deadline alerts.
- **Job Board Integration:**
  - Save jobs directly from LinkedIn, Indeed, Glassdoor via browser extension.
  - Auto-tailor resume on save — one click from "interesting job" to "tailored application ready."
- **One-Click Apply:**
  - Browser extension auto-fills application forms using your Scribe.ai profile.
  - Track which version of your resume was sent to which company.

---

### 3.7 Application Analytics (Simple)

- **Success Metrics:**
  - Response rate, interview conversion rate, offer rate — tracked over time.
  - Which resume version performs best.
- **Activity Summary:**
  - Applications sent this week/month.
  - Upcoming deadlines and interviews at a glance.

---

## 4. Competitive Landscape

| Feature | Scribe.ai | Teal | Jobscan | Kickresume | Novoresume |
|---|---|---|---|---|---|
| AI Job Tailoring | ✅ Deep, contextual | ✅ Basic | ⚠️ Keyword-only | ❌ | ❌ |
| ATS Simulation | ✅ Multi-system | ❌ | ✅ Single | ❌ | ⚠️ Basic |
| Cover Letter AI | ✅ Role-matched | ⚠️ Generic | ❌ | ✅ Template | ✅ Template |
| Application Tracker | ✅ Full Kanban | ✅ | ❌ | ❌ | ❌ |
| Portfolio Site | ✅ Profile-synced | ❌ | ❌ | ⚠️ Basic | ⚠️ Basic |
| Free Tier Generosity | ✅ Unlimited tailoring | ⚠️ Limited | ⚠️ 5 scans/mo | ⚠️ 1 resume | ⚠️ 1 resume |
| Browser Extension | ✅ | ✅ | ✅ | ❌ | ❌ |

### Why Scribe.ai Wins

1. **Generous Free Tier** → viral adoption among students who share with classmates.
2. **End-to-End Platform** → competitors solve one piece; Scribe.ai covers the entire job hunt lifecycle.
3. **AI Depth** → not just keyword matching; genuine understanding of context, tone, and career narrative.

---

*Last Updated: April 21, 2026*
