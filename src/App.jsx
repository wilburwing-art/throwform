import { useState, useEffect, useRef } from "react";
import { VESSEL, PROFILES, computeVolumes, RIM_TYPES, rimGeometry, genInner, nest, generateRibSVG, generateTemplateSVG, generateProfileJSON } from "./geometry.js";

const mono = "'IBM Plex Mono', 'Menlo', monospace";
const serif = "'Fraunces', 'Georgia', serif";
const C = ["#c0785a","#b89a4e","#7a9a7e","#7a8e9a","#9a7e8c","#b88a8a"];

// Organic palette — light & dark
const PL = {
  bg: "#f5f0e8", bgDeep: "#ece5d9", card: "#faf6ef", cardBorder: "#e0d5c4",
  text: "#3d3229", textSoft: "#6b5d51", textMuted: "#8c7e6f", textFaint: "#b5a898",
  accent: "#c0785a", accentSoft: "#c0785a22", green: "#7a9a7e", purple: "#9a7e8c",
  blue: "#7a8e9a", amber: "#b89a4e", svgBg: "#f0ebe2", grid: "#e0d5c4",
  inner: "#7a9a7e", outer: "#8c7e6f", rim: "#c0785a", foot: "#9a7e8c",
};
const PD = {
  bg: "#1a1714", bgDeep: "#12100d", card: "#242018", cardBorder: "#3a3428",
  text: "#e8e0d4", textSoft: "#bfb5a5", textMuted: "#8c8070", textFaint: "#5a5044",
  accent: "#d4896a", accentSoft: "#d4896a22", green: "#8aaa8e", purple: "#aa8e9c",
  blue: "#8a9eaa", amber: "#c8aa5e", svgBg: "#1e1b16", grid: "#3a3428",
  inner: "#8aaa8e", outer: "#9c9080", rim: "#d4896a", foot: "#aa8e9c",
};
let P = PL; // mutable ref, updated by App

// Clay bodies with shrinkage and density data
const CLAY_BODIES = {
  custom: { name: "Custom", shrinkage: 12, density: 1.8, cone: "—", desc: "Manual shrinkage %" },
  porcelain: { name: "Porcelain", shrinkage: 14, density: 1.75, cone: "10", desc: "Translucent, white, ∆10" },
  stoneware: { name: "Stoneware", shrinkage: 12, density: 1.85, cone: "6–10", desc: "Standard studio clay" },
  earthenware: { name: "Earthenware", shrinkage: 6, density: 1.70, cone: "06–02", desc: "Low-fire, terracotta" },
  bmix: { name: "B-Mix ∆6", shrinkage: 11, density: 1.82, cone: "5–6", desc: "Popular white stoneware" },
  speckled: { name: "Speckled", shrinkage: 12, density: 1.88, cone: "6", desc: "Manganese speckle body" },
  raku: { name: "Raku", shrinkage: 8, density: 1.72, cone: "06", desc: "Thermal-shock resistant" },
  paperclay: { name: "Paper Clay", shrinkage: 10, density: 1.60, cone: "6", desc: "Fiber-reinforced, light" },
};

// Standard kiln shelf sizes (diameter in mm)
const KILN_SHELVES = [
  { name: '10" round', shape: "round", d: 254 },
  { name: '12" round', shape: "round", d: 305 },
  { name: '14" round', shape: "round", d: 356 },
  { name: '16" round', shape: "round", d: 406 },
  { name: '12×24" rect', shape: "rect", w: 305, h: 610 },
  { name: '14×28" rect', shape: "rect", w: 356, h: 711 },
];


async function claude(sys, usr, search = false) {
  try {
    const b = { model: "claude-sonnet-4-20250514", max_tokens: 1024, system: sys, messages: [{ role: "user", content: usr }] };
    if (search) b.tools = [{ type: "web_search_20250305", name: "web_search" }];
    const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
    const d = await r.json();
    return d.content?.map(x => x.text || "").filter(Boolean).join("\n") || "No response.";
  } catch (e) { return `Error: ${e.message}` }
}

