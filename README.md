# ThrowForm

Parametric pottery rib tool generator — design bowl profiles, compute clay science, generate manufacturing-ready exports, and run business economics for production pottery.

A potter designs a bowl, the app extracts wall curvature into a rib tool shape, exports 1:1mm SVG/DXF files for laser cutting, calculates wet clay weight with shrinkage compensation, and models unit economics through Amazon FBA.

## Architecture

```
  ┌──────────────────────────────────────────────────────────────────┐
  │                        5-Tab Interface                            │
  │                                                                   │
  │   DESIGN          HQ            MAKE         AGENTS      $$$     │
  │   profiles,       clay body,    SVG/DXF      Claude      unit    │
  │   sliders,        shrinkage,    export,      agents:     econ,   │
  │   nesting,        3D wireframe, throwing     market,     COGS,   │
  │   rib preview     volumes       guide,       listing,    margin, │
  │                                 kiln pack    vendor      BEP     │
  └────────────────────────┬─────────────────────────────────────────┘
                           │
  ┌────────────────────────▼─────────────────────────────────────────┐
  │                    geometry.js (pure math)                        │
  │                                                                   │
  │   computeVolumes()    Solid-of-revolution frustum sums           │
  │   nest()              Bowl stacking: frustum, flanged, stepped   │
  │   generateRibPolygon  5-point wall-matching rib outline          │
  │   exportSVG/DXF       1:1mm laser/CNC manufacturing files       │
  │   rimGeometry()       11 rim types via bezier paths              │
  │   catmullRom()        Custom profile curve smoothing             │
  └──────────────────────────────────────────────────────────────────┘
```

Pure SVG rendering — no Canvas, no Three.js. React 18 + Vite 6. Zero external UI libraries.

## Features

### Parametric Design
- **10+ preset profiles** including real geometry extracted from IKEA Fargklar SVG bezier curves
- **Custom profile editor** — drag control points, preset shapes (hemisphere, parabola, cylinder, V-bowl, tulip), undo history
- **11 rim types** — rounded, beveled, flared, tulip, straight, rolled, tapered, flanged, coupe, thickened, stepped
- **Nesting strategies** — frustum stacking (bowls), flanged (mugs with rim shelf), stepped (recessed seat)
- **Real-time cross-section** with full bowl anatomy: foot ring, floor, walls, rim, gap measurements

### Rib Tool Generation

```
     D ←——————— E        rim
    /             \
   / inner    outer\
  /   wall     wall \
 C                   |    floor level
 |                   |
 A ——————————————— B      table (flat base)
```

Left edge (C→D) = bowl's inner wall profile. Right edge (B→E) = outer wall + foot step. Base (A→B) = flat for wheel truing. Step (A→C) = floor gauge. Center 7mm hanging hole for kiln pegs.

### Clay Science
- **8 clay bodies** — porcelain (14% shrink), stoneware (12%), earthenware (6%), B-Mix, speckled, raku, paper clay
- **Shrinkage compensation** — thrown size = fired size / (1 - shrinkage%), volume scales by cube law
- **Volume calculations** — interior capacity (mL/oz), clay weight (g/lbs) with 15% centering overage, glaze surface area (in²)
- **3D wireframe** — interactive drag-to-rotate bowl visualization

### Manufacturing
- **SVG export** — 1:1mm hairline cuts (red) + engrave text (black), separated into laser layers
- **DXF export** — AC1015/R2000 for CAD/CNC
- **Hand-cut template** — A4 landscape with crop marks and calibration ruler
- **Kiln shelf packing** — how many bowls fit on standard shelves (10"–16" round, 12x24" rect)
- **Throwing guide** — step-by-step instructions adjusted for clay body, shrinkage, dimensions
- **Manufacturing methods** — handmade ($1.20–2.40/unit), SLA resin ($2.80–3.70), drop ship ($4.50–5.70), hybrid ($2.00–2.70)

### Business Economics
- **Breakeven chart** — revenue vs cost lines, profit region, breakeven point in units
- **Unit economics** — price slider, COGS by manufacturing method, Amazon FBA fees (15% referral + $5.50 + $2/unit)
- **Margin calculation** — price – COGS – platform fees with constraint warnings

### AI Agents
Six Claude-powered research agents (requires Anthropic API key):
- Market Intel — competitive analysis, positioning
- Listing Copy — Amazon/Etsy product descriptions
- Social Media — Instagram/TikTok content ideas
- Launch Strategy — product launch planning
- Vendor Auto — manufacturing partner sourcing
- Feedback→Design Loop — iterate design from customer feedback

## Quick Start

```bash
npm install
npm run dev
```

Opens at http://localhost:5173

```bash
npm run build     # Production build to dist/
npm run test      # Run vitest suite
```

## Project Structure

```
src/
├── App.jsx           # 2042-line React SPA: 5 tabs, state, all UI components
├── geometry.js       # Pure math: volumes, nesting, rib generation, exports
├── geometry.test.js  # Unit tests: profile integrity, volume scaling, nesting
├── exports.test.js   # SVG/DXF generation tests
├── App.test.jsx      # Component integration tests
└── main.jsx          # React entry point
```

## Key Algorithms

**Volume (solid of revolution):** Frustum summation along wall profile — `V = Σ (π/3) × |Δh| × (r₁² + r₁r₂ + r₂²)` from floor to rim. Clay weight = (outer volume - interior volume) × density.

**Nesting:** Scale bowl B2 by factor `s` so B1's inner wall clears B2's outer wall. Stack B2 on B1's foot ring. Measure gap at 40% wall height. Validate draft angle (3–12° optimal). Efficiency = stack height / (count × single height).

**Rib polygon:** Transform bowl wall curves to horizontal rib coordinates. Left edge = inner wall (filleted), right edge = outer wall + foot step, bottom = flat reference. Fillet radius constrained by `min(r, footH×0.4, gap×0.1)`.

**Catmull-Rom spline:** Custom profile smoothing with tension=0.5 through 4-point windows for ceramic-friendly curves.

## Tech Stack

React 18 / Vite 6 / Pure SVG / vitest / IBM Plex Mono + Fraunces / Claude API (agents tab)
