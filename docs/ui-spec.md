# Scribe.ai — UI/UX Specification

> **Design Language: "Nebula-Grid"**
>
> A fusion of **Technical Elegance** (Payload-inspired structural grids) and **Editorial Premium** (Resend-inspired high-contrast serif typography), layered with dynamic WebGL smoke animations and flowing nebula gradients. The result is a UI that feels like a premium developer tool wrapped in an editorial magazine.

---

## 1. Design Philosophy

### Core Principles

1. **Technical Elegance** — Every surface sits on a visible 1px structural grid, as if the entire UI is a technical blueprint. Elements are bounded by grid lines, not floating in space.
2. **Editorial Premium** — Hero text uses high-contrast serif typography with dramatic scale. The UI feels like a luxury magazine, not a SaaS dashboard.
3. **Ethereal Dynamics** — WebGL smoke, flowing color ribbons, and ambient glows create depth and life without overwhelming the content.
4. **Extreme Contrast** — Pure black backgrounds (`#000000`) with bright white text. No muddy grays. Sharp, cinematic contrast.
5. **Precision Over Decoration** — Every border, every line, every spacing decision is intentional. The grid is the decoration.

### Vibe Keywords
`Premium` · `Mesmerizing` · `Developer-focused` · `Precise` · `Cinematic` · `Editorial`

---

## 2. Global Design Tokens (CSS Variables)

Implement as CSS `:root` variables. **Dark Mode is the primary theme** for the landing page and public-facing pages. The authenticated dashboard supports both Dark and Light modes.

### 2.1 Color Palette — Dark Mode (Primary)

```css
:root {
  /* ── Backgrounds ── */
  --bg-base: #000000;                         /* Pure black — maximum contrast */
  --bg-surface: #0A0A0C;                      /* Slightly elevated dark for cards */
  --bg-surface-transparent: rgba(10, 10, 12, 0.6); /* Glassmorphic card bg */
  --bg-elevated: #111114;                      /* Hover states, secondary surfaces */

  /* ── Grid ── */
  --grid-line: rgba(255, 255, 255, 0.08);      /* The crucial thin structural grid */
  --grid-line-strong: rgba(255, 255, 255, 0.15); /* Emphasized grid lines (section borders) */

  /* ── Text ── */
  --text-primary: #FFFFFF;
  --text-secondary: #A1A1AA;                   /* Zinc 400 */
  --text-muted: #52525B;                       /* Zinc 600 */
  --text-watermark: rgba(255, 255, 255, 0.04); /* Giant background text */

  /* ── Borders ── */
  --border-subtle: rgba(255, 255, 255, 0.12);
  --border-focus: rgba(255, 255, 255, 0.3);
  --border-strong: rgba(255, 255, 255, 0.2);

  /* ── Semantic ── */
  --success: #10B981;                          /* Emerald 500 */
  --warning: #F59E0B;                          /* Amber 500 */
  --danger: #EF4444;                           /* Red 500 */
  --info: #06B6D4;                             /* Cyan 500 */
}
```

### 2.2 Color Palette — Light Mode (Dashboard)

```css
[data-theme="light"] {
  --bg-base: #FAFAFA;                          /* Soft off-white, never harsh pure white */
  --bg-surface: #FFFFFF;
  --bg-surface-transparent: rgba(255, 255, 255, 0.7);
  --bg-elevated: #F4F4F5;                      /* Zinc 100 */

  --grid-line: rgba(0, 0, 0, 0.06);
  --grid-line-strong: rgba(0, 0, 0, 0.12);

  --text-primary: #09090B;                     /* Zinc 950 */
  --text-secondary: #52525B;                   /* Zinc 600 */
  --text-muted: #A1A1AA;                       /* Zinc 400 */
  --text-watermark: rgba(0, 0, 0, 0.03);

  --border-subtle: rgba(0, 0, 0, 0.1);
  --border-focus: rgba(0, 0, 0, 0.3);
  --border-strong: rgba(0, 0, 0, 0.15);
}
```

### 2.3 Nebula Gradients & Glows

These power the smoke effects, flowing ribbons, ambient backgrounds, and accent highlights throughout the app.

```css
:root {
  /* ── Gradient Source Colors ── */
  --gradient-1: #FF3366;                       /* Vivid Rose */
  --gradient-2: #7C3AED;                       /* Deep Violet */
  --gradient-3: #06B6D4;                       /* Cyan */

  /* ── Composed Gradients ── */
  --glow-ambient: radial-gradient(
    circle at center,
    rgba(124, 58, 237, 0.15) 0%,
    rgba(0, 0, 0, 0) 70%
  );
  --glow-rose: radial-gradient(
    circle at center,
    rgba(255, 51, 102, 0.12) 0%,
    rgba(0, 0, 0, 0) 60%
  );
  --glow-cyan: radial-gradient(
    circle at center,
    rgba(6, 182, 212, 0.1) 0%,
    rgba(0, 0, 0, 0) 60%
  );
  --ribbon-gradient: linear-gradient(
    90deg,
    var(--gradient-1),
    var(--gradient-2),
    var(--gradient-3)
  );
}
```

