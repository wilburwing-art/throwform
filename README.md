# ThrowForm

Parametric pottery rib tool generator with real bowl geometry extracted from IKEA Färgklar SVG bezier curves.

## Features
- **Bowl cross-sections** with full anatomy: foot ring, floor, walls, rim (6 rim types)
- **Nesting visualization** with gap measurement and stacking
- **Rib tool profiles** — 5-point stepped shape matching actual wall curvature
- **1:1mm SVG export** for laser cutting / CNC manufacturing
- **AI agents** for market research, listing copy, social media (requires Anthropic API)
- **Imperial/metric toggle** for all measurements

## Quick Start

```bash
npm install
npm run dev
```

## Using with Claude Code

```bash
cd throwform
claude
```

The `CLAUDE.md` file provides full project context for Claude Code CLI.

## Rib Tool Shape

```
     D ←——————— E        ▲ rim
    /             \
   / inner    outer\
  /   wall     wall \
 C                   |    ← floor level
 |                   |
 A ——————————————— B      ← table (flat base)
```

Left edge (C→D) = bowl's inner wall profile
Right edge (B→E) = bowl's outer wall profile
Base (A→B) = flat for wheel truing
Step (A→C) = foot + floor height gauge
