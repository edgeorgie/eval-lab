# Design system

## Principles

- Color carries meaning: green passes, red fails.
- Show the evidence: one click from any cell to the raw output.

## Typography

| Role | Typeface |
|---|---|
| Display | Bricolage Grotesque |
| Text | Figtree |
| Code | JetBrains Mono |

Fonts are loaded with `next/font` and exposed as CSS variables in `app/layout.tsx`.

## Color tokens

Defined as CSS variables in `app/globals.css` and mapped into Tailwind's theme.

| Token | Value | Use |
|---|---|---|
| `canvas` | `#f6f5f1` | Page background |
| `ink` | `#101216` | Text |
| `brand` | `#3b4cff` | Primary action |
| `pass` | `#0f9d6b` | Passed checks |
| `fail` | `#e5484d` | Failed checks |
| `warn` | `#f5a524` | Mid pass rate |

## Motion

- Cells pop in with a spring as results arrive.
- Pass-rate rings animate to their value.
- Soft blobs drift behind the hero.

All animation respects `prefers-reduced-motion`.

## Components

| Component | Purpose |
|---|---|
| Matrix | Variants by cases grid |
| Ring | Animated pass rate |
| Drawer | Cell detail and diff |
| Editors | Variant and case editors |

## Rules

- Color carries meaning; it is never the only signal.
- Interactive elements have visible focus and accessible names.
- New tokens are added to `globals.css` and this document together.