### 2.4 Typography System

Import these specific Google Fonts. **No system fonts.**

| Role | Font Family | Fallback | Usage | Styling Notes |
|---|---|---|---|---|
| **Display / Hero** | `Fraunces` | `Instrument Serif`, `Cormorant Garamond`, `serif` | Giant hero text, section titles, massive metric numbers, page headings on landing | Negative tracking (`letter-spacing: -0.02em`), variable weight (Regular/Medium), high contrast |
| **Body / UI** | `Inter` | `Geist`, `Satoshi`, `sans-serif` | Buttons, nav links, paragraphs, dashboard labels, form inputs, table text | Clean, geometric, readable. Weight 400 (body), 500 (labels), 600 (buttons) |
| **Technical / Data** | `JetBrains Mono` | `Fira Code`, `monospace` | Code snippets, exact metric readouts ("29,486"), ATS scores, API keys, tags, match percentages | Tabular numbers enabled, slightly reduced size vs. body (0.875em) |

```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

:root {
  --font-display: 'Fraunces', 'Instrument Serif', serif;
  --font-body: 'Inter', 'Geist', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

### 2.5 Typography Scale

| Element | Font | Size | Weight | Letter Spacing | Line Height |
|---|---|---|---|---|---|
| Hero H1 (landing) | Display | 72px / 4.5rem | 400 | -0.03em | 1.0 |
| Page H1 (dashboard) | Display | 36px / 2.25rem | 500 | -0.02em | 1.2 |
| H2 | Display | 28px / 1.75rem | 500 | -0.02em | 1.3 |
| H3 | Body | 20px / 1.25rem | 600 | -0.01em | 1.4 |
| Body | Body | 15px / 0.9375rem | 400 | 0 | 1.6 |
| Body Small | Body | 13px / 0.8125rem | 400 | 0 | 1.5 |
| Caption / Label | Body | 12px / 0.75rem | 500 | 0.04em | 1.4 |
| Mono Data | Mono | 14px / 0.875rem | 400 | 0 | 1.5 |
| Mono Large (metrics) | Mono | 32px / 2rem | 500 | -0.02em | 1.1 |

### 2.6 Spacing & Layout

```css
:root {
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
  --space-24: 96px;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-pill: 99px;     /* ONLY for small badges and toggles */

  --sidebar-width: 260px;
  --sidebar-collapsed: 64px;
  --topbar-height: 56px;
  --max-content: 1280px;
}
```

> **Rule:** Never use fully rounded pill shapes for cards or buttons. Max border-radius is `12px` for cards, `8px` for buttons. Pills (`99px`) are reserved for tiny badges and toggle tracks only.

---

## 3. Core Architectural Elements

### 3.1 The Structural Grid — "The Blueprint"

**This is the signature visual.** Every page is built atop a visible 1px grid that creates the illusion of a continuous technical schematic behind the entire UI.

**Implementation:**

```css
body {
  background-color: var(--bg-base);
  background-image:
    linear-gradient(var(--grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--grid-line) 1px, transparent 1px);
  background-size: 64px 64px;  /* 64px grid cells */
}
```

**Structural Rules:**
- The `body` background grid must be continuous — it should not reset or break between sections.
- Major sections (navbar, hero, features, footer) are separated by a full-width `border-bottom: 1px solid var(--grid-line-strong)`.
- The sidebar in the dashboard has `border-right: 1px solid var(--grid-line-strong)`.
- Content containers use `border: 1px solid var(--border-subtle)` — elements look like they're placed inside the grid cells.
- **Alignment:** Content edges should align to the grid where possible. The grid is the layout's skeleton.

### 3.2 Surfaces & Cards

```css
.card {
  background: var(--bg-surface-transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);  /* 12px max */
  padding: var(--space-6);
}

