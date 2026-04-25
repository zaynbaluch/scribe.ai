# Scribe Design System & UI Guidelines

This document serves as the source of truth for the **Scribe** aesthetic. Follow these principles to maintain the "advanced agentic" look and feel.

## 1. Design Philosophy
Scribe uses a **High-Density, Glassmorphic Dark Mode** aesthetic. It is inspired by modern developer tools (Vercel, Linear, Framer) and emphasizes:
- **Depth**: Through subtle borders and backdrop blurs.
- **Motion**: Every interaction should feel responsive and fluid.
- **Ambient Glow**: Using soft, large background blobs instead of sharp gradients.
- **Precision**: High density, small typography (`text-sm` by default), and compact padding.

## 2. Color Palette
The system is built on a deep monochromatic base with vibrant accent gradients.

### Base Colors
- **Background**: `#0a0a0f` (Deep obsidian)
- **Surface (Cards)**: `#18181b/50` (Translucent zinc)
- **Borders**: `rgba(255, 255, 255, 0.05)` to `0.15`
- **Text Primary**: `#e4e4e7` (Zinc 200)
- **Text Secondary**: `#a1a1aa` (Zinc 400)

### Accents (The Scribe Gradient)
- **Gradient 1 (Pink/Red)**: `#FF0080` (Vivid Raspberry)
- **Gradient 2 (Purple)**: `#7c3aed` (Violet 600)
- **Selection**: `selection:bg-[#7c3aed] selection:text-white`

## 3. Typography
- **Display (Headings)**: **Outfit** or **Playfair Display** (for a technical yet sophisticated look). 
  - Use `tracking-tighter` and `leading-[1.05]`.
- **Body**: **Inter** (for maximum readability).
  - Use `text-sm` for UI elements and `text-lg` for marketing copy.

## 4. Key UI Patterns

### Bento Grids
Use varying column spans (`col-span-1`, `col-span-2`) with `rounded-3xl` and `bg-[#18181b]/50`. Each card should have:
- `border border-white/10`
- `backdrop-blur-sm`
- Subtle hover effects (opacity shifts or slight scaling).

### Interactive Backgrounds
Always include the `InteractiveBackground` component in the root layout of public pages.
- **Pattern**: 2-3 large, extremely blurred (`200px+`) blobs in corners.
- **Interaction**: Subtle mouse parallax (offsetting `x` and `y` by `mousePos / 30`).

### Sticky/Fixed Navbar
- Use `backdrop-blur-2xl`.
- Height should shrink on scroll (e.g., `64px` -> `56px`).
- Background opacity should increase as the user scrolls over content.

## 5. Component Snippets

### The "Scribe Button"
```tsx
<Link className="h-10 px-4 rounded-lg text-sm font-semibold bg-gradient-to-r from-[#FF0080] to-[#7c3aed] text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
  Get Started <ArrowRight size={16} />
</Link>
```

### The "Glass Card"
```tsx
<div className="rounded-2xl border border-white/10 bg-[#18181b]/50 backdrop-blur-md p-6 shadow-2xl">
  {/* Content */}
</div>
```

## 6. Animation Guidelines
- **Duration**: Keep transitions between `150ms` and `300ms`.
- **Easing**: Use `easeInOut` for most UI transitions.
- **Parallax**: Keep parallax factors low (`1/30` or `1/50`) to avoid motion sickness while adding depth.