function Sl({ l, v, fn, mn, mx, st = 1, u = "mm", imperial }) {
  const display = imperial && u === "mm" ? `${(v / 25.4).toFixed(2)}"` : `${st < 1 ? v.toFixed(1) : v}${u && ` ${u}`}`;
  return (<div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
      <span style={{ fontSize: 11, color: P.textMuted, fontFamily: mono }}>{l}</span>
      <span style={{ fontSize: 11, color: P.text, fontFamily: mono, fontWeight: 600 }}>{display}</span>
    </div>
    <input type="range" min={mn} max={mx} step={st} value={v} onChange={e => fn(parseFloat(e.target.value))} style={{ width: "100%", accentColor: P.accent }} />
  </div>);
}
function Btn({ children, onClick, color = P.accent, full }) {
  return (<button onClick={onClick} style={{ padding: "11px 18px", width: full ? "100%" : "auto",
    background: color, border: "none", borderRadius: 8,
    color: "#fff", fontFamily: mono, fontSize: 11, fontWeight: 600, cursor: "pointer",
    boxShadow: `0 2px 8px ${color}33`, transition: "all 0.2s" }}>{children}</button>);
}
function Card({ children, title, color = P.accent, glow }) {
  return (<div style={{ background: P.card, borderRadius: 12, padding: 18,
    border: `1px solid ${glow ? color + "44" : P.cardBorder}`, position: "relative", overflow: "hidden",
    boxShadow: "0 1px 4px rgba(61,50,41,0.06)" }}>
    {glow && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: color, opacity: 0.6 }} />}
    {title && <h3 style={{ margin: "0 0 12px", fontSize: 10, color: P.textMuted, fontFamily: mono, letterSpacing: "0.12em", textTransform: "uppercase" }}>{title}</h3>}
    {children}
  </div>);
}
function Stat({ l, v, c = P.text }) {
  return (<div style={{ background: P.bgDeep, borderRadius: 8, padding: "8px 10px", border: `1px solid ${P.cardBorder}` }}>
    <div style={{ fontSize: 9, color: P.textFaint, fontFamily: mono, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{l}</div>
    <div style={{ fontSize: 14, color: c, fontFamily: mono, fontWeight: 600 }}>{v}</div>
  </div>);
}

// ═══════════════════════════════════════════════════════════
// CROSS-SECTION — with rim geometry types, mm grid, bowl selector
// ═══════════════════════════════════════════════════════════
function CrossSection({ p, bowls, showNesting, showAnnotations, rimType, selectedBowl, onSelectBowl, imperial, svgRef }) {
  const sc = 1.5;
  const mm2in = v => (v / 25.4).toFixed(2) + '"';
  const fmt = v => imperial ? mm2in(v) : v.toFixed(1) + 'mm';
  const fmtI = v => imperial ? mm2in(v) : v.toFixed(0) + 'mm';

  // ── FIXED LAYOUT from base profile (viewBox never changes) ──
  const baseRimR = p.rimDiameter / 2;
  const baseMaxOutR = baseRimR + p.wallThickness + p.rimLip.overhang + 4;
  const baseFootH = p.foot.height, baseFloorTop = baseFootH + p.floor.thickness;
  const baseInnerWall = p.outer.map(([r, h]) => [r, h + baseFloorTop]);
  const baseWallTopH = baseInnerWall[baseInnerWall.length - 1][1];
  const baseInnerTopR = baseInnerWall[baseInnerWall.length - 1][0];
  const baseOuterTopR = p.outer[p.outer.length - 1][0] + p.wallThickness;
  const baseTestRim = rimGeometry(rimType, baseInnerTopR, baseOuterTopR, baseWallTopH,
    p.rimLip.height, p.rimLip.overhang, p.wallThickness, r => r, h => h, "R");
  const baseRimTopH = baseTestRim.topH;
  const baseHeadroom = Math.max(baseRimTopH - baseWallTopH, p.rimLip.height) + 8;
  const baseVisTopH = baseWallTopH + baseHeadroom;

  const padL = 20, padR_val = showAnnotations ? 100 : 20, padT = 30, padB = 20;
  const vw = baseMaxOutR * sc * 2 + padL + padR_val;
  const vh = baseVisTopH * sc + padT + padB;
  const cxv = padL + baseMaxOutR * sc;

  // ── DRAWING DATA from selected bowl (or base) ──
  const ab = selectedBowl != null ? bowls[selectedBowl] : null;
  const wt = ab ? p.wallThickness * ab.s : p.wallThickness;
  const footHt = ab ? ab.footH : p.foot.height;
  const floorT = ab ? ab.floorT : p.floor.thickness;
  const floorTop = footHt + floorT;
  const outerData = ab ? ab.outer : p.outer;
  const footOR = ab ? ab.footOuter : p.foot.outerRadius;
  const footIR = ab ? ab.footInner : p.foot.innerRadius;
  const rimDia = ab ? ab.rim : p.rimDiameter;
  const lipH = p.rimLip.height * (ab ? ab.s : 1);
  const lipOv = p.rimLip.overhang * (ab ? ab.s : 1);

  const innerWall = outerData.map(([r, h]) => [r, h + floorTop]);
  const outerWallCurve = outerData.map(([r, h]) => [r + wt, h + floorTop]);
  const fullOuterPts = [[footOR, footHt], outerWallCurve[0], ...outerWallCurve.slice(1)];
  const wallTopH = innerWall[innerWall.length - 1][1];
  const innerTopR = innerWall[innerWall.length - 1][0];
  const outerTopR = outerWallCurve[outerWallCurve.length - 1][0];
  const maxOutR = rimDia / 2 + wt + lipOv + 4;

  // Transforms use FIXED base layout
  const tx = r => cxv + r * sc, txL = r => cxv - r * sc;
  const ty = h => padT + (baseVisTopH - h) * sc;

  const testRim = rimGeometry(rimType, innerTopR, outerTopR, wallTopH, lipH, lipOv, wt, r => r, h => h, "R");
  const rimTopH = testRim.topH;
  const mkPath = (pts, side) => pts.map(([r, h], i) => `${i === 0 ? "M" : "L"}${(side === "L" ? txL : tx)(r).toFixed(1)},${ty(h).toFixed(1)}`).join(" ");
  const rimR_right = rimGeometry(rimType, innerTopR, outerTopR, wallTopH, lipH, lipOv, wt, tx, ty, "R");

  // Grid: 10mm spacing (static, anchored to viewBox)
  const gridStep = 10 * sc;
  const gridLabel = imperial ? '≈ ⅜"' : '10mm';

  return (
    <>
    <svg ref={svgRef} viewBox={`0 0 ${vw} ${vh}`} style={{ width: "100%", background: P.svgBg, borderRadius: 8 }}>
      {/* STATIC GRID */}
      <defs>
        <pattern id="mmgrid" width={gridStep} height={gridStep} patternUnits="userSpaceOnUse">
          <path d={`M ${gridStep} 0 L 0 0 0 ${gridStep}`} fill="none" stroke={P.grid} strokeWidth={0.4} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={vw} height={vh} fill="url(#mmgrid)" />

      {/* Grid legend — bottom right: filled square with label */}
      <g transform={`translate(${vw - padR_val - 2},${vh - 28})`}>
        <rect x={0} y={0} width={gridStep} height={gridStep} fill={P.grid + "44"} stroke={P.textFaint} strokeWidth={0.6} />
        <text x={gridStep / 2} y={gridStep + 9} textAnchor="middle" fontSize="4.5" fill={P.textFaint} fontFamily={mono}>{gridLabel}</text>
      </g>

      {/* Center line */}
      <line x1={cxv} y1={padT - 5} x2={cxv} y2={ty(0) + 10} stroke={P.cardBorder} strokeWidth={0.5} strokeDasharray="4,3" />
      {/* Table line */}
      <line x1={padL - 5} y1={ty(0)} x2={vw - padR_val + 5} y2={ty(0)} stroke={P.textFaint} strokeWidth={1} />
      <text x={padL - 5} y={ty(0) + 11} fontSize="6.5" fill={P.textFaint} fontFamily={mono}>TABLE</text>

      {/* ══ SOLID CLAY BODY ══ */}
      {(() => {
        const clayColor = selectedBowl != null ? C[selectedBowl % 6] : "#b8a08a";
        const clayStroke = selectedBowl != null ? C[selectedBowl % 6] : "#9a8472";

        // Outer contour (clockwise): right foot → right wall up → left wall down → left foot
        const outerPts = [
          [tx(footOR), ty(0)],
          [tx(footOR), ty(footHt)],
          ...fullOuterPts.slice(1).map(([r, h]) => [tx(r), ty(h)]),
          ...[...fullOuterPts.slice(1)].reverse().map(([r, h]) => [txL(r), ty(h)]),
          [txL(footOR), ty(footHt)],
          [txL(footOR), ty(0)],
        ];

        // Inner contour (bowl cavity) — counterclockwise hole
        const innerPts = [
          ...innerWall.map(([r, h]) => [tx(r), ty(h)]),
          ...[...innerWall].reverse().map(([r, h]) => [txL(r), ty(h)]),
        ];

        // Foot hollow — counterclockwise hole
        const footHollow = [
          [tx(footIR), ty(0)],
          [tx(footIR), ty(footHt)],
          [txL(footIR), ty(footHt)],
          [txL(footIR), ty(0)],
        ];

        const ptsToD = pts => pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + "Z";
        const d = ptsToD(outerPts) + " " + ptsToD(innerPts) + " " + ptsToD(footHollow);

        return <path d={d} fill={clayColor} stroke={clayStroke} strokeWidth={0.5} strokeLinejoin="round" fillRule="evenodd" />;
      })()}

      {/* Rim geometry — solid */}
      {(() => {
        const rc = selectedBowl != null ? C[selectedBowl % 6] : "#b8a08a";
        const rs = selectedBowl != null ? C[selectedBowl % 6] : "#9a8472";
        const leftRim = rimGeometry(rimType, innerTopR, outerTopR, wallTopH, lipH, lipOv, wt, txL, ty, "R");
        return (<>
          <path d={rimR_right.path} fill={rc} stroke={rs} strokeWidth={1} strokeLinejoin="round" />
          <path d={leftRim.path} fill={rc} stroke={rs} strokeWidth={1} strokeLinejoin="round" />
        </>);
      })()}

      {/* Nesting — full anatomy for each nested bowl */}
      {showNesting && !ab && bowls.slice(1).map((b, idx) => {
        const c = C[(idx + 1) % 6];
        const bWt = p.wallThickness * b.s;
        const bFootH = b.footH;
        const bFloorT = b.floorT;
        const bFloorTop = b.baseY + bFootH + bFloorT;

        const bInner = b.outer.map(([r, h]) => [r, h + bFloorTop]);
        const bOuter = b.outer.map(([r, h]) => [r + bWt, h + bFloorTop]);
        const bFullOuter = [[b.footOuter, b.baseY + bFootH], bOuter[0], ...bOuter.slice(1)];

        const outerPts = [
          [tx(b.footOuter), ty(b.baseY)],
          [tx(b.footOuter), ty(b.baseY + bFootH)],
          ...bFullOuter.slice(1).map(([r, h]) => [tx(r), ty(h)]),
          ...[...bFullOuter.slice(1)].reverse().map(([r, h]) => [txL(r), ty(h)]),
          [txL(b.footOuter), ty(b.baseY + bFootH)],
          [txL(b.footOuter), ty(b.baseY)],
        ];

        const innerPts = [
          ...bInner.map(([r, h]) => [tx(r), ty(h)]),
          ...[...bInner].reverse().map(([r, h]) => [txL(r), ty(h)]),
        ];

        const footPts = [
          [tx(b.footInner), ty(b.baseY)],
          [tx(b.footInner), ty(b.baseY + bFootH)],
          [txL(b.footInner), ty(b.baseY + bFootH)],
          [txL(b.footInner), ty(b.baseY)],
        ];

        const ptsToD = pts => pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ") + "Z";
        const bodyD = ptsToD(outerPts) + " " + ptsToD(innerPts) + " " + ptsToD(footPts);

        return (<g key={idx} opacity={0.55}>
          <path d={bodyD} fill={c} stroke={c} strokeWidth={0.3} strokeLinejoin="round" fillRule="evenodd" />

          {/* Rim solid */}
          {(() => {
            const bInnerTopR = bInner[bInner.length - 1][0];
            const bOuterTopR = bOuter[bOuter.length - 1][0];
            const bWallTopH = bInner[bInner.length - 1][1];
            const bLipH = p.rimLip.height * b.s;
            const bLipOv = p.rimLip.overhang * b.s;
            const rR = rimGeometry(rimType, bInnerTopR, bOuterTopR, bWallTopH, bLipH, bLipOv, bWt, tx, ty, "R");
            const rL = rimGeometry(rimType, bInnerTopR, bOuterTopR, bWallTopH, bLipH, bLipOv, bWt, txL, ty, "R");
            return (<>
              <path d={rR.path} fill={c} stroke={c} strokeWidth={0.3} strokeLinejoin="round" />
              <path d={rL.path} fill={c} stroke={c} strokeWidth={0.3} strokeLinejoin="round" />
            </>);
          })()}

          <text x={tx(bInner[bInner.length - 1][0]) + 4} y={ty(bInner[bInner.length - 1][1])} fontSize="5.5" fill={c} fontFamily={mono} fontWeight="600">{b.label}</text>
        </g>);
      })}

      {/* Gap measurement — between B1 inner wall and B2 outer wall */}
      {showNesting && showAnnotations && !ab && bowls.length >= 2 && (() => {
        const b1 = bowls[0], b2 = bowls[1];
        const b2Wt = p.wallThickness * b2.s;
        const b1FloorTop = b1.baseY + b1.footH + b1.floorT;
        const b2FloorTop = b2.baseY + b2.footH + b2.floorT;
        // Measure at ~40% of B2's wall height
        const midIdx = Math.floor(b2.outer.length * 0.4);
        const b2OuterR = b2.outer[midIdx][0] + b2Wt;
        const measH = b2.outer[midIdx][1] + b2FloorTop; // absolute height

        // Interpolate B1 inner wall radius at measH
        const b1WallH = measH - b1FloorTop; // height relative to B1's wall base
        let b1InnerR = b1.outer[0][0]; // default to base
        for (let j = 1; j < b1.outer.length; j++) {
          if (b1.outer[j][1] >= b1WallH) {
            const t = (b1WallH - b1.outer[j - 1][1]) / (b1.outer[j][1] - b1.outer[j - 1][1]);
            b1InnerR = b1.outer[j - 1][0] + t * (b1.outer[j][0] - b1.outer[j - 1][0]);
            break;
          }
        }
        const gapMm = b1InnerR - b2OuterR;
        if (gapMm <= 0 || measH <= b1FloorTop) return null;
        return (<g opacity={0.8}>
          <line x1={tx(b2OuterR)} y1={ty(measH)} x2={tx(b1InnerR)} y2={ty(measH)}
            stroke={P.blue} strokeWidth={1.2} />
          <line x1={tx(b2OuterR)} y1={ty(measH) - 3} x2={tx(b2OuterR)} y2={ty(measH) + 3}
            stroke={P.blue} strokeWidth={0.7} />
          <line x1={tx(b1InnerR)} y1={ty(measH) - 3} x2={tx(b1InnerR)} y2={ty(measH) + 3}
            stroke={P.blue} strokeWidth={0.7} />
          <text x={(tx(b2OuterR) + tx(b1InnerR)) / 2} y={ty(measH) - 4} textAnchor="middle"
            fontSize="5" fill={P.blue} fontFamily={mono} fontWeight="600">{fmt(gapMm)} gap</text>
        </g>);
      })()}

      {/* Annotations */}
      {showAnnotations && (<g>
        {(() => { const x = tx(maxOutR + 4); return (<g>
          <line x1={x} y1={ty(rimTopH)} x2={x} y2={ty(0)} stroke={`${P.accent}44`} strokeWidth={0.7} />
          <line x1={x - 3} y1={ty(rimTopH)} x2={x + 3} y2={ty(rimTopH)} stroke={`${P.accent}44`} strokeWidth={0.7} />
          <line x1={x - 3} y1={ty(0)} x2={x + 3} y2={ty(0)} stroke={`${P.accent}44`} strokeWidth={0.7} />
          <text x={x + 6} y={(ty(rimTopH) + ty(0)) / 2 + 3} fontSize="6.5" fill={P.rim} fontFamily={mono}>{fmtI(rimTopH)} total</text>
        </g>); })()}
        {(() => { const x = tx(maxOutR + 22); return (<g>
          <line x1={x} y1={ty(rimTopH)} x2={x} y2={ty(wallTopH)} stroke={`${P.accent}44`} strokeWidth={0.7} />
          <line x1={x - 3} y1={ty(rimTopH)} x2={x + 3} y2={ty(rimTopH)} stroke={`${P.accent}44`} strokeWidth={0.7} />
          <line x1={x - 3} y1={ty(wallTopH)} x2={x + 3} y2={ty(wallTopH)} stroke={`${P.accent}44`} strokeWidth={0.7} />
          <text x={x + 6} y={(ty(rimTopH) + ty(wallTopH)) / 2 + 3} fontSize="5.5" fill={P.rim} fontFamily={mono}>{fmt(lipH)} rim</text>
          <line x1={x} y1={ty(wallTopH)} x2={x} y2={ty(floorTop)} stroke={`${P.inner}44`} strokeWidth={0.7} />
          <line x1={x - 3} y1={ty(wallTopH)} x2={x + 3} y2={ty(wallTopH)} stroke={`${P.inner}44`} strokeWidth={0.7} />
          <line x1={x - 3} y1={ty(floorTop)} x2={x + 3} y2={ty(floorTop)} stroke={`${P.inner}44`} strokeWidth={0.7} />
          <text x={x + 6} y={(ty(wallTopH) + ty(floorTop)) / 2 + 3} fontSize="5.5" fill={P.inner} fontFamily={mono}>{fmtI(wallTopH - floorTop)} depth</text>
          <line x1={x} y1={ty(floorTop)} x2={x} y2={ty(footHt)} stroke={`${P.textFaint}66`} strokeWidth={0.7} />
          <text x={x + 6} y={(ty(floorTop) + ty(footHt)) / 2 + 3} fontSize="5.5" fill={P.textFaint} fontFamily={mono}>{fmt(floorT)} floor</text>
          <line x1={x} y1={ty(footHt)} x2={x} y2={ty(0)} stroke={`${P.purple}44`} strokeWidth={0.7} />
          <text x={x + 6} y={(ty(footHt) + ty(0)) / 2 + 3} fontSize="5.5" fill={P.purple} fontFamily={mono}>{fmt(footHt)} foot</text>
        </g>); })()}
        <line x1={txL(maxOutR)} y1={ty(rimTopH + 2)} x2={tx(maxOutR)} y2={ty(rimTopH + 2)} stroke={`${P.blue}44`} strokeWidth={0.7} />
        <text x={cxv} y={ty(rimTopH + 2) - 5} textAnchor="middle" fontSize="7" fill={P.blue} fontFamily={mono}>{fmtI(rimDia)} ø rim</text>
        <line x1={txL(footOR)} y1={ty(-2)} x2={tx(footOR)} y2={ty(-2)} stroke={`${P.purple}44`} strokeWidth={0.7} />
        <text x={cxv} y={ty(-2) + 10} textAnchor="middle" fontSize="6.5" fill={P.purple} fontFamily={mono}>{fmtI(footOR * 2)} ø foot</text>
        {/* Foot ring dimensions — left side only */}
        {(() => {
          const fL = txL(footOR), fR = txL(footIR);
          const fTop = ty(footHt), fBot = ty(0);
          const midY = (fTop + fBot) / 2;
          const ringW = footOR - footIR;
          return (<g>
            {/* Width bracket under foot ring */}
            <line x1={fL} y1={fBot + 4} x2={fR} y2={fBot + 4} stroke={P.purple} strokeWidth={0.6} />
            <line x1={fL} y1={fBot + 2} x2={fL} y2={fBot + 6} stroke={P.purple} strokeWidth={0.6} />
            <line x1={fR} y1={fBot + 2} x2={fR} y2={fBot + 6} stroke={P.purple} strokeWidth={0.6} />
            <text x={(fL + fR) / 2} y={fBot + 12} textAnchor="middle" fontSize="4.5" fill={P.purple} fontFamily={mono}>{fmt(ringW)}</text>
            {/* Height bracket left of foot ring */}
            <line x1={fL - 4} y1={fTop} x2={fL - 4} y2={fBot} stroke={P.purple} strokeWidth={0.6} />
            <line x1={fL - 6} y1={fTop} x2={fL - 2} y2={fTop} stroke={P.purple} strokeWidth={0.6} />
            <line x1={fL - 6} y1={fBot} x2={fL - 2} y2={fBot} stroke={P.purple} strokeWidth={0.6} />
            <text x={fL - 7} y={midY + 2} textAnchor="end" fontSize="4.5" fill={P.purple} fontFamily={mono}>{fmt(footHt)}</text>
          </g>);
        })()}
        {(() => { const mi = Math.floor(innerWall.length / 2), ir = innerWall[mi], or = outerWallCurve[mi]; return (<g>
          <line x1={tx(ir[0])} y1={ty(ir[1])} x2={tx(or[0])} y2={ty(or[1])} stroke={P.accent} strokeWidth={1.5} />
          <text x={tx(or[0]) + 5} y={ty(or[1]) + 3} fontSize="6" fill={P.accent} fontFamily={mono}>{fmt(wt)} wall</text>
        </g>); })()}
        <text x={cxv} y={ty(floorTop - floorT / 2) + 3} textAnchor="middle" fontSize="6.5" fill={P.textFaint} fontFamily={mono}>FLOOR</text>
      </g>)}

    </svg>
    {/* Legend — HTML below SVG, never overlaps */}
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", padding: "8px 4px 0", justifyContent: "center" }}>
      {[{ c: "#b8a08a", l: "Clay body" }, { c: P.accent, l: "Wall thickness" }, { c: P.accent, l: "Rim: " + (RIM_TYPES[rimType]?.name || "") }, { c: P.purple, l: "Foot ring" }, { c: P.blue, l: "Rim ø" }].map(({ c, l }, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 10, height: 6, borderRadius: 2, background: c, opacity: 0.7 }} />
          <span style={{ fontFamily: mono, fontSize: 9, color: P.textMuted }}>{l}</span>
        </div>
      ))}
    </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════
// RIB TOOL VIZ — actual wall profile rib
// Right edge = outer wall curve (real radii), Left edge = inner wall curve
// Rib IS the bowl wall cross-section — fits like a puzzle piece
// ═══════════════════════════════════════════════════════════
function RibToolView({ bowls, p, edgeAngle, ribThick, profileName, imperial }) {
  const edgeExt = ribThick / (2 * Math.tan((edgeAngle / 2) * Math.PI / 180));
  const sc = 2.0;
  const mm2in = v => (v / 25.4).toFixed(2) + '"';
  const fmt = v => imperial ? mm2in(v) : v.toFixed(1) + 'mm';
  const fmtI = v => imperial ? mm2in(v) : v.toFixed(0) + 'mm';

  // Two ribs per bowl: INNER (shapes inside) + OUTER (shapes outside)
  const tools = [];
  bowls.forEach((b, i) => {
    const wt = p.wallThickness * b.s;
    const stepH = b.footH + b.floorT;
    const innerWall = b.outer.map(([r, h]) => [r, h]);
    const outerWall = b.outer.map(([r, h]) => [r + wt, h]);
    const wallH = Math.max(...innerWall.map(q => q[1]));
    const innerBaseR = innerWall[0][0];
    const outerBaseR = outerWall[0][0];
    const maxSweep = Math.max(
      ...innerWall.map(q => q[0] - innerBaseR),
      ...outerWall.map(q => q[0] - outerBaseR),
    ) || 1;
    const sweepScale = (ribThick * 0.75) / maxSweep;
    const maxH = wallH + stepH;

    // ── INNER RIB: right edge = inner wall curve, left edge = straight ──
    {
      const workEdge = innerWall.map(([r, h]) => [ribThick + (r - innerBaseR) * sweepScale, h + stepH]);
      const backEdge = [[0, 0], [0, maxH]]; // straight left side, full height
      const workTaper = workEdge.map(([x, h]) => [x + edgeExt, h]);
      const backTaper = backEdge.map(([x, h]) => [x - edgeExt, h]);
      const allXs = [...workTaper.map(q => q[0]), ...backTaper.map(q => q[0])];
      const minX = Math.min(...allXs), maxX = Math.max(...allXs);
      tools.push({
        label: `B${i + 1} INNER`, sublabel: fmtI(b.rim),
        color: P.inner, bowlColor: C[i % 6],
        workEdge, backEdge, workTaper, backTaper,
        maxH, w: maxX - minX + 8, minX, rimDia: b.rim,
        wallH, wt, stepH, side: "inner",
      });
    }

    // ── OUTER RIB: right edge = outer wall curve + step, left edge = straight ──
    {
      const workStraight = [[ribThick, 0], [ribThick, stepH]];
      const workCurve = outerWall.map(([r, h]) => [ribThick + (r - outerBaseR) * sweepScale, h + stepH]);
      const workEdge = [...workStraight, ...workCurve];
      const backEdge = [[0, 0], [0, maxH]]; // straight left side, full height
      const workTaper = workEdge.map(([x, h]) => [x + edgeExt, h]);
      const backTaper = backEdge.map(([x, h]) => [x - edgeExt, h]);
      const allXs = [...workTaper.map(q => q[0]), ...backTaper.map(q => q[0])];
      const minX = Math.min(...allXs), maxX = Math.max(...allXs);
      tools.push({
        label: `B${i + 1} OUTER`, sublabel: fmtI(b.rim),
        color: P.textMuted, bowlColor: C[i % 6],
        workEdge, backEdge, workTaper, backTaper,
        maxH, w: maxX - minX + 8, minX, rimDia: b.rim,
        wallH, wt, stepH, side: "outer",
      });
    }
  });

  // Layout — add right margin for measurements
  const measW = 52;
  const gap = 20 + measW;
  let totalW = 25;
  tools.forEach(t => { totalW += t.w * sc + gap; });
  const globalMaxH = Math.max(...tools.map(t => t.maxH));
  const svgH = globalMaxH * sc + 65;

  // [x, h] → SVG "x,y" (h=0 at bottom, flipped)
  const toSVG = (pts, xOff, minX, mH) =>
    pts.map(([x, h]) => `${((x - minX + 6) * sc + xOff).toFixed(1)},${((mH - h) * sc + 26).toFixed(1)}`);

  // Grid
  const gridStep = 10 * sc;
  const gridLabel = imperial ? '≈ ⅜"' : '10mm';

  return (
    <svg viewBox={`0 0 ${Math.max(totalW, 200)} ${svgH}`} style={{ width: "100%", background: P.svgBg, borderRadius: 8 }}>
      {/* GRID */}
      <defs>
        <pattern id="ribgrid" width={gridStep} height={gridStep} patternUnits="userSpaceOnUse">
          <path d={`M ${gridStep} 0 L 0 0 0 ${gridStep}`} fill="none" stroke={P.grid} strokeWidth={0.3} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={Math.max(totalW, 200)} height={svgH} fill="url(#ribgrid)" />

      {/* Grid legend — bottom right */}
      <g transform={`translate(${Math.max(totalW, 200) - 28},${svgH - 26})`}>
        <rect x={0} y={0} width={gridStep} height={gridStep} fill={P.grid + "44"} stroke={P.textFaint} strokeWidth={0.5} />
        <text x={gridStep / 2} y={gridStep + 8} textAnchor="middle" fontSize="4" fill={P.textFaint} fontFamily={mono}>{gridLabel}</text>
      </g>

      {(() => {
        let xOff = 20;
        return tools.map((t, ti) => {
          const x0 = xOff;
          xOff += t.w * sc + gap;
          const sv = (pts) => toSVG(pts, x0, t.minX, globalMaxH);

          const wTaper = sv(t.workTaper);  // right side (curved working edge)
          const bTaper = sv(t.backTaper);  // left side (straight back)

          // Outline: back bottom → work bottom → work up to rim → back rim down → close
          // For inner rib: work edge starts at stepH, so add step on right
          // For outer rib: work edge includes step already (starts at h=0)
          let outlinePts;
          if (t.side === "inner") {
            // Right side has step: base → step up → curve
            const stepRightSvg = sv([[ribThick + edgeExt, 0]])[0]; // right at table level
            outlinePts = [
              ...bTaper,                    // left: bottom → top
              ...wTaper.slice().reverse(),  // right: rim → floor (stepH)
              stepRightSvg,                 // step down to table
            ].join(" ");
          } else {
            // Outer: work edge goes all the way to h=0
            outlinePts = [
              ...bTaper,                    // left: bottom → top
              ...wTaper.slice().reverse(),  // right: rim → step → table
            ].join(" ");
          }

          // Reference points
          const botL = bTaper[0].split(",").map(Number);
          const botR = wTaper[0].split(",").map(Number);
          const topL = bTaper[bTaper.length - 1].split(",").map(Number);
          const topR = wTaper[wTaper.length - 1].split(",").map(Number);
          const baseY = Math.max(botL[1], botR[1]);
          const cX = (topL[0] + topR[0]) / 2;

          // Thumb hole
          const wEdge = sv(t.workEdge);
          const upperIdx = Math.floor(wEdge.length * 0.6);
          const wM = wEdge[Math.min(upperIdx, wEdge.length - 1)].split(",").map(Number);
          const hCx = (topL[0] + wM[0]) / 2;
          const hCy = wM[1];
          const hR = Math.min(Math.abs(wM[0] - topL[0]) * 0.15, 6);

          // Height references
          const hToY = h => (globalMaxH - h) * sc + 26;
          const rimY = hToY(t.maxH);
          const floorY = hToY(t.stepH);
          const tableY = hToY(0);
          const mx = Math.max(botR[0], topR[0]) + 8;

          return (
            <g key={ti}>
              {/* Title */}
              <text x={cX} y={10} textAnchor="middle" fontSize="6.5" fill={t.color} fontFamily={mono} fontWeight="700">{t.label}</text>
              <text x={cX} y={19} textAnchor="middle" fontSize="5" fill={t.bowlColor} fontFamily={mono}>{t.sublabel}</text>

              {/* Rib outline */}
              <polygon points={outlinePts} fill={t.color + "08"} stroke={t.color} strokeWidth={1.2} strokeLinejoin="round" />

              {/* Highlight flat base */}
              {(() => {
                const baseRightX = t.side === "inner"
                  ? sv([[ribThick + edgeExt, 0]])[0].split(",").map(Number)[0]
                  : botR[0];
                return (<>
                  <line x1={botL[0]} y1={baseY} x2={baseRightX} y2={baseY}
                    stroke={P.rim} strokeWidth={2.5} strokeLinecap="round" />
                  <text x={(botL[0] + baseRightX) / 2} y={baseY + 11} textAnchor="middle" fontSize="4" fill={P.rim} fontFamily={mono} fontWeight="600">
                    FLAT · wheel true
                  </text>
                </>);
              })()}

              {/* Step annotation for outer rib */}
              {t.side === "outer" && (() => {
                const workAtFloor = wTaper[2] ? wTaper[2].split(",").map(Number) : botR;
                return (<g>
                  <line x1={botR[0]} y1={workAtFloor[1]} x2={botR[0]} y2={baseY}
                    stroke={P.textMuted} strokeWidth={0.7} strokeDasharray="2,2" />
                  <text x={botR[0] + 3} y={(workAtFloor[1] + baseY) / 2 + 2} textAnchor="start"
                    fontSize="3.5" fill={P.textFaint} fontFamily={mono}>step</text>
                </g>);
              })()}

              {/* Step annotation for inner rib */}
              {t.side === "inner" && (() => {
                const workBase = wTaper[0].split(",").map(Number);
                const stepRPt = sv([[ribThick + edgeExt, 0]])[0].split(",").map(Number);
                return (<g>
                  <line x1={stepRPt[0]} y1={workBase[1]} x2={stepRPt[0]} y2={baseY}
                    stroke={P.textMuted} strokeWidth={0.7} strokeDasharray="2,2" />
                  <text x={stepRPt[0] + 3} y={(workBase[1] + baseY) / 2 + 2} textAnchor="start"
                    fontSize="3.5" fill={P.textFaint} fontFamily={mono}>step</text>
                </g>);
              })()}

              {/* Thumb hole */}
              {hR > 2 && <circle cx={hCx} cy={hCy} r={hR} fill={P.svgBg} stroke={t.color + "44"} strokeWidth={0.7} />}

              {/* Edge labels */}
              <text x={topL[0] - 2} y={topL[1] - 3} textAnchor="end" fontSize="4" fill={P.textFaint} fontFamily={mono}>back</text>
              <text x={topR[0] + 2} y={topR[1] - 3} textAnchor="start" fontSize="4.5" fill={t.color} fontFamily={mono} fontWeight="600">
                {t.side === "inner" ? "INNER" : "OUTER"}
              </text>
              <text x={cX} y={Math.min(topL[1], topR[1]) - 7} textAnchor="middle" fontSize="4" fill={P.textFaint} fontFamily={mono}>▲ rim</text>

              {/* Wall height */}
              <line x1={mx} y1={rimY} x2={mx} y2={floorY} stroke={t.color + "44"} strokeWidth={0.5} />
              <line x1={mx - 2} y1={rimY} x2={mx + 2} y2={rimY} stroke={t.color + "44"} strokeWidth={0.5} />
              <line x1={mx - 2} y1={floorY} x2={mx + 2} y2={floorY} stroke={t.color + "44"} strokeWidth={0.5} />
              <text x={mx + 4} y={(rimY + floorY) / 2 + 2} fontSize="3.8" fill={t.color} fontFamily={mono}>{fmtI(t.wallH)} wall</text>

              {/* Step height */}
              <line x1={mx} y1={floorY} x2={mx} y2={tableY} stroke={`${P.purple}44`} strokeWidth={0.5} />
              <line x1={mx - 2} y1={tableY} x2={mx + 2} y2={tableY} stroke={`${P.purple}44`} strokeWidth={0.5} />
              <text x={mx + 4} y={(floorY + tableY) / 2 + 2} fontSize="3.5" fill={P.purple} fontFamily={mono}>{fmt(t.stepH)} step</text>
            </g>
          );
        });
      })()}
    </svg>
  );
}

function exportSVG(bowls, p, edgeAngle, ribThick) {
  const svg = generateRibSVG(bowls, p, edgeAngle, ribThick);
  const blob = new Blob([svg], { type: "image/svg+xml" }); const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `ribs-inner-outer-${edgeAngle}deg.svg`; a.click(); URL.revokeObjectURL(url);
}

function exportTemplate(bowls, p, edgeAngle, ribThick) {
  const svg = generateTemplateSVG(bowls, p, edgeAngle, ribThick);
  const blob = new Blob([svg], { type: "image/svg+xml" }); const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `throwform-template-handcut.svg`; a.click(); URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════
// PROFILE IMPORT/EXPORT — JSON save/load custom profiles
// ═══════════════════════════════════════════════════════════
function exportProfile(p, name) {
  const json = generateProfileJSON(p, name);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `throwform-${(name || "profile").replace(/\s+/g, "-").toLowerCase()}.json`; a.click(); URL.revokeObjectURL(url);
}

function importProfile(file, onLoad) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.outer || !data.rimDiameter) throw new Error("Invalid profile");
      onLoad(data);
    } catch (err) {
      alert("Invalid ThrowForm profile: " + err.message);
    }
  };
  reader.readAsText(file);
}