.card:hover {
  border-color: var(--border-focus);
  background: var(--bg-elevated);
}
```

- All cards use glassmorphism: semi-transparent background + `backdrop-filter: blur(12px)`.
- Card borders are always `1px solid var(--border-subtle)`.
- Hover increases border brightness to `--border-focus` and shifts bg to `--bg-elevated`.
- **No box-shadows on cards.** The grid and borders provide all visual structure.

### 3.3 Glassmorphic Navbar

```css
.navbar {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--bg-surface-transparent);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--grid-line-strong);
  height: var(--topbar-height);
}
```

---

## 4. Animation & Dynamics

### 4.1 Interactive Smoke Background (Landing Hero)

**Technology:** Three.js / WebGL fluid simulation, or complex CSS radial gradient keyframes as fallback.

**Behavior:**
- The hero section background is a dark, empty canvas.
- When the user's mouse enters the hero area, colorful **smoke** emits from the cursor position using `--gradient-1` (Rose), `--gradient-2` (Violet), `--gradient-3` (Cyan).
- The smoke **dissipates** (fades to opacity 0) and **drifts upward/outward** with natural turbulence.
- **Velocity-reactive:** Faster mouse movement = denser, brighter smoke. Stationary cursor = gentle ambient glow.
- On mobile / touch: Use slow-moving autonomous smoke blobs that drift across the hero.

**Performance:** Run at 30fps max. Use `requestAnimationFrame` with throttle. Disable on `prefers-reduced-motion`.

### 4.2 Scroll-Based Background Text Reveal

**Technology:** Framer Motion `useScroll` + `useTransform`, or GSAP ScrollTrigger.

**Behavior:**
- As the user scrolls down from the top of the landing page, a **massive serif watermark** (e.g., "SCRIBE") fades in from `opacity: 0` to `opacity: 1` and translates up on the Y-axis.
- This text sits **behind** all UI elements (low `z-index`).
- Color: `--text-watermark` — extremely faint, acts as texture, not content.
- Font: Display serif at 20vw+ size, spanning the viewport width.

### 4.3 Colorful Flowing Ribbons (Section Transitions)

**Technology:** Canvas/WebGL, or SVG paths with CSS keyframe animations.

**Behavior:**
- Between major landing page sections (Hero → Features, Features → How It Works), thin **glowing ribbons** flow horizontally across the screen.
- Colors use `--ribbon-gradient` (Rose → Violet → Cyan).
- Ribbons look like overlapping sine waves with `filter: blur(2px)` for a soft glow.
- Animation: Continuous, slow `transform: translateX()` with sine-wave path modulation. ~20s loop.
- Ribbons are decorative and sit behind content (`z-index: 0`).

### 4.4 Micro-Interactions (App-Wide)

| Element | Animation | Implementation |
|---|---|---|
| Page transitions | Fade + slide up (150ms ease-out) | Framer Motion `AnimatePresence` |
| Card hover | Border brightens, bg shifts, scale(1.01) | CSS transition (200ms ease) |
| Button press (primary) | Scale down to 0.97, subtle box-shadow glow | CSS `:active` transition |
| Button hover (primary) | Scale down to 0.98 | CSS transition (150ms) |
| Toast notifications | Slide in from right, auto-dismiss with progress bar | Sonner (themed to match system) |
| Kanban drag | Ghost card + drop zone highlight pulse | Framer Motion `Reorder` |
| Modal open/close | Scale from 0.95 + fade (200ms) | Framer Motion |
| Skeleton loaders | Gradient shimmer sweep (1.5s loop) | CSS animation on `--bg-elevated` / `--bg-surface` |
| Match score gauge | Count-up 0 → score (1s ease-out) | Framer Motion `useMotionValue` |
| AI text generation | Streaming text with blinking cursor | CSS animation |
| Progress bars | Width transition (300ms ease) | CSS transition |
| Nav link active indicator | Underline slides in from left (200ms) | CSS transition on `::after` pseudo |
| Metric number changes | Number morphs/counts up | Framer Motion `animate` |
| Sidebar collapse | Width transition (250ms ease-in-out) | CSS transition |

---

## 5. Component Library

### 5.1 Buttons

**Primary Button:**
```css
.btn-primary {
  background: #FFFFFF;
  color: #000000;
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: transform 150ms ease, box-shadow 150ms ease;
}
.btn-primary:hover {
  transform: scale(0.98);
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
}
.btn-primary:active {
  transform: scale(0.97);
}
/* Light mode: invert */
[data-theme="light"] .btn-primary {
  background: #09090B;
  color: #FFFFFF;
}
```

**Secondary / Ghost Button:**
```css
.btn-secondary {
  background: transparent;
  color: var(--text-primary);
  font-family: var(--font-body);
  font-weight: 500;
  font-size: 14px;
  padding: 10px 20px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background 150ms ease, border-color 150ms ease;
}
.btn-secondary:hover {
  background: var(--border-subtle);
  border-color: var(--border-focus);
}
```

**Danger Button:**
```css
.btn-danger {
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
  /* Same structure as secondary, red-tinted */
}
.btn-danger:hover {
  background: rgba(239, 68, 68, 0.1);
}
```

**Gradient Accent Button** (for special CTAs like "Tailor My Resume"):
```css
.btn-accent {
  background: linear-gradient(135deg, var(--gradient-1), var(--gradient-2));
  color: #FFFFFF;
  font-weight: 600;
  border: none;
  border-radius: var(--radius-md);
  padding: 12px 24px;
  position: relative;
  overflow: hidden;
}
.btn-accent::before {
  /* Animated gradient shift on hover */
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--gradient-2), var(--gradient-3));
  opacity: 0;
  transition: opacity 300ms ease;
}
.btn-accent:hover::before {
  opacity: 1;
}
```

### 5.2 Inputs

```css
.input {
  background: var(--bg-surface);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 14px;
  padding: 10px 14px;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  outline: none;
  transition: border-color 200ms ease, box-shadow 200ms ease;
}
.input:focus {
  border-color: var(--border-focus);
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);  /* Subtle violet inner glow */
}
.input::placeholder {
  color: var(--text-muted);
}
```

**Labels** sit above inputs, use `--font-body` at 12px/500 weight with `letter-spacing: 0.04em`, uppercase.

### 5.3 Cards (Feature Cards, Resume Cards, etc.)

```css
.card {
  background: var(--bg-surface-transparent);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  transition: border-color 200ms ease, background 200ms ease, transform 200ms ease;
}
.card:hover {
  border-color: var(--border-focus);
  background: var(--bg-elevated);
  transform: translateY(-2px);
}
```

### 5.4 Badges / Tags

```css
.badge {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.03em;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
}
.badge-success { color: var(--success); border-color: rgba(16, 185, 129, 0.3); background: rgba(16, 185, 129, 0.1); }
.badge-warning { color: var(--warning); border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.1); }
.badge-danger  { color: var(--danger);  border-color: rgba(239, 68, 68, 0.3);  background: rgba(239, 68, 68, 0.1); }
.badge-info    { color: var(--info);    border-color: rgba(6, 182, 212, 0.3);  background: rgba(6, 182, 212, 0.1); }
```

### 5.5 Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}
.modal {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  max-width: 560px;
  padding: var(--space-8);
}
```
- Animate in: scale 0.95 → 1.0, opacity 0 → 1.0 (200ms ease-out).
- Close on backdrop click and Escape key.

