# ThrowForm v5 — Parametric Pottery Rib Tool Generator

## Project Overview
A React app that generates parametric rib tools for nesting pottery bowls. Extracts real bowl geometry from IKEA Färgklar SVG bezier curves and computes cross-sections, nesting gaps, manufacturing-ready rib tool profiles, clay science calculations, and business economics.

## Architecture
Single-file React app (`src/App.jsx`, ~2042 lines) with no external UI libraries. Pure SVG rendering, no canvas.

### Key Sections in App.jsx
- **Palette** (line ~7): Organic light/dark palettes (`PL`/`PD`), mutable `P` ref toggled by App
- **CLAY_BODIES** (line ~25): 8 clay types with shrinkage %, density, cone data
- **KILN_SHELVES** (line ~37): Standard shelf sizes for kiln packing optimization
- **PROFILES** (line ~46): 10 bowl profiles including custom draggable — outer wall points `[radius, height]`, foot/floor/rim params
- **computeVolumes** (line ~138): Solid-of-revolution frustum sums for interior volume, clay weight, glaze area
- **RIM_TYPES** (line ~185): Six rim types (rounded, beveled, flared, tulip, straight, rolled)
- **Nesting** (`nest`, ~240): Scaled bowl stack with foot ring constraints, baseY stacking
- **CrossSection** (~330): Full bowl anatomy SVG — foot, floor, walls, rim, nesting annotations
- **RibToolView** (~620): Rib tool SVG — 5-point stepped outline with scaled wall curvature
- **exportSVG** (~820): 1:1mm SVG export for laser cutting / CNC
- **ShrinkageCard** (~1081): Wet→dry→fired dimension calculator per clay body
- **Bowl3D** (~1123): 3D wireframe bowl visualization with rotation
- **BreakevenChart** (~1420): SVG breakeven analysis chart
- **KilnShelfView** (~1473): Kiln shelf packing layout optimizer
- **ThrowingGuide** (~1546): Clay-body-specific throwing technique guide
- **App** (~1600): Main layout with 5 tabs, sliders, toggles, dark/light mode

### Tabs
1. **DESIGN** — Profile selection, parametric sliders, cross-section + nesting SVG, rib tool preview
2. **HQ** — Specs dashboard, shrinkage card, 3D wireframe, volume/weight/glaze stats
3. **MAKE** — Manufacturing methods (handmade, 3D print, CNC, laser), throwing guide, kiln shelf packing, vendor recommendations
4. **AGENTS** — AI agents (Market Intel, Listing, Social, Launch, Vendor Auto, Feedback→Design loop)
5. **MONEY** — Unit economics, manufacturing cost inputs, margin calc, breakeven chart

### Rib Tool Geometry (5-point shape)
The rib cross-section matches the bowl wall profile:
- **A** (0, 0): Step bottom-left (table level)
- **B** (ribThick, 0): Base bottom-right (table level)
- **B→E**: Outer wall — straight up through foot+floor step, then curves right to rim
- **E→D**: Across rim top
- **D→C**: Inner wall — curves down from rim to floor level
- **C→A**: Vertical step (floor gauge)

Left edge = bowl's inner wall (green). Right edge = bowl's outer wall (gray).
Wall curvature is scaled: `sweepScale = (ribThick * 0.75) / maxSweep`
Chamfer via `edgeExt = ribThick / (2 * tan(edgeAngle/2))`

### Bowl Profile Data
`b.outer` = array of `[radius, height]` pairs, ordered floor→rim (smallest radius first, h=0 at wall base).
`nest()` scales each bowl by factor `s` and computes `footH`, `floorT`, `baseY`.
Custom profile supports drag-to-edit via mouse events.

## Commands
```bash
npm install
npm run dev      # Start dev server on :5173
npm run build    # Production build to dist/
```

## Key Conventions
- All dimensions in mm internally, imperial toggle converts display only
- SVG coordinate system: h=0 at bottom, Y-flipped for SVG rendering
- Colors: `C = [terracotta, amber, sage, slate, plum, blush]` cycling per bowl
- Fonts: IBM Plex Mono (body), Fraunces (headings)
- Light/dark theme toggle: light default (`PL`), dark option (`PD`)
- Card component with optional glow and collapse for consistent panel layout

## State
All state in App component via useState hooks. No routing, no global state.
Key state: `profile`, `imperial`, `dark`, `clayBody`, `shrinkage`, `mfg`, `price`, `tab`, `ag` (agent results), `drag`/`px`/`py` (custom profile editing), `rot` (3D rotation), `shelfIdx`.
Profile switching resets dimensional parameters via useEffect.

## AI Agents Tab
Uses Anthropic API (claude-sonnet-4) for market research, listing copy, social media, etc.
API calls go through `claude()` helper function.