// ═══════════════════════════════════════════════════════════
// SHRINKAGE CALCULATOR — fired vs thrown dimensions
// ═══════════════════════════════════════════════════════════
function ShrinkageCard({ p, shrinkage, imperial, vol }) {
  // Thrown size = fired size / (1 - shrinkage%)
  const factor = 1 / (1 - shrinkage / 100);
  const mm = v => imperial ? (v / 25.4).toFixed(2) + '"' : v.toFixed(1) + 'mm';
  const mmI = v => imperial ? (v / 25.4).toFixed(2) + '"' : v.toFixed(0) + 'mm';
  const throwRim = p.rimDiameter * factor;
  const throwH = (p.interiorDepth + p.floor.thickness + p.foot.height) * factor;
  const throwWall = p.wallThickness * factor;
  // Clay weight for thrown size (scaled volume)
  const throwClayG = vol.clayWetG * (factor ** 3);

  const items = [
    { l: "Rim ø", fired: mmI(p.rimDiameter), thrown: mmI(throwRim) },
    { l: "Height", fired: mmI(p.interiorDepth + p.floor.thickness + p.foot.height), thrown: mmI(throwH) },
    { l: "Wall", fired: mm(p.wallThickness), thrown: mm(throwWall) },
    { l: "Clay", fired: imperial ? vol.clayLbs.toFixed(2) + ' lb' : vol.clayWetG.toFixed(0) + ' g', thrown: imperial ? (throwClayG / 453.592).toFixed(2) + ' lb' : throwClayG.toFixed(0) + ' g' },
  ];

  return (
    <div style={{ fontFamily: mono, fontSize: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, marginBottom: 6 }}>
        <div style={{ fontSize: 8, color: P.textFaint, textTransform: "uppercase", letterSpacing: "0.05em" }} />
        <div style={{ fontSize: 8, color: P.textFaint, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right" }}>Fired</div>
        <div style={{ fontSize: 8, color: P.accent, textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "right", fontWeight: 600 }}>Throw at</div>
      </div>
      {items.map((it, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, padding: "3px 0", borderTop: `1px solid ${P.cardBorder}22` }}>
          <div style={{ color: P.textMuted }}>{it.l}</div>
          <div style={{ textAlign: "right", color: P.textFaint }}>{it.fired}</div>
          <div style={{ textAlign: "right", color: P.accent, fontWeight: 600 }}>{it.thrown}</div>
        </div>
      ))}
      <div style={{ marginTop: 6, fontSize: 8, color: P.textFaint, lineHeight: 1.5 }}>
        Porcelain 12-15% · Stoneware 10-13% · Earthenware 5-8% · Raku 6-10%
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// 3D WIREFRAME BOWL — interactive drag-to-rotate
// ═══════════════════════════════════════════════════════════
function Bowl3D({ p, footH, floorT, wallT }) {
  const [rot, setRot] = useState({ yaw: 30, pitch: -25 });
  const [dragging, setDragging] = useState(null);
  const w = 280, h = 220;
  const outer = p.outer;
  const maxH = outer[outer.length - 1][1] + footH + floorT;
  const maxR = Math.max(...outer.map(q => q[0])) + wallT;
  const sc = Math.min((w - 40) / (maxR * 2), (h - 40) / maxH) * 0.8;
  const cx = w / 2, cy = h - 25;

  const cosY = Math.cos(rot.yaw * Math.PI / 180), sinY = Math.sin(rot.yaw * Math.PI / 180);
  const cosP = Math.cos(rot.pitch * Math.PI / 180), sinP = Math.sin(rot.pitch * Math.PI / 180);
  
  const project = (r, height, angle) => {
    const rad = angle * Math.PI / 180;
    // 3D point on circle
    const x3 = r * Math.cos(rad), z3 = r * Math.sin(rad), y3 = height;
    // Rotate around Y axis (yaw)
    const rx = x3 * cosY - z3 * sinY, rz = x3 * sinY + z3 * cosY;
    // Rotate around X axis (pitch)
    const ry = y3 * cosP - rz * sinP, rz2 = y3 * sinP + rz * cosP;
    return [cx + rx * sc, cy - ry * sc, rz2]; // z for depth sorting
  };

  const onDown = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setDragging({ x: clientX, y: clientY, yaw: rot.yaw, pitch: rot.pitch });
  };
  const onMove = (e) => {
    if (!dragging) return;
    e.preventDefault();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setRot({
      yaw: dragging.yaw + (clientX - dragging.x) * 0.5,
      pitch: Math.max(-80, Math.min(-5, dragging.pitch + (clientY - dragging.y) * 0.3)),
    });
  };
  const onUp = () => setDragging(null);

  const slices = 20;
  const elements = [];

  // Generate meridian lines
  for (let i = 0; i < slices; i++) {
    const angle = (i / slices) * 360;
    const outerPts = outer.map(([r, ht]) => project(r + wallT, ht + footH + floorT, angle));
    const innerPts = outer.map(([r, ht]) => project(r, ht + footH + floorT, angle));
    const avgZ = outerPts.reduce((s, pt) => s + pt[2], 0) / outerPts.length;
    const isFront = avgZ < 0;
    elements.push({
      z: avgZ,
      el: <g key={`m${i}`} opacity={isFront ? 0.4 : 0.12}>
        <path d={outerPts.map((pt, j) => `${j === 0 ? "M" : "L"}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" ")} fill="none" stroke={P.outer} strokeWidth={isFront ? 0.7 : 0.4} />
        {isFront && <path d={innerPts.map((pt, j) => `${j === 0 ? "M" : "L"}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" ")} fill="none" stroke={P.inner} strokeWidth={0.5} />}
      </g>
    });
  }

  // Generate latitude rings
  const ringHeights = [footH + floorT];
  const wallStep = Math.max(1, Math.floor(outer.length / 3));
  for (let i = wallStep; i < outer.length - 1; i += wallStep) ringHeights.push(outer[i][1] + footH + floorT);
  ringHeights.push(outer[outer.length - 1][1] + footH + floorT);

  ringHeights.forEach((ht, ri) => {
    let r = outer[outer.length - 1][0];
    const wallH = ht - footH - floorT;
    for (let j = 1; j < outer.length; j++) {
      if (outer[j][1] >= wallH) {
        const t = (wallH - outer[j - 1][1]) / Math.max(0.01, outer[j][1] - outer[j - 1][1]);
        r = outer[j - 1][0] + t * (outer[j][0] - outer[j - 1][0]);
        break;
      }
    }
    const pts = [];
    for (let a = 0; a <= 360; a += 5) pts.push(project(r, ht, a));
    const isRim = ri === ringHeights.length - 1;
    // Split front/back
    const frontPts = pts.filter(pt => pt[2] <= 0);
    const backPts = pts.filter(pt => pt[2] > 0);
    if (backPts.length > 1) elements.push({ z: 100, el: <path key={`br${ri}`} d={backPts.map((pt, j) => `${j === 0 ? "M" : "L"}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" ")} fill="none" stroke={P.grid} strokeWidth={0.3} opacity={0.2} /> });
    if (frontPts.length > 1) elements.push({ z: -100, el: <path key={`fr${ri}`} d={frontPts.map((pt, j) => `${j === 0 ? "M" : "L"}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" ")} fill="none" stroke={isRim ? "#b8a08a" : P.grid} strokeWidth={isRim ? 1.5 : 0.5} opacity={isRim ? 0.8 : 0.4} /> });
    // Full rim ring
    if (isRim) elements.push({ z: -200, el: <path key="rim" d={pts.map((pt, j) => `${j === 0 ? "M" : "L"}${pt[0].toFixed(1)} ${pt[1].toFixed(1)}`).join(" ") + "Z"} fill="#b8a08a" fillOpacity={0.08} stroke="#b8a08a" strokeWidth={1.2} /> });
  });

  // Sort by z (back first)
  elements.sort((a, b) => b.z - a.z);

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", background: P.svgBg, borderRadius: 8, cursor: dragging ? "grabbing" : "grab", userSelect: "none", touchAction: "none" }}
      onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
      onTouchStart={onDown} onTouchMove={onMove} onTouchEnd={onUp}>
      {elements.map(e => e.el)}
      <text x={w - 8} y={h - 6} textAnchor="end" fontSize="7" fill={P.textFaint} fontFamily={mono} opacity={0.5}>drag to rotate</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// CATMULL-ROM SPLINE — smooth curves through control points
// ═══════════════════════════════════════════════════════════
function catmullRomPath(points, mapX, mapY, tension = 0.5) {
  if (points.length < 2) return "";
  if (points.length === 2) return `M${mapX(points[0][0]).toFixed(1)} ${mapY(points[0][1]).toFixed(1)} L${mapX(points[1][0]).toFixed(1)} ${mapY(points[1][1]).toFixed(1)}`;
  
  // Duplicate first/last for endpoint tangents
  const pts = [points[0], ...points, points[points.length - 1]];
  let d = `M${mapX(points[0][0]).toFixed(1)} ${mapY(points[0][1]).toFixed(1)}`;
  
  for (let i = 1; i < pts.length - 2; i++) {
    const p0 = pts[i - 1], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2];
    const cp1x = mapX(p1[0]) + (mapX(p2[0]) - mapX(p0[0])) / (6 * tension);
    const cp1y = mapY(p1[1]) + (mapY(p2[1]) - mapY(p0[1])) / (6 * tension);
    const cp2x = mapX(p2[0]) - (mapX(p3[0]) - mapX(p1[0])) / (6 * tension);
    const cp2y = mapY(p2[1]) - (mapY(p3[1]) - mapY(p1[1])) / (6 * tension);
    d += ` C${cp1x.toFixed(1)} ${cp1y.toFixed(1)},${cp2x.toFixed(1)} ${cp2y.toFixed(1)},${mapX(p2[0]).toFixed(1)} ${mapY(p2[1]).toFixed(1)}`;
  }
  return d;
}