### 5.6 Tables (Dashboard)

```css
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th {
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-muted);
  text-align: left;
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--grid-line-strong);
}
.table td {
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text-primary);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--grid-line);
}
```
- **No vertical borders** inside tables. Only horizontal row separators.
- Numeric data uses `var(--font-mono)`.
- Row hover: `background: var(--bg-elevated)`.

### 5.7 Toast Notifications (Sonner)

Theme Sonner to match the design system:
- Background: `var(--bg-surface)` with `backdrop-filter: blur(12px)`.
- Border: `1px solid var(--border-subtle)`.
- Text: `var(--text-primary)`.
- Left border accent: `3px solid` colored by intent (success/warning/danger/info).
- Auto-dismiss: 5s with progress bar indicator.
- Position: bottom-right.

### 5.8 Skeleton Loaders

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-surface) 25%,
    var(--bg-elevated) 50%,
    var(--bg-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-md);
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## 6. Page Specifications

### 6.1 Landing Page (`/`)

**Purpose:** Convert visitors to sign-ups. First impression. Maximum visual impact.

**Theme:** Dark mode only. Full Nebula-Grid experience.

**Structure:**

```
┌──────────────────────────────────────────────┐
│  NAVBAR (glassmorphic, sticky)               │
│  Logo ·····  Nav Links  ····· [Get Started]  │
├──────────────────────────────────────────────┤ ← grid-line-strong
│                                              │
│  HERO SECTION                                │
│  ┌────────────────────────────────────────┐   │
│  │  [WebGL Interactive Smoke Canvas]      │   │
│  │                                        │   │
│  │    "Your career story,                 │   │  ← Fraunces serif, 72px
│  │     intelligently told."               │   │
│  │                                        │   │
│  │    Build, tailor, and manage...         │   │  ← Inter, 18px, text-secondary
│  │                                        │   │
│  │    [Get Started — Free] [See Demo]     │   │
│  └────────────────────────────────────────┘   │
│                                              │
│  ── BACKGROUND WATERMARK: "SCRIBE" ──        │  ← Fraunces, 20vw, text-watermark
│                                              │
├──────────────────────────────────────────────┤ ← grid-line-strong
│  ~~~ FLOWING RIBBONS (gradient sine waves) ~~│
├──────────────────────────────────────────────┤
│                                              │
│  LOGO TICKER / SOCIAL PROOF                  │
│  Logo │ Logo │ Logo │ Logo │ Logo │ Logo     │  ← separated by 1px vertical grid lines
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  BENTO-BOX FEATURES (grid layout)            │
│  ┌─────────────────┐ ┌────────┐ ┌────────┐   │
│  │  AI Tailoring    │ │  ATS   │ │ Export │   │  ← 2-col span + 1-col + 1-col
│  │  (large card)    │ │ Score  │ │ PDF    │   │
│  └─────────────────┘ └────────┘ └────────┘   │
│  ┌────────┐ ┌─────────────────┐ ┌────────┐   │
│  │  Job   │ │  Portfolio      │ │ Cover  │   │
│  │ Track  │ │  Site (live)    │ │ Letter │   │
│  └────────┘ └─────────────────┘ └────────┘   │
│                                              │
│  Each card uses glassmorphism + grid borders  │
│  Inside cards: mix Mono font (fake terminal)  │
│  + Body font (descriptions)                  │
│                                              │
├──────────────────────────────────────────────┤
│  ~~~ FLOWING RIBBONS ~~~~~~~~~~~~~~~~~~~~~~~~│
├──────────────────────────────────────────────┤
│                                              │
│  HOW IT WORKS (3 steps)                      │
│  [1] Import Profile → [2] Paste JD → [3] ✨  │
│  Numbers in Mono font, steps in serif titles  │
│  Connected by subtle dotted grid lines        │
│                                              │
├──────────────────────────────────────────────┤
│                                              │
│  CTA SECTION                                 │
│  Giant serif text + [Get Started] button      │
│  Ambient glow behind CTA (--glow-ambient)    │
│                                              │
├──────────────────────────────────────────────┤
│  FOOTER                                      │
│  Links · Terms · Privacy · © 2026             │
└──────────────────────────────────────────────┘
```

**Key Details:**
- Navbar: Logo (left), nav links centered (`Features`, `How It Works`, `Pricing`), `[Get Started]` primary button (right).
- Hero heading: `Fraunces` serif, 72px, white, tight line-height (1.0), negative tracking.
- Hero subheadline: `Inter`, 18px, `--text-secondary`.
- Feature cards contain **fake terminal windows** (dark bg, `JetBrains Mono` text showing code-like output: `match_score: 94`, `ats_pass: true`).
- Grid lines from the `body` background should flow continuously behind all sections.

---

### 6.2 Auth Pages (`/login`, `/signup`)

**Theme:** Dark mode. Centered card. Ambient nebula glow behind the card.

**Layout:**
- Full viewport height, centered.
- Background: `--bg-base` with body grid + subtle `--glow-ambient` radial behind the auth card.
- Card: Glassmorphic, max-width 440px.
  - Logo at top (with subtle glow animation).
  - "Welcome to Scribe.ai" in serif display font.
  - OAuth buttons: Ghost style, full-width, stacked.
    - `[ G  Continue with Google ]`
    - `[ in  Continue with LinkedIn ]`
    - `[ ⚡  Continue with GitHub ]`
  - Each button has a provider icon on the left.
  - Subtle divider line between buttons.
- Footer links: Terms of Service, Privacy Policy — `--text-muted`, small.

---

### 6.3 Dashboard (`/dashboard`)

**Theme:** Supports both Light and Dark mode toggle.

**Layout:**

```
┌─────────┬───────────────────────────────────────┐
│         │  TOPBAR                                │
│         │  "Good morning, Zayn" ··· 🌙 ··· 👤   │
│ SIDEBAR ├───────────────────────────────────────┤ ← grid-line-strong
│         │                                       │
│  Logo   │  QUICK ACTIONS (3 large cards)         │
│         │  ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  ──────  │  │ Create   │ │ Paste JD │ │Import  │ │
│  📋 Dash│  │ Resume   │ │          │ │ CV     │ │
│  👤 Prof│  └──────────┘ └──────────┘ └────────┘ │
│  📄 Res │                                       │
│  📝 CLs │  STATS ROW                            │
│  💼 Jobs│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  📊 Apps│  │ 12   │ │ 35%  │ │ 8    │ │ 92   │  │  ← Mono font, large
│  🌐 Port│  │Resumes│ │Resp. │ │Inter.│ │ ATS  │  │  ← Body font, muted
│  ⚙ Set │  └──────┘ └──────┘ └──────┘ └──────┘  │
│         │                                       │
│  ──────  │  RECENT ACTIVITY                      │
│  Plan:  │  • Created "ML Engineer v3" — 2h ago   │
│  FREE   │  • Applied to TechCorp — yesterday     │
│  [↑Pro] │  • Cover letter generated — 3d ago     │
│         │                                       │
│         │  UPCOMING DEADLINES                    │
│         │  ┌─────────────────────────────────┐   │
│         │  │ TechCorp — Interview — Apr 25   │   │
│         │  │ StartupX — Follow up — Apr 28   │   │
│         │  └─────────────────────────────────┘   │
└─────────┴───────────────────────────────────────┘
```

**Sidebar:**
- Width: `260px`, collapsible to `64px` (icon-only mode).
- Strict `border-right: 1px solid var(--grid-line-strong)`.
- Navigation items: Icon + label, `Inter` 14px/500.
- Active item: Underline or left-border accent using `--gradient-2` (violet).
- Plan badge at bottom: `FREE` or `PRO` in a badge component.
- Dark/Light mode toggle in sidebar footer.

**Topbar:**
- Height: `56px`.
- Left: Page title or greeting (serif display font for greeting: "Good morning, Zayn").
- Right: Theme toggle, notification bell, user avatar dropdown.
- `border-bottom: 1px solid var(--grid-line-strong)`.