// ═══════════════════════════════════════════════════════════
// CROSS-SECTION SVG EXPORT
// ═══════════════════════════════════════════════════════════
function exportCrossSection(svgElement, profileName) {
  if (!svgElement) return;
  const clone = svgElement.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  // Add white background
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%"); bg.setAttribute("height", "100%"); bg.setAttribute("fill", "#f0ebe2");
  clone.insertBefore(bg, clone.firstChild);
  const svg = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = `throwform-cross-section-${profileName.replace(/\s+/g, "-").toLowerCase()}.svg`; a.click(); URL.revokeObjectURL(url);
}

// ═══════════════════════════════════════════════════════════
// CUSTOM PROFILE EDITOR — drag control points
// ═══════════════════════════════════════════════════════════
function CustomProfileEditor({ outer, onChange, rimDia, interiorDepth }) {
  const [drag, setDrag] = useState(null);
  const [smooth, setSmooth] = useState(true);
  const [history, setHistory] = useState([]);
  const svgW = 260, svgH = 200, pad = 30;

  const pushHistory = () => setHistory(prev => [...prev.slice(-20), outer.map(p => [...p])]);
  const undo = () => {
    if (history.length === 0) return;
    onChange(history[history.length - 1]);
    setHistory(prev => prev.slice(0, -1));
  };

  // Preset curve generators
  const presets = {
    hemisphere: () => {
      const r = rimDia / 2, d = interiorDepth, n = 8;
      return Array.from({ length: n + 1 }, (_, i) => {
        const t = i / n, angle = t * Math.PI / 2;
        return [Math.round((r * 0.4 + r * 0.6 * Math.sin(angle)) * 10) / 10, Math.round(d * t * 10) / 10];
      });
    },
    parabola: () => {
      const r = rimDia / 2, d = interiorDepth, n = 8;
      return Array.from({ length: n + 1 }, (_, i) => {
        const t = i / n;
        return [Math.round((r * 0.4 + r * 0.6 * Math.sqrt(t)) * 10) / 10, Math.round(d * t * 10) / 10];
      });
    },
    cylinder: () => {
      const r = rimDia / 2, d = interiorDepth, n = 6;
      return Array.from({ length: n + 1 }, (_, i) => {
        const t = i / n;
        return [Math.round((r * 0.85 + r * 0.15 * t) * 10) / 10, Math.round(d * t * 10) / 10];
      });
    },
    vbowl: () => {
      const r = rimDia / 2, d = interiorDepth, n = 6;
      return Array.from({ length: n + 1 }, (_, i) => {
        const t = i / n;
        return [Math.round((r * 0.3 + r * 0.7 * t) * 10) / 10, Math.round(d * t * 10) / 10];
      });
    },
    tulip: () => {
      const r = rimDia / 2, d = interiorDepth, n = 8;
      return Array.from({ length: n + 1 }, (_, i) => {
        const t = i / n;
        const bulge = Math.sin(t * Math.PI) * 0.15;
        return [Math.round((r * 0.35 + r * (0.55 * t + bulge)) * 10) / 10, Math.round(d * t * 10) / 10];
      });
    },
  };
  const applyPreset = (key) => { pushHistory(); onChange(presets[key]()); };
  const maxR = rimDia / 2 + 10;
  const maxH = interiorDepth + 10;
  const sx = r => pad + (r / maxR) * (svgW - pad * 2);
  const sy = h => svgH - pad - (h / maxH) * (svgH - pad * 2);
  const invX = px => Math.max(5, Math.min(maxR - 5, ((px - pad) / (svgW - pad * 2)) * maxR));
  const invY = py => Math.max(0, Math.min(maxH, ((svgH - pad - py) / (svgH - pad * 2)) * maxH));

  const getPos = (e, svg) => {
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const px = (clientX - rect.left) / rect.width * svgW;
    const py = (clientY - rect.top) / rect.height * svgH;
    return [px, py];
  };

  const handleMove = (e) => {
    if (drag === null) return;
    e.preventDefault();
    const [px, py] = getPos(e, e.currentTarget);
    const newOuter = outer.map((pt, i) => {
      if (i !== drag) return pt;
      let r = invX(px), h = invY(py);
      if (i > 0) h = Math.max(h, outer[i - 1][1] + 1);
      if (i < outer.length - 1) h = Math.min(h, outer[i + 1][1] - 1);
      if (i === 0) h = 0;
      return [Math.round(r * 10) / 10, Math.round(h * 10) / 10];
    });
    onChange(newOuter);
  };

  const handleDown = (e, i) => { e.preventDefault(); setDrag(i); };
  const handleUp = () => setDrag(null);

  const addPoint = () => {
    if (outer.length >= 15) return;
    pushHistory();
    const last = outer[outer.length - 1];
    const prev = outer[outer.length - 2];
    const midR = (prev[0] + last[0]) / 2;
    const midH = (prev[1] + last[1]) / 2;
    const newOuter = [...outer.slice(0, -1), [midR, midH], last];
    onChange(newOuter);
  };

  const removePoint = () => {
    if (outer.length <= 4) return;
    pushHistory();
    onChange([...outer.slice(0, -2), outer[outer.length - 1]]);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 3, marginBottom: 4, flexWrap: "wrap" }}>
        {Object.entries({ hemisphere: "◠", parabola: "⌒", cylinder: "▯", vbowl: "V", tulip: "🌷" }).map(([k, icon]) => (
          <button key={k} onClick={() => applyPreset(k)} title={k} style={{ fontFamily: mono, fontSize: 9, padding: "2px 5px", background: "transparent", border: `1px solid ${P.cardBorder}`, borderRadius: 3, cursor: "pointer", color: P.textMuted }}>{icon}</button>
        ))}
        <div style={{ width: 1, height: 16, background: P.cardBorder, alignSelf: "center" }} />
        <button onClick={addPoint} style={{ fontFamily: mono, fontSize: 9, padding: "2px 6px", background: P.inner + "18", border: `1px solid ${P.inner}33`, borderRadius: 3, cursor: "pointer", color: P.inner }}>+</button>
        <button onClick={removePoint} style={{ fontFamily: mono, fontSize: 9, padding: "2px 6px", background: P.accent + "18", border: `1px solid ${P.accent}33`, borderRadius: 3, cursor: "pointer", color: P.accent }}>−</button>
        <button onClick={undo} disabled={history.length === 0} style={{ fontFamily: mono, fontSize: 9, padding: "2px 6px", background: "transparent", border: `1px solid ${P.cardBorder}`, borderRadius: 3, cursor: history.length ? "pointer" : "default", color: history.length ? P.textMuted : P.textFaint, opacity: history.length ? 1 : 0.4 }}>↩</button>
        <button onClick={() => setSmooth(!smooth)} style={{ fontFamily: mono, fontSize: 8, padding: "2px 5px", background: smooth ? P.blue + "18" : "transparent", border: `1px solid ${smooth ? P.blue + "33" : P.cardBorder}`, borderRadius: 3, cursor: "pointer", color: smooth ? P.blue : P.textFaint }}>{smooth ? "◠" : "⊿"}</button>
        <span style={{ fontFamily: mono, fontSize: 8, color: P.textFaint, marginLeft: "auto", alignSelf: "center" }}>{outer.length} pts</span>
      </div>
      <svg viewBox={`0 0 ${svgW} ${svgH}`} style={{ width: "100%", background: P.svgBg, borderRadius: 8, cursor: drag !== null ? "grabbing" : "default", userSelect: "none", touchAction: "none" }}
        onMouseMove={handleMove} onMouseUp={handleUp} onMouseLeave={handleUp}
        onTouchMove={handleMove} onTouchEnd={handleUp} onTouchCancel={handleUp}>
        {/* Grid */}
        {Array.from({ length: Math.ceil(maxR / 10) + 1 }, (_, i) => i * 10).map(r => (
          <line key={`vg${r}`} x1={sx(r)} y1={pad - 5} x2={sx(r)} y2={svgH - pad + 5} stroke={P.grid} strokeWidth={0.3} />
        ))}
        {Array.from({ length: Math.ceil(maxH / 10) + 1 }, (_, i) => i * 10).map(h => (
          <line key={`hg${h}`} x1={pad - 5} y1={sy(h)} x2={svgW - pad + 5} y2={sy(h)} stroke={P.grid} strokeWidth={0.3} />
        ))}
        {/* Axis labels */}
        <text x={svgW / 2} y={svgH - 6} textAnchor="middle" fontSize="7" fill={P.textFaint} fontFamily={mono}>radius (mm)</text>
        <text x={8} y={svgH / 2} textAnchor="middle" fontSize="7" fill={P.textFaint} fontFamily={mono} transform={`rotate(-90,8,${svgH / 2})`}>height (mm)</text>
        {/* Curve — smooth or linear */}
        <path d={smooth
          ? catmullRomPath(outer, sx, sy)
          : outer.map(([r, h], i) => `${i === 0 ? "M" : "L"}${sx(r).toFixed(1)} ${sy(h).toFixed(1)}`).join(" ")} fill="none" stroke={P.inner} strokeWidth={2} strokeLinecap="round" />
        {/* Outer wall preview */}
        <path d={smooth
          ? catmullRomPath(outer.map(([r, h]) => [r + 5, h]), sx, sy)
          : outer.map(([r, h], i) => `${i === 0 ? "M" : "L"}${sx(r + 5).toFixed(1)} ${sy(h).toFixed(1)}`).join(" ")} fill="none" stroke={P.outer} strokeWidth={1} strokeDasharray="3,2" />
        {/* Control points */}
        {outer.map(([r, h], i) => (
          <g key={i} onMouseDown={(e) => handleDown(e, i)} onTouchStart={(e) => handleDown(e, i)} style={{ cursor: "grab" }}>
            <circle cx={sx(r)} cy={sy(h)} r={6} fill={drag === i ? P.accent : P.inner} opacity={0.2} />
            <circle cx={sx(r)} cy={sy(h)} r={3.5} fill={drag === i ? P.accent : P.inner} stroke="#fff" strokeWidth={1} />
            <text x={sx(r)} y={sy(h) - 8} textAnchor="middle" fontSize="5" fill={P.textMuted} fontFamily={mono}>{r.toFixed(0)},{h.toFixed(0)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// BREAKEVEN CHART — SVG profit visualization
// ═══════════════════════════════════════════════════════════
function BreakevenChart({ price, cogs, setupCost = 0 }) {
  const w = 400, h = 180, pad = { t: 15, r: 15, b: 28, l: 45 };
  const amazonFee = price * 0.15 + 5.50 + 2.00; // referral + FBA + misc
  const profit = price - cogs - amazonFee;
  const maxUnits = Math.max(50, profit > 0 ? Math.ceil((setupCost + 200) / profit) * 1.5 : 50);
  const maxRev = maxUnits * price;
  const chartW = w - pad.l - pad.r, chartH = h - pad.t - pad.b;
  const sx = u => pad.l + (u / maxUnits) * chartW;
  const sy = v => pad.t + chartH - (v / maxRev) * chartH;
  const breakeven = profit > 0 ? Math.ceil(setupCost / profit) : null;

  const revPts = [[0, 0], [maxUnits, maxUnits * price]];
  const costPts = [[0, setupCost], [maxUnits, setupCost + maxUnits * (cogs + amazonFee)]];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", background: P.svgBg, borderRadius: 8 }}>
      {/* Grid */}
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <g key={t}>
          <line x1={pad.l} y1={sy(t * maxRev)} x2={w - pad.r} y2={sy(t * maxRev)} stroke={P.grid} strokeWidth={0.5} />
          <text x={pad.l - 4} y={sy(t * maxRev) + 3} textAnchor="end" fontSize="7" fill={P.textFaint} fontFamily={mono}>${(t * maxRev).toFixed(0)}</text>
        </g>
      ))}
      {[0, 0.25, 0.5, 0.75, 1].map(t => (
        <text key={`x${t}`} x={sx(t * maxUnits)} y={h - 6} textAnchor="middle" fontSize="7" fill={P.textFaint} fontFamily={mono}>{Math.round(t * maxUnits)}</text>
      ))}
      {/* Revenue line */}
      <line x1={sx(revPts[0][0])} y1={sy(revPts[0][1])} x2={sx(revPts[1][0])} y2={sy(revPts[1][1])} stroke={P.inner} strokeWidth={1.5} />
      <text x={sx(maxUnits * 0.85)} y={sy(maxUnits * price * 0.87)} fontSize="7" fill={P.inner} fontFamily={mono}>Revenue</text>
      {/* Cost line */}
      <line x1={sx(costPts[0][0])} y1={sy(costPts[0][1])} x2={sx(costPts[1][0])} y2={sy(costPts[1][1])} stroke={P.accent} strokeWidth={1.5} />
      <text x={sx(maxUnits * 0.85)} y={sy((setupCost + maxUnits * (cogs + amazonFee)) * 0.95)} fontSize="7" fill={P.accent} fontFamily={mono}>Costs</text>
      {/* Profit fill */}
      {profit > 0 && breakeven != null && breakeven < maxUnits && (
        <polygon points={`${sx(breakeven).toFixed(1)},${sy(breakeven * price).toFixed(1)} ${sx(maxUnits).toFixed(1)},${sy(maxUnits * price).toFixed(1)} ${sx(maxUnits).toFixed(1)},${sy(setupCost + maxUnits * (cogs + amazonFee)).toFixed(1)}`} fill={P.inner} opacity={0.1} />
      )}
      {/* Breakeven marker */}
      {profit > 0 && breakeven != null && breakeven < maxUnits && (
        <g>
          <line x1={sx(breakeven)} y1={pad.t} x2={sx(breakeven)} y2={pad.t + chartH} stroke={P.amber} strokeWidth={1} strokeDasharray="3,2" />
          <circle cx={sx(breakeven)} cy={sy(breakeven * price)} r={3} fill={P.amber} />
          <text x={sx(breakeven)} y={pad.t - 3} textAnchor="middle" fontSize="7" fill={P.amber} fontFamily={mono} fontWeight="600">BE: {breakeven} units</text>
        </g>
      )}
      {profit <= 0 && <text x={w / 2} y={h / 2} textAnchor="middle" fontSize="10" fill={P.accent} fontFamily={mono} fontWeight="600">Negative margin — raise price or cut costs</text>}
      <text x={w / 2} y={h - 1} textAnchor="middle" fontSize="6" fill={P.textFaint} fontFamily={mono}>units sold →</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════
// KILN SHELF LAYOUT — how many bowls fit
// ═══════════════════════════════════════════════════════════
function KilnShelfView({ rimDia, shrinkage }) {
  const [shelfIdx, setShelfIdx] = useState(0);
  const shelf = KILN_SHELVES[shelfIdx];
  const bowlDia = rimDia * (1 / (1 - shrinkage / 100)); // thrown size (before firing)
  const spacing = 12; // mm gap between bowls in kiln

  // Calculate how many bowls fit
  let count = 0;
  const positions = [];
  if (shelf.shape === "round") {
    const R = shelf.d / 2, r = bowlDia / 2 + spacing / 2;
    // Center bowl
    if (r * 2 <= shelf.d) { positions.push([0, 0]); count++; }
    // Rings outward
    for (let ring = 1; ring < 10; ring++) {
      const ringR = ring * (bowlDia + spacing);
      if (ringR + r > R) break;
      const circ = 2 * Math.PI * ringR;
      const n = Math.floor(circ / (bowlDia + spacing));
      for (let i = 0; i < n; i++) {
        const angle = (i / n) * Math.PI * 2;
        const cx = ringR * Math.cos(angle), cy = ringR * Math.sin(angle);
        if (Math.sqrt(cx * cx + cy * cy) + r <= R) {
          positions.push([cx, cy]); count++;
        }
      }
    }
  } else {
    const sw = shelf.w, sh = shelf.h;
    const step = bowlDia + spacing;
    for (let x = bowlDia / 2 + spacing; x + bowlDia / 2 <= sw; x += step) {
      for (let y = bowlDia / 2 + spacing; y + bowlDia / 2 <= sh; y += step) {
        positions.push([x - sw / 2, y - sh / 2]); count++;
      }
    }
  }

  const viewSize = shelf.shape === "round" ? shelf.d : Math.max(shelf.w, shelf.h);
  const svgSize = 200, sc = (svgSize - 20) / viewSize, cx = svgSize / 2, cy = svgSize / 2;

  return (
    <div>
      <div style={{ display: "flex", gap: 3, marginBottom: 6, flexWrap: "wrap" }}>
        {KILN_SHELVES.map((s, i) => (
          <button key={i} onClick={() => setShelfIdx(i)} style={{
            fontFamily: mono, fontSize: 8, padding: "3px 6px", borderRadius: 3, cursor: "pointer",
            background: i === shelfIdx ? P.accent + "22" : "transparent",
            border: `1px solid ${i === shelfIdx ? P.accent + "55" : P.cardBorder}`,
            color: i === shelfIdx ? P.accent : P.textFaint,
          }}>{s.name}</button>
        ))}
      </div>
      <svg viewBox={`0 0 ${svgSize} ${svgSize}`} style={{ width: "100%", background: P.svgBg, borderRadius: 8 }}>
        {/* Shelf outline */}
        {shelf.shape === "round"
          ? <circle cx={cx} cy={cy} r={shelf.d / 2 * sc} fill="none" stroke={P.cardBorder} strokeWidth={1.5} />
          : <rect x={cx - shelf.w / 2 * sc} y={cy - shelf.h / 2 * sc} width={shelf.w * sc} height={shelf.h * sc} fill="none" stroke={P.cardBorder} strokeWidth={1.5} rx={2} />
        }
        {/* Bowls */}
        {positions.map(([px, py], i) => (
          <circle key={i} cx={cx + px * sc} cy={cy + py * sc} r={bowlDia / 2 * sc} fill={P.inner + "22"} stroke={P.inner} strokeWidth={0.8} />
        ))}
        {/* Count */}
        <text x={svgSize - 6} y={svgSize - 6} textAnchor="end" fontSize="9" fill={P.text} fontFamily={mono} fontWeight="600">{count} bowls</text>
        <text x={6} y={svgSize - 6} fontSize="7" fill={P.textFaint} fontFamily={mono}>ø{Math.round(bowlDia)}mm thrown</text>
      </svg>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// THROWING GUIDE — step by step with clay weights
// ═══════════════════════════════════════════════════════════
function ThrowingGuide({ p, vol, shrinkage, imperial, clayBody }) {
  const factor = 1 / (1 - shrinkage / 100);
  const throwRim = p.rimDiameter * factor;
  const throwH = (p.interiorDepth + p.floor.thickness + p.foot.height) * factor;
  const throwClayG = vol.clayWetG * (factor ** 3);
  // Add 15% overage for centering waste + trimming
  const wedgeG = throwClayG * 1.15;
  const mm = v => imperial ? (v / 25.4).toFixed(1) + '"' : Math.round(v) + 'mm';
  const density = CLAY_BODIES[clayBody]?.density || 1.8;

  const steps = [
    { title: "Wedge clay", detail: `${imperial ? (wedgeG / 453.592).toFixed(1) + " lb" : Math.round(wedgeG) + " g"} of ${CLAY_BODIES[clayBody]?.name || "clay"} (includes 15% trimming overage). Spiral wedge 30× to remove air.`, icon: "🫳" },
    { title: "Center", detail: `Cone up → push down 3×. Final puck: ~${mm(throwRim * 0.5)} wide, ${mm(throwH * 0.3)} tall.`, icon: "🎯" },
    { title: "Open floor", detail: `Press thumb to ${mm(p.floor.thickness * factor)} from bat. Floor width: ${mm(p.foot.outerRadius * 2 * factor)}.`, icon: "👇" },
    { title: "Pull walls", detail: `3-4 pulls. Target: ${mm(p.wallThickness * factor)} thick × ${mm(throwH)} tall. Leave base thick — trim later.`, icon: "🤲" },
    { title: "Shape profile", detail: `Open to ${mm(throwRim)} rim diameter. ${p.outer.length > 8 ? "Gentle curve" : "Use rib"} to shape wall.`, icon: "◠" },
    { title: "Rib exterior", detail: `Compress with outer rib from foot to rim in one continuous pull. This defines the fired shape.`, icon: "🪵" },
    { title: "Rib interior", detail: `Inner rib: floor to rim, matching bowl curve. Press firmly — this is your functional surface.`, icon: "🥣" },
    { title: "Trim rim", detail: `Chamfer or round the rim. Final rim at ${mm(throwRim)} diameter. Clean with wet chamois.`, icon: "✂️" },
    { title: "Wire off + dry", detail: `Wire cut at bat level. Dry slowly under plastic 24-48h to leather hard.`, icon: "🧵" },
    { title: "Trim foot", detail: `Flip on chuck. Trim foot ring: outer ø${mm(p.foot.outerRadius * 2 * factor)}, inner ø${mm(p.foot.innerRadius * 2 * factor)}, ${mm(p.foot.height * factor)} tall.`, icon: "🔄" },
    { title: `Fire ∆${CLAY_BODIES[clayBody]?.cone || "6"}`, detail: `Bisque → glaze → fire. Expect ${shrinkage}% shrinkage. Final rim: ${mm(p.rimDiameter)}.`, icon: "🔥" },
  ];

  return (
    <div style={{ fontFamily: mono, fontSize: 10 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", gap: 8, padding: "6px 0", borderTop: i > 0 ? `1px solid ${P.cardBorder}22` : "none" }}>
          <div style={{ fontSize: 14, width: 20, textAlign: "center", flexShrink: 0 }}>{s.icon}</div>
          <div>
            <div style={{ fontWeight: 600, color: P.text, marginBottom: 2 }}>{i + 1}. {s.title}</div>
            <div style={{ color: P.textMuted, lineHeight: 1.5 }}>{s.detail}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════
export default function App() {
  const [tab, setTab] = useState("design");
  const [prof, setProf] = useState("fargklar-real");
  const [nB, setNB] = useState(4);
  const [gap, setGap] = useState(3);
  const [showN, setShowN] = useState(true);
  const [showA, setShowA] = useState(true);
  const [showRibs, setShowRibs] = useState(false);
  const [selectedBowl, setSelectedBowl] = useState(null);
  const [imperial, setImperial] = useState(true);
  const [dark, setDark] = useState(false);
  const [clayBody, setClayBody] = useState("stoneware");
  
  // Update global palette on dark mode toggle
  P = dark ? PD : PL;
  
  const [edgeAngle, setEdgeAngle] = useState(60);
  const [ribThick, setRibThick] = useState(8);
  const [rimType, setRimType] = useState("rounded");
  const [shrinkage, setShrinkage] = useState(12); // clay shrinkage % (fired vs wet)
  const [mfg, setMfg] = useState("hand");
  const [price, setPrice] = useState(28);
  const [ag, setAg] = useState({ market: { s: "idle", r: null }, listing: { s: "idle", r: null }, social: { s: "idle", r: null }, launch: { s: "idle", r: null }, vendor: { s: "idle", r: null }, feedback: { s: "idle", r: null } });
  const [showAllRims, setShowAllRims] = useState(false);

  // Sync shrinkage when clay body changes (except custom)
  useEffect(() => { if (clayBody !== "custom") setShrinkage(CLAY_BODIES[clayBody].shrinkage); }, [clayBody]);

  const base = PROFILES[prof];
  const [wallT, setWallT] = useState(base.wallThickness);
  const [floorT, setFloorT] = useState(base.floor.thickness);
  const [footH, setFootH] = useState(base.foot.height);
  const [footOR, setFootOR] = useState(base.foot.outerRadius);
  const [footIR, setFootIR] = useState(base.foot.innerRadius);
  const [lipH, setLipH] = useState(base.rimLip.height);
  const [lipOv, setLipOv] = useState(base.rimLip.overhang);
  const [customOuter, setCustomOuter] = useState(PROFILES.custom.outer.map(p => [...p]));
  const [customRimDia, setCustomRimDia] = useState(PROFILES.custom.rimDiameter);
  const [customDepth, setCustomDepth] = useState(PROFILES.custom.interiorDepth);
  useEffect(() => { const b = PROFILES[prof]; setWallT(b.wallThickness); setFloorT(b.floor.thickness); setFootH(b.foot.height); setFootOR(b.foot.outerRadius); setFootIR(b.foot.innerRadius); setLipH(b.rimLip.height); setLipOv(b.rimLip.overhang); }, [prof]);

  const isCustom = prof === "custom";
  const p = isCustom
    ? { ...base, wallThickness: wallT, floor: { thickness: floorT }, foot: { outerRadius: footOR, innerRadius: footIR, height: footH }, rimLip: { height: lipH, overhang: lipOv }, outer: customOuter, rimDiameter: customRimDia, interiorDepth: customDepth }
    : { ...base, wallThickness: wallT, floor: { thickness: floorT }, foot: { outerRadius: footOR, innerRadius: footIR, height: footH }, rimLip: { height: lipH, overhang: lipOv } };
  const bowls = nest(p, nB, gap);
  const vol = computeVolumes(p);
  const csRef = useRef(null);

  const copyToCustom = () => {
    setCustomOuter(p.outer.map(pt => [...pt]));
    setCustomRimDia(p.rimDiameter);
    setCustomDepth(p.interiorDepth);
    setWallT(p.wallThickness);
    setFloorT(p.floor.thickness);
    setFootH(p.foot.height);
    setFootOR(p.foot.outerRadius);
    setFootIR(p.foot.innerRadius);
    setLipH(p.rimLip.height);
    setLipOv(p.rimLip.overhang);
    setProf("custom");
  };
  useEffect(() => { if (selectedBowl != null && selectedBowl >= nB) setSelectedBowl(null); }, [nB]);
  const mm = v => imperial ? (v / 25.4).toFixed(2) + '"' : v.toFixed(1) + 'mm';
  const mmI = v => imperial ? (v / 25.4).toFixed(2) + '"' : v.toFixed(0) + 'mm';
  const sa = (k, v) => setAg(prev => ({ ...prev, [k]: { ...prev[k], ...v } }));
  const runA = async (k, s, u, ws = false) => { sa(k, { s: "loading" }); const r = await claude(s, u, ws); sa(k, { s: "done", r }); };

  const tabs = [{ id: "design", label: "DESIGN", icon: "◎" }, { id: "hq", label: "HQ", icon: "⚡" }, { id: "make", label: "MAKE", icon: "🪚" }, { id: "agents", label: "AGENTS", icon: "🤖" }, { id: "money", label: "$$$", icon: "💰" }];
  const mfgD = { hand: { l: "Handmade", pu: 1.20 + nB * 0.6, su: 15, pros: ["Zero setup", "Ship same day", "Premium brand"], cons: ["3-4/day max", "Physical labor"] },
    print3d: { l: "SLA Resin Print", pu: 2.80 + nB * 0.9, su: 0, pros: ["Glass-smooth edge", "Consistent", "60° edge holds"], cons: ["$5-8/set", "3-5 day ship"] },
    drop: { l: "Drop Ship", pu: 4.50 + nB * 1.2, su: 0, pros: ["Zero inventory", "Infinite scale"], cons: ["Highest COGS", "No QC"] },
    hybrid: { l: "Hybrid", pu: 2.0 + nB * 0.7, su: 15, pros: ["Best of both", "Always in stock"], cons: ["Two supply chains"] } };
  const cogs = mfgD[mfg].pu + 1.50; const margin = price - cogs - price * 0.15 - 5.50 - 2.00;

  return (
    <div style={{ minHeight: "100vh", background: P.bg, color: P.text, fontFamily: "'DM Sans','Inter',system-ui,sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Fraunces:wght@400;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 100, opacity: dark ? 0.06 : 0.04,
        background: `repeating-conic-gradient(${dark ? "#fff1" : "#8c7e6f33"} 0% 25%, transparent 0% 50%) 0 0 / 3px 3px` }} />
      <div style={{ background: P.card, borderBottom: `1px solid ${P.cardBorder}`, padding: "0 12px", display: "flex", alignItems: "center", position: "sticky", top: 0, zIndex: 10, boxShadow: "0 1px 8px rgba(61,50,41,0.06)", overflowX: "auto", gap: 2 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, padding: "14px 12px 14px 0", borderRight: `1px solid ${P.cardBorder}`, marginRight: 4, flexShrink: 0 }}>
          <span style={{ fontFamily: serif, fontSize: 18, fontWeight: 700, color: P.text }}>ThrowForm</span>
        </div>
        {tabs.map(t => (<button key={t.id} onClick={() => setTab(t.id)} style={{ padding: "14px 10px", background: "transparent", border: "none", cursor: "pointer", borderBottom: tab === t.id ? `2px solid ${P.accent}` : "2px solid transparent", display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          <span style={{ fontSize: 12 }}>{t.icon}</span><span style={{ fontFamily: mono, fontSize: 10, fontWeight: 500, letterSpacing: "0.04em", color: tab === t.id ? P.accent : P.textFaint }}>{t.label}</span>
        </button>))}
        <select value={prof} onChange={e => setProf(e.target.value)} style={{ marginLeft: "auto", background: P.bgDeep, border: `1px solid ${P.cardBorder}`, borderRadius: 8, padding: "6px 10px", color: P.text, fontFamily: mono, fontSize: 10, cursor: "pointer", maxWidth: 220, flexShrink: 0 }}>
          {Object.entries(PROFILES).map(([k, v]) => (<option key={k} value={k}>{v.name}</option>))}
        </select>
        {!isCustom && <button onClick={copyToCustom} title="Copy this profile to Custom editor" style={{ padding: "6px 10px", background: P.accent + "15", border: `1px solid ${P.accent}33`, borderRadius: 8, cursor: "pointer", fontFamily: mono, fontSize: 9, fontWeight: 600, color: P.accent, whiteSpace: "nowrap", flexShrink: 0 }}>✎ Customize</button>}
      </div>

      <div style={{ maxWidth: 1050, margin: "0 auto", padding: "16px 14px" }}>
        {/* ═══ DESIGN ═══ */}
        {tab === "design" && (<div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
            <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: P.text, margin: 0 }}>Bowl Anatomy</h2>
            {prof === "fargklar-real" && <span style={{ fontFamily: mono, fontSize: 9, color: P.inner, background: P.inner + "18", padding: "2px 6px", borderRadius: 3, border: `1px solid ${P.inner}33` }}>✦ REAL SVG DATA</span>}
            {isCustom && <span style={{ fontFamily: mono, fontSize: 9, color: P.accent, background: P.accent + "18", padding: "2px 6px", borderRadius: 3, border: `1px solid ${P.accent}33` }}>✎ CUSTOM</span>}
          </div>
          <p style={{ fontFamily: mono, fontSize: 10, color: P.textFaint, margin: "0 0 14px" }}>Full cross-section: foot → floor → walls → rim. Select rim type and toggle rib tools.</p>
          <div className="tf-grid" style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 14, alignItems: "start" }}>
            <style>{`@media (max-width: 700px) { .tf-grid { grid-template-columns: 1fr !important; } .tf-stats { grid-template-columns: repeat(2,1fr) !important; } }`}</style>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {isCustom && (
                <Card title="CURVE EDITOR" color={P.inner} glow>
                  <Sl imperial={imperial} l="Rim ø" v={customRimDia} fn={setCustomRimDia} mn={80} mx={300} />
                  <Sl imperial={imperial} l="Depth" v={customDepth} fn={setCustomDepth} mn={20} mx={120} />
                  <CustomProfileEditor outer={customOuter} onChange={setCustomOuter} rimDia={customRimDia} interiorDepth={customDepth} />
                </Card>
              )}
              <Card title="NESTING SET"><Sl imperial={imperial} l="Bowls" v={nB} fn={setNB} mn={2} mx={6} u="" /><Sl imperial={imperial} l="Gap" v={gap} fn={setGap} mn={1} mx={10} /></Card>
              <Card title="WALL & FLOOR" color={P.inner}><Sl imperial={imperial} l="Wall" v={wallT} fn={setWallT} mn={2} mx={12} st={0.5} /><Sl imperial={imperial} l="Floor" v={floorT} fn={setFloorT} mn={3} mx={20} st={0.5} /></Card>
              <Card title="FOOT RING" color={P.purple}>
                <Sl imperial={imperial} l="Outer R" v={footOR} fn={setFootOR} mn={15} mx={100} />
                <Sl imperial={imperial} l="Inner R" v={footIR} fn={v => setFootIR(Math.min(v, footOR - 2))} mn={10} mx={98} />
                <Sl imperial={imperial} l="Height" v={footH} fn={setFootH} mn={1} mx={10} st={0.5} />
                <div style={{ fontFamily: mono, fontSize: 9, color: P.textFaint }}>Ring: {mm(footOR - footIR)} · ø{mmI(footOR * 2)}</div>
              </Card>
              <Card title="RIM" color={P.accent}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <div style={{ fontFamily: mono, fontSize: 8, color: P.textFaint }}>
                    {showAllRims ? "All rim types" : `For ${base.vessel}s`}
                  </div>
                  <button onClick={() => setShowAllRims(!showAllRims)} style={{ background: "transparent", border: `1px solid ${P.cardBorder}`, borderRadius: 4, padding: "2px 6px", cursor: "pointer", fontFamily: mono, fontSize: 8, color: showAllRims ? P.accent : P.textFaint }}>
                    {showAllRims ? "Filter" : "Show all"}
                  </button>
                </div>
                <div style={{ marginBottom: 8 }}>
                  {Object.entries(RIM_TYPES)
                    .filter(([, v]) => showAllRims || v.vessels.includes(base.vessel))
                    .map(([k, v]) => {
                      const recommended = !showAllRims && v.vessels[0] === base.vessel;
                      const offType = showAllRims && !v.vessels.includes(base.vessel);
                      return (
                    <button key={k} onClick={() => setRimType(k)} style={{
                      display: "block", width: "100%", textAlign: "left", padding: "5px 8px", marginBottom: 3,
                      background: rimType === k ? P.accent + "18" : "transparent",
                      border: rimType === k ? `1px solid ${P.accent}55` : `1px solid ${P.cardBorder}`,
                      borderRadius: 5, cursor: "pointer", opacity: offType ? 0.45 : 1,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 600, color: rimType === k ? P.accent : P.textMuted }}>{v.name}</span>
                        {recommended && <span style={{ fontFamily: mono, fontSize: 7, color: P.inner, background: P.inner + "18", borderRadius: 3, padding: "1px 4px" }}>best</span>}
                      </div>
                      <div style={{ fontFamily: mono, fontSize: 8, color: P.textFaint, marginTop: 1 }}>{v.desc}</div>
                    </button>
                  );})}
                </div>
                <Sl imperial={imperial} l="Lip height" v={lipH} fn={setLipH} mn={1} mx={12} st={0.5} />
                <Sl imperial={imperial} l="Overhang" v={lipOv} fn={setLipOv} mn={0} mx={8} st={0.5} />
              </Card>
              {shrinkage > 0 && (
                <Card title={`${CLAY_BODIES[clayBody]?.name || "Shrinkage"} · ${shrinkage}%`} color={P.amber}>
                  <ShrinkageCard p={p} shrinkage={shrinkage} imperial={imperial} vol={vol} />
                </Card>
              )}
              {isCustom && (
                <Card title="PROFILE I/O" color={P.blue}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <Btn full onClick={() => exportProfile(p, "Custom Bowl")} color={P.blue}>↓ Save JSON</Btn>
                    <label style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontFamily: mono, fontSize: 11, fontWeight: 600, color: P.inner, background: P.inner + "15", border: `1px solid ${P.inner}33` }}>
                        ↑ Load JSON
                      </div>
                      <input type="file" accept=".json" style={{ display: "none" }} onChange={e => {
                        if (e.target.files[0]) importProfile(e.target.files[0], (data) => {
                          setCustomOuter(data.outer);
                          setCustomRimDia(data.rimDiameter);
                          setCustomDepth(data.interiorDepth);
                          setWallT(data.wallThickness);
                          setFloorT(data.floor.thickness);
                          setFootH(data.foot.height);
                          setFootOR(data.foot.outerRadius);
                          setFootIR(data.foot.innerRadius);
                          setLipH(data.rimLip.height);
                          setLipOv(data.rimLip.overhang);
                        });
                      }} />
                    </label>
                  </div>
                </Card>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Compact toolbar — rib toggle, display options, units */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", background: P.card, borderRadius: 10, padding: "10px 14px", border: `1px solid ${P.cardBorder}` }}>
                <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                  <input type="checkbox" checked={showRibs} onChange={e => setShowRibs(e.target.checked)} style={{ accentColor: P.accent }} />
                  <span style={{ fontFamily: mono, fontSize: 10, color: P.textMuted }}>Rib tools</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                  <span style={{ fontFamily: mono, fontSize: 10, color: P.textMuted, whiteSpace: "nowrap" }}>Rib {mm(ribThick)}</span>
                  <input type="range" min={4} max={14} step={0.5} value={ribThick} onChange={e => setRibThick(parseFloat(e.target.value))} style={{ width: 60, accentColor: P.accent }} />
                </label>
                <div style={{ width: 1, height: 18, background: P.cardBorder }} />
                <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                  <input type="checkbox" checked={showA} onChange={e => setShowA(e.target.checked)} style={{ accentColor: P.accent }} />
                  <span style={{ fontFamily: mono, fontSize: 10, color: P.textMuted }}>Dims</span>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                  <input type="checkbox" checked={showN} onChange={e => setShowN(e.target.checked)} style={{ accentColor: P.accent }} />
                  <span style={{ fontFamily: mono, fontSize: 10, color: P.textMuted }}>Nesting</span>
                </label>
                <div style={{ width: 1, height: 18, background: P.cardBorder }} />
                <div style={{ display: "flex", gap: 2 }}>
                  {["mm", "in"].map(u => (
                    <button key={u} onClick={() => setImperial(u === "in")} style={{
                      padding: "2px 8px", borderRadius: 4, cursor: "pointer", fontFamily: mono, fontSize: 9, fontWeight: 600,
                      background: (u === "in") === imperial ? P.accent + "22" : "transparent",
                      border: (u === "in") === imperial ? `1px solid ${P.accent}55` : `1px solid ${P.cardBorder}`,
                      color: (u === "in") === imperial ? P.accent : P.textFaint,
                    }}>{u}</button>
                  ))}
                </div>
                <div style={{ width: 1, height: 18, background: P.cardBorder }} />
                <label style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
                  <select value={clayBody} onChange={e => { setClayBody(e.target.value); if (e.target.value === "custom") {} }} style={{ background: P.bgDeep, border: `1px solid ${P.cardBorder}`, borderRadius: 4, padding: "2px 4px", fontFamily: mono, fontSize: 9, color: P.textMuted, cursor: "pointer" }}>
                    {Object.entries(CLAY_BODIES).map(([k, v]) => <option key={k} value={k}>{v.name} ({v.shrinkage}%)</option>)}
                  </select>
                  {clayBody === "custom" && <input type="range" min={0} max={20} step={1} value={shrinkage} onChange={e => setShrinkage(parseInt(e.target.value))} style={{ width: 40, accentColor: P.accent }} />}
                  <span style={{ fontFamily: mono, fontSize: 8, color: P.textFaint }}>{shrinkage}%</span>
                </label>
                <div style={{ width: 1, height: 18, background: P.cardBorder }} />
                <button onClick={() => setDark(!dark)} title="Toggle dark mode" style={{ background: "transparent", border: `1px solid ${P.cardBorder}`, borderRadius: 4, padding: "2px 8px", cursor: "pointer", fontFamily: mono, fontSize: 10, color: P.textMuted }}>{dark ? "☀" : "☾"}</button>
              </div>
              <Card title="FULL CROSS-SECTION">
                {/* Bowl selector */}
                <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                  <button onClick={() => setSelectedBowl(null)} style={{
                    padding: "3px 8px", borderRadius: 4, cursor: "pointer", fontFamily: mono, fontSize: 9, fontWeight: 600,
                    background: selectedBowl == null ? P.accent + "22" : "transparent",
                    border: selectedBowl == null ? `1px solid ${P.accent}55` : `1px solid ${P.cardBorder}`,
                    color: selectedBowl == null ? P.accent : P.textFaint,
                  }}>Base</button>
                  {bowls.map((b, i) => (
                    <button key={i} onClick={() => setSelectedBowl(i)} style={{
                      padding: "3px 8px", borderRadius: 4, cursor: "pointer", fontFamily: mono, fontSize: 9, fontWeight: 600,
                      background: selectedBowl === i ? C[i % 6] + "22" : "transparent",
                      border: selectedBowl === i ? `1px solid ${C[i % 6]}55` : `1px solid ${P.cardBorder}`,
                      color: selectedBowl === i ? C[i % 6] : P.textFaint,
                    }}>B{i + 1} · {mmI(b.rim)}</button>
                  ))}
                </div>
                <CrossSection p={p} bowls={bowls} showNesting={showN} showAnnotations={showA} rimType={rimType} selectedBowl={selectedBowl} onSelectBowl={setSelectedBowl} imperial={imperial} svgRef={csRef} />
                <button onClick={() => exportCrossSection(csRef.current, p.name)} style={{ position: "absolute", top: 8, right: 8, background: P.bgDeep, border: `1px solid ${P.cardBorder}`, borderRadius: 4, padding: "2px 6px", cursor: "pointer", fontFamily: mono, fontSize: 8, color: P.textFaint }}>↓ SVG</button>
              </Card>

              {showRibs && (
                <Card title="RIB TOOLS — TWO PER BOWL" color={P.accent} glow>
                  <div style={{ fontFamily: mono, fontSize: 9, color: P.textFaint, marginBottom: 8 }}>
                    Inner + outer wall profile ribs · flat base = wheel true · {mm(ribThick)} body
                  </div>
                  <RibToolView bowls={bowls} p={p} edgeAngle={edgeAngle} ribThick={ribThick} profileName={p.name} imperial={imperial} />
                </Card>
              )}

              <div className="tf-stats" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5 }}>
                <Stat l="Volume" v={imperial ? vol.interiorOz.toFixed(1) + ' oz' : vol.interiorML.toFixed(0) + ' mL'} c={P.blue} />
                <Stat l="Clay" v={imperial ? vol.clayLbs.toFixed(2) + ' lb' : vol.clayWetG.toFixed(0) + ' g'} c={P.accent} />
                <Stat l="Glaze" v={imperial ? vol.glazeAreaIn2.toFixed(0) + ' in²' : (vol.glazeArea / 100).toFixed(0) + ' cm²'} c={P.inner} />
                <Stat l="Rim ø" v={mmI(p.rimDiameter)} />
              </div>
              <div className="tf-stats" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 5 }}>
                {(() => { const f = v => imperial ? (v / 25.4).toFixed(2) + '"' : v.toFixed(0) + 'mm'; return (<>
                  <Stat l="Total H" v={f(p.interiorDepth + floorT + footH)} />
                  <Stat l="Depth" v={f(p.interiorDepth)} c={P.inner} />
                  <Stat l="Foot ø" v={f(footOR * 2)} c={P.purple} />
                  <Stat l="Wall" v={mm(wallT)} c={P.textMuted} />
                  <Stat l="Edge" v={`${edgeAngle}°`} c={P.accent} />
                </>); })()}
              </div>
              <Card title="NESTING TABLE">
                <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: 10 }}>
                  <thead><tr>{["", "Bowl", "Rim ø", "Height", "Volume", "Clay", "Foot ø", "Scale"].map(h => <th key={h} style={{ padding: "4px 6px", textAlign: "left", color: P.textFaint, borderBottom: `1px solid ${P.cardBorder}`, fontSize: 9 }}>{h}</th>)}</tr></thead>
                  <tbody>{bowls.map((b, i) => {
                    const bv = computeVolumes(p, b.s);
                    return <tr key={i}>
                    <td style={{ padding: "4px 6px" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: C[i], display: "inline-block" }} /></td>
                    <td style={{ padding: "4px 6px", color: P.text, fontWeight: 600 }}>{b.label}</td>
                    <td style={{ padding: "4px 6px", color: P.text }}>{mm(b.rim)}</td>
                    <td style={{ padding: "4px 6px", color: P.textMuted }}>{mm(b.h)}</td>
                    <td style={{ padding: "4px 6px", color: P.blue }}>{imperial ? bv.interiorOz.toFixed(1) + ' oz' : bv.interiorML.toFixed(0) + ' mL'}</td>
                    <td style={{ padding: "4px 6px", color: P.accent }}>{imperial ? bv.clayLbs.toFixed(2) + ' lb' : bv.clayWetG.toFixed(0) + ' g'}</td>
                    <td style={{ padding: "4px 6px", color: P.purple }}>{mmI(b.footOuter * 2)}</td>
                    <td style={{ padding: "4px 6px", color: P.textFaint }}>{(b.s * 100).toFixed(0)}%</td>
                  </tr>; })}</tbody>
                </table></div>
              </Card>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                <Btn full onClick={() => exportSVG(bowls, p, edgeAngle, ribThick)}>↓ RIB SVG (3D PRINT / CNC)</Btn>
                <Btn full onClick={() => exportTemplate(bowls, p, edgeAngle, ribThick)} color={P.inner}>↓ TEMPLATE (HAND CUT)</Btn>
                <Btn full onClick={() => exportProfile(p, p.name)} color={P.blue}>↓ PROFILE JSON</Btn>
              </div>
            </div>
          </div>
        </div>)}

        {/* ═══ HQ ═══ */}
        {tab === "hq" && (<div>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: P.text, margin: "0 0 14px" }}>Overview</h2>
          {/* Big stats row */}
          <div className="tf-stats" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 6, marginBottom: 12 }}>
            <Stat l="Volume" v={imperial ? vol.interiorOz.toFixed(1) + ' oz' : vol.interiorML.toFixed(0) + ' mL'} c={P.blue} />
            <Stat l="Clay (wet)" v={imperial ? vol.clayLbs.toFixed(2) + ' lb' : vol.clayWetG.toFixed(0) + ' g'} c={P.accent} />
            <Stat l="Glaze area" v={imperial ? vol.glazeAreaIn2.toFixed(0) + ' in²' : (vol.glazeArea / 100).toFixed(0) + ' cm²'} c={P.inner} />
            <Stat l="Rim ø" v={mmI(p.rimDiameter)} />
            <Stat l="Total H" v={mmI(p.interiorDepth + floorT + footH)} />
            <Stat l="Set of" v={nB} c={P.accent} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
            <Card title="SPECS"><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
              <Stat l="Wall" v={mm(wallT)} /><Stat l="Floor" v={mm(floorT)} /><Stat l="Foot H" v={mm(footH)} c={P.purple} />
              <Stat l="Foot ø" v={mmI(footOR * 2)} c={P.purple} /><Stat l="Rim" v={RIM_TYPES[rimType]?.name} c={P.accent} /><Stat l="Edge" v={edgeAngle + "°"} c={P.accent} />
              <Stat l="Rib" v={mm(ribThick)} /><Stat l="Profile" v={p.name.split(" ")[0]} /><Stat l="Source" v={isCustom ? "Custom" : "Data"} c={P.inner} />
            </div></Card>
            <Card title="CROSS-SECTION"><CrossSection p={p} bowls={bowls} showNesting={true} showAnnotations={false} rimType={rimType} /></Card>
          </div>
          {/* 3D silhouette spin */}
          <Card title="3D WIREFRAME">
            <Bowl3D p={p} footH={footH} floorT={floorT} wallT={wallT} />
          </Card>
          {/* Per-bowl breakdown */}
          <Card title="NESTING SET BREAKDOWN">
            <div style={{ overflowX: "auto" }}><table style={{ width: "100%", borderCollapse: "collapse", fontFamily: mono, fontSize: 10 }}>
              <thead><tr>{["", "Bowl", "Rim ø", "Height", "Volume", "Clay", "Glaze", "Scale"].map(h => <th key={h} style={{ padding: "4px 6px", textAlign: "left", color: P.textFaint, borderBottom: `1px solid ${P.cardBorder}`, fontSize: 9 }}>{h}</th>)}</tr></thead>
              <tbody>{bowls.map((b, i) => {
                const bv = computeVolumes(p, b.s);
                return <tr key={i} style={{ borderBottom: `1px solid ${P.cardBorder}22` }}>
                  <td style={{ padding: "5px 6px" }}><div style={{ width: 8, height: 8, borderRadius: 2, background: C[i], display: "inline-block" }} /></td>
                  <td style={{ padding: "5px 6px", color: P.text, fontWeight: 600 }}>{b.label}</td>
                  <td style={{ padding: "5px 6px", color: P.text }}>{mm(b.rim)}</td>
                  <td style={{ padding: "5px 6px", color: P.textMuted }}>{mm(b.h)}</td>
                  <td style={{ padding: "5px 6px", color: P.blue }}>{imperial ? bv.interiorOz.toFixed(1) + ' oz' : bv.interiorML.toFixed(0) + ' mL'}</td>
                  <td style={{ padding: "5px 6px", color: P.accent }}>{imperial ? bv.clayLbs.toFixed(2) + ' lb' : bv.clayWetG.toFixed(0) + ' g'}</td>
                  <td style={{ padding: "5px 6px", color: P.inner }}>{imperial ? bv.glazeAreaIn2.toFixed(0) + ' in²' : (bv.glazeArea / 100).toFixed(0) + ' cm²'}</td>
                  <td style={{ padding: "5px 6px", color: P.textFaint }}>{(b.s * 100).toFixed(0)}%</td>
                </tr>; })}
                {/* Totals row */}
                <tr style={{ borderTop: `2px solid ${P.cardBorder}` }}>
                  <td /><td style={{ padding: "5px 6px", fontWeight: 700, color: P.text }}>Total</td><td /><td />
                  <td style={{ padding: "5px 6px", color: P.blue, fontWeight: 700 }}>{(() => { const t = bowls.reduce((s, b) => s + computeVolumes(p, b.s).interiorML, 0); return imperial ? (t / 29.5735).toFixed(1) + ' oz' : t.toFixed(0) + ' mL'; })()}</td>
                  <td style={{ padding: "5px 6px", color: P.accent, fontWeight: 700 }}>{(() => { const t = bowls.reduce((s, b) => s + computeVolumes(p, b.s).clayWetG, 0); return imperial ? (t / 453.592).toFixed(2) + ' lb' : t.toFixed(0) + ' g'; })()}</td>
                  <td /><td />
                </tr>
              </tbody>
            </table></div>
          </Card>
          {shrinkage > 0 && (
            <Card title={`THROW AT · ${CLAY_BODIES[clayBody]?.name || "Clay"} ${shrinkage}%`} color={P.amber}>
              <ShrinkageCard p={p} shrinkage={shrinkage} imperial={imperial} vol={vol} />
            </Card>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 10 }}>
            <Btn full onClick={() => exportSVG(bowls, p, edgeAngle, ribThick)}>↓ RIB SVG</Btn>
            <Btn full onClick={() => exportTemplate(bowls, p, edgeAngle, ribThick)} color={P.inner}>↓ TEMPLATE</Btn>
            <Btn full onClick={() => exportProfile(p, p.name)} color={P.blue}>↓ PROFILE JSON</Btn>
          </div>
        </div>)}

        {/* ═══ MAKE ═══ */}
        {tab === "make" && (<div>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: P.text, margin: "0 0 14px" }}>Manufacturing</h2>
          <div className="tf-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
            {Object.entries(mfgD).map(([k, v]) => <button key={k} onClick={() => setMfg(k)} style={{ background: P.card, border: mfg === k ? `1px solid ${P.accent}` : `1px solid ${P.cardBorder}`, borderRadius: 6, padding: "10px", cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden" }}>
              {mfg === k && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: P.accent }} />}
              <div style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: mfg === k ? P.accent : P.textMuted }}>{v.l}</div>
              <div style={{ fontFamily: mono, fontSize: 10, color: P.inner, marginTop: 3 }}>${v.pu.toFixed(2)}/set</div>
            </button>)}
          </div>
          {mfg === "print3d" && (
            <Card title="RECOMMENDED 3D PRINT SERVICES" color={P.blue} glow>
              <div style={{ fontFamily: mono, fontSize: 10, lineHeight: 1.8, color: P.textMuted }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: P.accent, fontWeight: 700 }}>MATERIAL:</span> Formlabs Rigid 4000 Resin (SLA)
                  <div style={{ fontSize: 9, color: P.textFaint, marginLeft: 16 }}>Glass-filled · PEEK-like stiffness · Polished finish · Holds {edgeAngle}° edge · Won't deform under clay pressure</div>
                </div>
                {[
                  { name: "Xometry", note: "Free US shipping · Instant quoting · Rigid 4000 · 1-5 day lead" },
                  { name: "Protolabs Network (Hubs)", note: "Formlabs Rigid 4000 · 50µm layers · Global ship" },
                  { name: "Shapeways", note: "SLA Accura 60 · Smooth finish · Scale to 10K+ units" },
                  { name: "JLC3DP", note: "Cheapest per-unit · SLA from $0.30 · 2-day mfg · Global ship" },
                  { name: "Sculpteo", note: "Chemical smoothing option · 10% off first order" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", borderTop: i > 0 ? `1px solid ${P.cardBorder}` : "none" }}>
                    <span style={{ color: P.blue, fontWeight: 700, minWidth: 180 }}>{s.name}</span>
                    <span style={{ color: P.textFaint, fontSize: 9 }}>{s.note}</span>
                  </div>
                ))}
                <div style={{ marginTop: 10, padding: "8px 10px", background: P.bgDeep, borderRadius: 6, fontSize: 9, color: P.textMuted }}>
                  <span style={{ color: P.accent }}>PROTOTYPE:</span> Export RIB SVG → extrude to {mm(ribThick)} in Fusion 360 → add {edgeAngle}° chamfer on working edge → export STL → upload. Request "Formlabs Rigid 4000" or "SLA engineering resin" at 50µm layers.
                </div>
              </div>
            </Card>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
            <Card title="PROS">{mfgD[mfg].pros.map((x, i) => <div key={i} style={{ fontFamily: mono, fontSize: 10, color: P.inner, padding: "3px 0" }}>✓ {x}</div>)}</Card>
            <Card title="CONS">{mfgD[mfg].cons.map((x, i) => <div key={i} style={{ fontFamily: mono, fontSize: 10, color: P.accent, padding: "3px 0" }}>✗ {x}</div>)}</Card>
          </div>
          {mfg === "hand" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <Card title={`THROWING GUIDE · ${CLAY_BODIES[clayBody]?.name || "Clay"} ∆${CLAY_BODIES[clayBody]?.cone || "6"}`} color={P.inner} glow>
                <ThrowingGuide p={p} vol={vol} shrinkage={shrinkage} imperial={imperial} clayBody={clayBody} />
              </Card>
              <Card title="KILN SHELF LAYOUT" color={P.amber}>
                <KilnShelfView rimDia={p.rimDiameter} shrinkage={shrinkage} />
              </Card>
            </div>
          )}
        </div>)}

        {/* ═══ AGENTS ═══ */}
        {tab === "agents" && (<div>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: P.text, margin: "0 0 14px" }}>AI Agent Teams</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
            {[
              { k: "market", icon: "🔍", t: "MARKET INTEL", d: "Competitors + pricing", c: P.blue, fn: () => runA("market", "Market research for pottery tools on Amazon. Short paragraphs, no markdown.", "Analyze Amazon market for pottery rib tools. " + nB + "-piece nesting set, " + p.name + ". Cover: competitors, keywords, price sweet spot, market gap.", true) },
              { k: "listing", icon: "📝", t: "LISTING GEN", d: "Amazon listing copy", c: P.accent, fn: () => runA("listing", "Amazon copywriter for pottery tools. No markdown.", "Full Amazon listing: " + nB + "-piece nesting rib set. " + p.name + ". Sizes: " + bowls.map(b => b.rim.toFixed(0) + "mm").join(", ") + ". Include TITLE, 5 BULLETS, DESCRIPTION, BACKEND KEYWORDS.") },
              { k: "social", icon: "📱", t: "CONTENT", d: "30-day TikTok plan", c: P.accent, fn: () => runA("social", "Social media for pottery niche. No markdown.", "30-day TikTok/IG plan for nesting bowl rib set. SLC pottery workshop.") },
              { k: "launch", icon: "🚀", t: "LAUNCH", d: "90-day roadmap", c: P.inner, fn: () => runA("launch", "Amazon launch strategist. No markdown.", "90-day plan to $1K for " + nB + "-piece rib set at $" + price + ". SLC, woodworking tools + 3D print. $500 budget.") },
              { k: "vendor", icon: "📧", t: "VENDOR AUTO", d: "PO email automation", c: P.purple, fn: () => runA("vendor", "Ops automation expert. No markdown.", "Vendor management for pottery rib business. Auto PO emails, fulfillment routing. Use Xometry, Hubs, JLC3DP, Shapeways. Material: Formlabs Rigid 4000 SLA resin.") },
              { k: "feedback", icon: "🔄", t: "REVIEW→DESIGN", d: "Reviews → design updates", c: P.accent, fn: () => runA("feedback", "Product design engineer. No markdown.", "Review-to-design loop for pottery ribs. Parse reviews, map to params (wall=" + wallT + "mm, floor=" + floorT + "mm, foot_h=" + footH + "mm, foot_r=" + footOR + "mm, edge_angle=" + edgeAngle + "°, rib_thick=" + ribThick + "mm, rim_type=" + rimType + "). Scoring system.") },
            ].map(a => <button key={a.k} onClick={a.fn} style={{ background: P.card, border: `1px solid ${ag[a.k].s === "done" ? a.c + "55" : P.cardBorder}`, borderRadius: 8, padding: "12px", cursor: "pointer", textAlign: "left", position: "relative", overflow: "hidden" }}>
              {ag[a.k].s === "done" && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: a.c }} />}
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}><span style={{ fontSize: 14 }}>{a.icon}</span><span style={{ fontFamily: mono, fontSize: 10, fontWeight: 700, color: P.text }}>{a.t}</span></div>
              <div style={{ fontFamily: mono, fontSize: 9, color: P.textFaint }}>{a.d}</div>
              {ag[a.k].s === "loading" && <div style={{ fontFamily: mono, fontSize: 8, color: a.c, marginTop: 4 }}>● RUNNING...</div>}
              {ag[a.k].s === "done" && <div style={{ fontFamily: mono, fontSize: 8, color: a.c, marginTop: 4 }}>✓ DONE</div>}
            </button>)}
          </div>
          {Object.entries(ag).filter(([, v]) => v.r).map(([k, v]) => {
            const t = { market: "🔍 MARKET INTEL", listing: "📝 LISTING", social: "📱 CONTENT", launch: "🚀 LAUNCH", vendor: "📧 VENDOR", feedback: "🔄 FEEDBACK" };
            const cc = { market: P.blue, listing: P.accent, social: P.accent, launch: P.inner, vendor: P.purple, feedback: P.accent };
            return <Card key={k} title={t[k]} color={cc[k]} glow><div style={{ fontSize: 11, color: P.textMuted, fontFamily: mono, lineHeight: 1.8, whiteSpace: "pre-wrap", maxHeight: 350, overflowY: "auto" }}>{v.r}</div></Card>;
          })}
        </div>)}

        {/* ═══ MONEY ═══ */}
        {tab === "money" && (<div>
          <h2 style={{ fontFamily: serif, fontSize: 22, fontWeight: 600, color: P.text, margin: "0 0 14px" }}>Unit Economics</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <Card title="INPUTS">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 10 }}>
                {Object.entries(mfgD).map(([k, v]) => <button key={k} onClick={() => setMfg(k)} style={{ padding: "6px", background: mfg === k ? P.cardBorder : "transparent", border: mfg === k ? `1px solid ${P.accent}` : `1px solid ${P.cardBorder}`, borderRadius: 5, cursor: "pointer" }}>
                  <div style={{ fontFamily: mono, fontSize: 9, color: mfg === k ? P.accent : P.textMuted, fontWeight: 600 }}>{v.l}</div>
                  <div style={{ fontFamily: mono, fontSize: 9, color: P.textFaint }}>${v.pu.toFixed(2)}/set</div>
                </button>)}
              </div>
              <Sl imperial={imperial} l="Price" v={price} fn={setPrice} mn={12} mx={55} u="$" />
            </Card>
            <Card title="MARGINS">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                <Stat l="COGS" v={`$${cogs.toFixed(2)}`} c={cogs > price * 0.4 ? P.accent : P.inner} />
                <Stat l="Amazon+FBA" v={`$${(price * 0.15 + 5.50).toFixed(2)}`} c={P.accent} />
                <Stat l="MARGIN" v={`$${margin.toFixed(2)}`} c={margin > 0 ? P.inner : P.accent} />
                <Stat l="Margin %" v={`${(margin / price * 100).toFixed(0)}%`} c={margin / price > 0.25 ? P.inner : P.accent} />
                <Stat l="Units to $1K" v={Math.ceil(1000 / price)} c={P.blue} />
                <Stat l="Profit @ $1K" v={`$${(Math.ceil(1000 / price) * margin).toFixed(0)}`} c={Math.ceil(1000 / price) * margin > 0 ? P.inner : P.accent} />
              </div>
            </Card>
          </div>
          <div style={{ marginTop: 10 }}>
            <Card title="BREAKEVEN ANALYSIS" color={P.inner}>
              <BreakevenChart price={price} cogs={cogs} setupCost={mfgD[mfg].su} />
            </Card>
          </div>
        </div>)}
      </div>
    </div>
  );
}