**Stats Row:**
- 4 metric cards in a row.
- Number: `JetBrains Mono`, 32px, `--text-primary`.
- Label: `Inter`, 12px, `--text-muted`, uppercase.
- Subtle `border: 1px solid var(--border-subtle)`.

---

### 6.4 Profile Editor (`/profile`)

**Layout:**
- **Top bar:** Serif page title "Your Profile" + profile completeness bar.
  - Completeness bar: Gradient fill (Rose → Violet) with percentage in Mono font.
- **Section-based accordion/tabs:**
  - Sections: Summary, Experience, Education, Skills, Projects, Certifications, Publications, Volunteer.
  - Each section is a collapsible card with header showing section name + item count badge.
- **Each item within a section:**
  - Inline edit mode (click to edit).
  - Drag handle (left grab icon) for reordering within section.
  - Delete button (ghost, danger-colored on hover).
  - "Add New" button at bottom of each section (ghost style + dashed border).
- **Import button:** Top-right, "Import from PDF / LinkedIn" — opens modal with:
  - Drag-and-drop upload zone (dashed border card).
  - OR LinkedIn URL input field.
  - OR image upload (OCR).
- **Auto-save:** Debounced, with subtle "✓ Saved" toast (2s, auto-dismiss).
- **Skills section:** Tag-style input. AI-suggested skills appear as ghost pills below.

---

### 6.5 Resume Builder (`/resumes`, `/resumes/:id`)

**List View (`/resumes`):**
- Grid of resume cards (3 columns desktop, 2 tablet, 1 mobile).
- Each card shows: Template thumbnail (mini preview), resume name, last edited date, ATS score badge.
- "Create New Resume" card: Dashed border, centered "+" icon, ghost styling.
- Sort dropdown (top-right): "Last edited", "Name", "ATS Score".

**Editor View (`/resumes/:id`):**

```
┌─────────────────────────────────────────────────────────┐
│  TOPBAR: Resume Name (editable) ···· [ATS] [Export ▼]   │
├──────────────────────┬──────────────────────────────────┤
│                      │                                  │
│  CONTROLS (40%)      │  LIVE PREVIEW (60%)              │
│                      │                                  │
│  Template Picker     │  ┌──────────────────────────┐    │
│  (thumbnail grid)    │  │                          │    │
│                      │  │   Rendered resume in      │    │
│  ─── Customization   │  │   selected template       │    │
│  Font:    [Inter ▼]  │  │                          │    │
│  Spacing: [──●──]    │  │   (scrollable, zoomable)  │    │
│  Color:   [● ● ●]   │  │                          │    │
│                      │  │   Page indicator:         │    │
│  ─── Sections        │  │   "Page 1 of 2"          │    │
│  ☑ Summary           │  │                          │    │
│  ☑ Experience        │  └──────────────────────────┘    │
│  ☑ Skills            │                                  │
│  ☐ Publications      │                                  │
│  ⠿ (drag to reorder) │                                  │
│                      │                                  │
├──────────────────────┴──────────────────────────────────┤
│  ATS Score Panel (slide-out from right when triggered)   │
│  Score: 92  [■■■■■■■■■□]                                │
│  ✅ No tables detected                                   │
│  ✅ Standard headings                                    │
│  ⚠️ Missing phone number                                │
│  Suggestions: ...                                       │
└─────────────────────────────────────────────────────────┘
```

- Template picker: Small thumbnail grid of available templates. Selected one has a `--gradient-2` (violet) border.
- Color picker: 6–8 preset accent colors as small circles. Click to apply.
- Spacing slider: Minimal track with dot handle.
- Section toggles: Checkboxes with drag handles for reorder.
- Preview panel: White background embedded in the dark surface (the actual resume is on white "paper"). Zoom controls (–/+) bottom-right.
- ATS Score button in topbar opens a slide-out panel from the right with detailed check results. Score badge shows color (green ≥ 80, amber 60–80, red < 60).

---

### 6.6 Job Tailoring Flow (`/tailor` or `/resumes/:id/tailor`)

**This is the money flow — it needs to feel magical.**

**Step 1: Job Input**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  "What role are you targeting?"                     │  ← Serif, 28px
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │ [ Paste Text ]  [ Paste URL ]  [ Image ]    │    │  ← Tab switcher
│  ├─────────────────────────────────────────────┤    │
│  │                                             │    │
│  │  (Active tab content)                       │    │
│  │                                             │    │
│  │  Paste Text:  Large textarea, min 200px h   │    │
│  │  Paste URL:   Single input field            │    │
│  │  Image:       Drag-and-drop zone            │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│               [Analyze →]  (accent gradient btn)    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- Tab switcher: `--border-subtle` underline style. Active tab has `--gradient-2` underline.
- Textarea: Full-width, dark `--bg-surface`, large. Placeholder: "Paste the full job description here..."
- URL input: Placeholder: "https://linkedin.com/jobs/view/..."
- Image drop zone: Dashed border, "📸 Drop a screenshot of the job posting" centered text.
- "Analyze" button: `btn-accent` (gradient Rose → Violet). Disabled until input is provided.

**Step 2: Match Results (appears after analysis, animated transition)**

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  MATCH SCORE                                        │
│  ┌──────────────────┐                               │
│  │                  │   "Senior Backend Engineer     │
│  │       78         │    at TechCorp"                │  ← Serif title
│  │    ───●───       │                               │
│  │                  │   "Good match. A few gaps      │
│  │  (circular gauge)│    to address."                │  ← Body, text-secondary
│  └──────────────────┘                               │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ ✅ STRONG │ │ ⚠ PARTIAL│ │ ❌ GAPS  │             │
│  │ Python   │ │ Docker   │ │ K8s     │             │
│  │ FastAPI  │ │ Leader.  │ │ AWS     │             │
│  │ Postgres │ │          │ │         │             │
│  └──────────┘ └──────────┘ └──────────┘             │
│   (green bg)   (amber bg)   (red bg)                │
│                                                     │
│         [Tailor My Resume →]  (accent gradient)     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

- Match score: Circular gauge with gradient stroke (green/amber/red based on score). Number in `JetBrains Mono`, 48px.
- Gauge animation: Count-up from 0 to score on render (1s ease-out).
- Breakdown cards: Three cards in a row. Each has colored left-border accent.
  - Strong (green): Skills that directly match.
  - Partial (amber): Skills you have but didn't highlight.
  - Gaps (red): Skills you're missing.
- Skills listed inside cards as small mono-font badges.
- "Tailor My Resume" button: `btn-accent`, large, centered.

**Step 3: Tailored Resume (side-by-side diff view)**

```
┌──────────────────────┬──────────────────────────────┐
│  ORIGINAL            │  TAILORED                    │
│                      │                              │
│  "Built APIs"        │  "Built REST APIs handling   │  ← Changed lines have
│                      │   10K+ RPM using FastAPI"    │     violet left-border
│                      │                              │
│  "Managed team"      │  "Managed team"              │  ← Unchanged, dimmed
│                      │                              │
│  Each change has:    │  Each change has:            │
│  [Accept] [Reject]   │  [Edit] buttons              │
│                      │                              │
├──────────────────────┴──────────────────────────────┤
│  [Accept All]  [Reject All]  ····  [Preview Final]  │
└─────────────────────────────────────────────────────┘
```

- Side-by-side: Left = original content (dimmed `--text-muted`). Right = tailored version (bright `--text-primary`).
- Changed sections have a violet left-border highlight.
- Per-change buttons: Small ghost buttons "Accept" / "Reject" / "Edit".
- Bulk actions at bottom: "Accept All", "Reject All", "Preview Final".
- Streaming animation: When AI is generating, the tailored side shows text appearing with a blinking cursor.

---

### 6.7 Cover Letter Editor (`/cover-letters/:id`)

**Layout:**
- **Top bar:** Linked job title + company (clickable), tone selector dropdown.
- **Main area:** Tiptap rich text editor, full width.
  - Standard formatting toolbar (bold, italic, lists) — styled minimally with ghost buttons.
  - On paragraph hover: "✨ Rewrite with AI" ghost button appears at the right edge of the paragraph.
  - AI rewrite: Inline replacement with streaming animation. Old text fades, new text types in.
- **Side panel (collapsible, right side):**
  - JD summary: Key requirements listed as badges.
  - Tone guide: "You're writing in **Formal** tone" with examples.
- **Bottom bar:** Export buttons (PDF via Typst, DOCX), link to the matching resume.

---

### 6.8 Application Tracker — Kanban Board (`/applications`)

**Layout:**

```
┌──────────────────────────────────────────────────────────────────────┐
│  "Applications"  ···· [+ New Application]  ···  Filter ▼  Search   │
├──────────┬──────────┬──────────┬──────────┬──────────┬──────────────┤
│  SAVED   │ APPLIED  │SCREENING │INTERVIEW │  OFFER   │  REJECTED   │
│  (3)     │  (12)    │   (5)    │   (3)    │   (1)    │    (4)      │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────────┤
│ ┌──────┐ │ ┌──────┐ │ ┌──────┐ │          │          │              │
│ │Card  │ │ │Card  │ │ │Card  │ │          │          │              │
│ │      │ │ │      │ │ │      │ │          │          │              │
│ └──────┘ │ └──────┘ │ └──────┘ │          │          │              │
│ ┌──────┐ │ ┌──────┐ │          │          │          │              │
│ │Card  │ │ │Card  │ │          │          │          │              │
│ └──────┘ │ └──────┘ │          │          │          │              │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────────┘
```

- Columns separated by `1px solid var(--grid-line)` — matching the structural grid.
- Column headers: Colored top-border accent (each column a different color from the gradient palette).
- Column count badges: `JetBrains Mono` in a small badge.
- Cards:
  - Job title (bold), company name (secondary), applied date (muted).
  - ATS score badge (if resume linked).
  - Small resume version tag ("ML Eng v2" in mono font).
- Drag-and-drop between columns (Framer Motion Reorder).
- Card click → **slide-out detail panel** from right:
  - Status selector (dropdown).
  - Notes field (textarea).
  - Contact info (name, email inputs).
  - Salary range input.
  - Next deadline (date picker).
  - Linked resume and cover letter (clickable links).
  - Status change timeline (vertical timeline with dots and dates).

---

### 6.9 Analytics (`/analytics`)

**Layout:** Simple. Clean. Mono font for all numbers.

- **Stats Row:** 4 metric cards (same as dashboard).
  - Total Applications | Response Rate | Interview Rate | Offer Rate
  - Numbers in `JetBrains Mono`, 32px.
- **Trend Chart:** Single line chart showing applications over time (weekly).
  - Line color: gradient (Violet → Cyan).
  - Grid lines behind chart use `--grid-line`.
  - Axis labels in `--text-muted`.
- **Resume Performance:** Horizontal bar chart — response rate per resume version.
  - Bars use gradient fills.
  - Labels in `Inter`, values in `JetBrains Mono`.
- **Recent Activity:** Simple list of last 10 status changes with timestamps.

---

### 6.10 Portfolio Settings (`/portfolio`)

**Layout:**
- **Two-panel:** Controls (left, 40%) + Live Preview (right, 60%).
- **Controls:**
  - Template picker: 3 portfolio template thumbnails.
  - Accent color picker: 8 preset color circles.
  - Section visibility toggles (checkbox + label).
  - Section order: Drag-and-drop list.
  - Vanity URL: Input field showing `scribe.ai/` prefix (non-editable) + slug input.
  - Password protection: Toggle + conditional password field.
- **Preview panel:** Live iframe or rendered component showing how the portfolio looks.
- **Bottom stats:** "Total Views: 234" in mono font. "Share" button → Copy URL + QR modal.

---

### 6.11 Settings (`/settings`)

**Sections (navigated via sidebar sub-nav or tabs):**

- **Account:**
  - Avatar (circular, with `--gradient-2` border ring), name, email.
  - Connected providers list (Google ✅, LinkedIn ✅, GitHub ❌ Connect).
- **Preferences:**
  - Theme toggle: Dark / Light / System.
  - Default export format dropdown.
  - Notification preferences (toggles).
- **Billing:**
  - Current plan card with upgrade CTA (gradient accent button).
  - "Manage Subscription" → Stripe Customer Portal.
- **Data:**
  - "Export All Data" button (downloads JSON).
  - "Delete Account" button — danger style, requires confirmation modal with "type DELETE to confirm" input.

---

## 7. Responsive Behavior

| Breakpoint | Layout Changes |
|---|---|
| `≥1280px` | Full two-panel layouts, sidebar expanded (260px), 3-column grids |
| `1024–1279px` | Sidebar collapses to icons (64px), panels stack on some pages, 2-column grids |
| `768–1023px` | Sidebar becomes top hamburger menu, single-column layouts, bottom mobile nav optional |
| `<768px` | Full mobile: hamburger nav, stacked cards, single-column everything |

### Key Mobile Adaptations
- **Resume editor:** Preview and Controls become tabs (swipe or toggle), not side-by-side.
- **Tailoring diff:** Stacked vertically (original on top, tailored below).
- **Kanban:** Horizontal scrollable columns (with snap points and column indicator dots).
- **Landing hero:** Smoke effect becomes slower autonomous blobs. Reduce canvas resolution.
- **Grid lines:** Reduce to 128px grid cells on mobile for less visual noise.
- **Feature bento box:** Collapse to single column stack.

---

## 8. Accessibility & Performance

### Accessibility
- All interactive elements have `:focus-visible` styles using `--border-focus` ring.
- Color alone never conveys meaning — always paired with icons or text labels (e.g., ATS badges have both color AND text).
- `prefers-reduced-motion`: Disable WebGL smoke, flowing ribbons, and count-up animations. Use static equivalents.
- Minimum contrast ratios: Text on dark backgrounds must pass WCAG AA (4.5:1 for small text, 3:1 for large).
- All images have alt text. Decorative images use `aria-hidden`.

### Performance
- WebGL canvas: Lazy-loaded, only initialized when hero is in viewport. 30fps cap.
- Fonts: Preloaded with `<link rel="preload">`. Display swap.
- Grid background: Pure CSS (no JS). Minimal perf impact.
- Glassmorphism: `backdrop-filter: blur()` can be expensive. Limit to max 5 visible blurred surfaces at once.
- Code-split: Each page is lazy-loaded. Dashboard shell loaded first, page content streams in.
- Images: Next.js `<Image>` with WebP, responsive sizes, lazy loading.

---

*Last Updated: April 21, 2026*
