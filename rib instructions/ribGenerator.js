/**
 * ribGenerator.js
 *
 * Generates combined pottery rib-tool profiles from inner + outer wall SVG curves.
 *
 * Coordinate conventions:
 *   INPUT SVG  — y = 0 at rim, y increases downward toward base.
 *                x = radius from pot center axis (mm).
 *   RIB OUTPUT — y = 0 at bottom (wheel / flat edge), y increases upward.
 *                x = 0 at inner-profile base, increases rightward.
 *
 * Rib anatomy (clockwise polygon):
 *   bottom-left  → left edge  (inner profile, mirrored, base→rim)
 *   top-left     → top edge   (straight line to outer rim)
 *   top-right    → right edge (outer profile, rim→base)
 *   bottom-right → bottom edge (straight flat line, closes polygon)
 *
 * All measurements are in millimeters internally.
 * 1 inch = 25.4 mm
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const MM_PER_INCH = 25.4;
const DEFAULT_MIN_GAP_MM = 2 * MM_PER_INCH; // 2 inches = 50.8 mm

// ─── Parsing ─────────────────────────────────────────────────────────────────

/**
 * Parse an SVG polygon `points` attribute into an array of {x, y}.
 */
export function parsePolygonPoints(pointsStr) {
  return pointsStr
    .trim()
    .split(/\s+/)
    .map((pair) => {
      const [x, y] = pair.split(",").map(Number);
      return { x, y };
    });
}

/**
 * Extract the wall-profile curve from a single-rib polygon.
 *
 * Expected polygon vertex order:
 *   [0] (0, maxY)        — bottom-left
 *   [1] (0, 0)           — top-left
 *   [2] (xRim, 0)        — start of profile curve (rim)
 *   [3…N-2]              — profile curve points (rim → base)
 *   [N-1] (xBase, maxY)  — bottom-right (straight extension below curve)
 *
 * Returns the curve points [2 … N-2], ordered rim → base (top → bottom).
 */
export function extractProfileCurve(polygonPoints) {
  return polygonPoints.slice(2, -1);
}

/**
 * De-duplicate consecutive points that are within `epsilon` of each other.
 * The source SVG sometimes emits a doubled point at the curve's base.
 */
function dedup(points, epsilon = 0.001) {
  if (points.length === 0) return points;
  const out = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const prev = out[out.length - 1];
    if (
      Math.abs(points[i].x - prev.x) > epsilon ||
      Math.abs(points[i].y - prev.y) > epsilon
    ) {
      out.push(points[i]);
    }
  }
  return out;
}

/**
 * Parse a full SVG document (as emitted by the curve-editor tool) and return
 * an array of profile pairs:
 *
 *   [{ label, innerLabel, outerLabel, inner: [{x,y}], outer: [{x,y}] }, …]
 *
 * Works in both browser (DOMParser) and Node (requires 'jsdom' or similar).
 */
export function parseProfileSVG(svgText) {
  let doc;
  if (typeof DOMParser !== "undefined") {
    doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  } else {
    // Node.js fallback — caller must polyfill or use jsdom
    throw new Error(
      "DOMParser not available. Provide a polyfill (e.g. jsdom) for Node usage."
    );
  }

  // Label texts live inside <g id="engrave">; skip the first one (sheet title).
  const allTexts = Array.from(doc.querySelectorAll("#engrave text"));
  const labelTexts = allTexts.filter(
    (t) => t.textContent.includes("Inner") || t.textContent.includes("Outer")
  );

  // Cut polygons, in document order, alternate inner/outer.
  const polygons = Array.from(doc.querySelectorAll("#cut polygon"));

  const pairs = [];
  for (let i = 0; i < polygons.length; i += 2) {
    const innerLabel = labelTexts[i]?.textContent ?? `P${i / 2 + 1}-Inner`;
    const outerLabel =
      labelTexts[i + 1]?.textContent ?? `P${i / 2 + 1}-Outer`;

    // Derive a short base name like "B1" from "B1-Inner-165mm"
    const baseLabel = innerLabel.split("-")[0];

    const innerPts = parsePolygonPoints(
      polygons[i].getAttribute("points")
    );
    const outerPts = parsePolygonPoints(
      polygons[i + 1].getAttribute("points")
    );

    pairs.push({
      label: baseLabel,
      innerLabel,
      outerLabel,
      inner: dedup(extractProfileCurve(innerPts)),
      outer: dedup(extractProfileCurve(outerPts)),
      innerBottomY: innerPts[0].y,
      outerBottomY: outerPts[0].y,
    });
  }

  return pairs;
}

// ─── Rib geometry ────────────────────────────────────────────────────────────

/**
 * Combine an inner and outer profile curve into a single closed rib polygon.
 *
 * @param {Array<{x:number,y:number}>} innerCurve
 *   Inner wall profile, rim → base, SVG coords (y-down).
 * @param {Array<{x:number,y:number}>} outerCurve
 *   Outer wall profile, rim → base, SVG coords (y-down).
 * @param {object} [opts]
 * @param {number} [opts.minGapMm=50.8]  Minimum bottom gap between profiles (mm).
 * @returns {Array<{x:number,y:number}>}  Closed polygon in rib coords (y-up, mm).
 */
export function generateRibPolygon(
  innerCurve,
  outerCurve,
  { minGapMm = DEFAULT_MIN_GAP_MM, innerBottomY, outerBottomY } = {}
) {
  // ── 1. Determine base (bottom) values ──────────────────────────────────
  //
  //    Each profile's base is its deepest point (max y in SVG coords).
  //    Each profile is flipped using its OWN base y so that:
  //      • both bases land at rib y = 0  (the wheel / flat bottom)
  //      • each rim sits at rib y = its own height
  //    This means if the profiles are different heights the top line
  //    will be angled — which is the intended behaviour.
  //
  //    When innerBottomY / outerBottomY are provided (the polygon's
  //    bottom-left vertex y, i.e. the wheel surface), they are used
  //    instead of the curve's last point y. This preserves the step
  //    between where the wall curve ends and the actual wheel surface.

  const innerBase = innerCurve[innerCurve.length - 1]; // deepest point
  const outerBase = outerCurve[outerCurve.length - 1];

  const innerHeight = innerBottomY ?? innerBase.y;
  const outerHeight = outerBottomY ?? outerBase.y;

  // ── 2. Compute horizontal gap ──────────────────────────────────────────

  const naturalGap = Math.abs(outerBase.x - innerBase.x);
  const gap = Math.max(minGapMm, naturalGap);

  // ── 3. Transform inner profile → left edge of rib ─────────────────────
  //    • Mirror x so curve faces right (toward rib center).
  //    • Flip y using innerHeight so base = 0, rim = innerHeight.
  //    • Reverse order so points run base → rim (bottom → top).

  const innerRib = innerCurve
    .slice()
    .reverse()
    .map((p) => ({
      x: -(p.x - innerBase.x), // base at x = 0, rim extends left (negative)
      y: innerHeight - p.y, //     base at y = 0, rim at y = innerHeight
    }));

  // ── 4. Transform outer profile → right edge of rib ────────────────────
  //    • Shift x so base sits at x = gap.
  //    • Flip y using outerHeight so base = 0, rim = outerHeight.
  //    • Keep rim → base order (top → bottom) for clockwise winding.

  const outerRib = outerCurve.map((p) => ({
    x: gap + (p.x - outerBase.x), // base at x = gap, rim extends right
    y: outerHeight - p.y, //          base at y = 0, rim at y = outerHeight
  }));

  // ── 5. Assemble closed polygon (clockwise) ────────────────────────────
  //
  //   innerRib : bottom-left (0,0) → … → top-left  (inner rim)
  //   outerRib : top-right (outer rim) → … → bottom-right (gap, 0)
  //
  //   The top edge (straight line) and bottom edge (flat line) are the
  //   implicit segments that close consecutive vertices.

  return [...innerRib, ...outerRib];
}

/**
 * Convenience: compute bounding box of a point array.
 */
function bbox(points) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

// ─── SVG output ──────────────────────────────────────────────────────────────

/**
 * Generate a 1:1 mm SVG string containing one or more combined rib outlines.
 *
 * @param {Array} profilePairs  Output of parseProfileSVG().
 * @param {object} [opts]
 * @param {number} [opts.minGapMm]   Passed through to generateRibPolygon.
 * @param {number} [opts.padding=10] Margin around content (mm).
 * @param {number} [opts.spacing=15] Gap between adjacent ribs (mm).
 * @returns {string} Complete SVG document.
 */
export function generateRibSVG(
  profilePairs,
  { minGapMm = DEFAULT_MIN_GAP_MM, padding = 10, spacing = 15 } = {}
) {
  // Build each rib polygon and compute its bounds.
  const ribs = profilePairs.map((pair) => {
    const polygon = generateRibPolygon(pair.inner, pair.outer, {
      minGapMm,
      innerBottomY: pair.innerBottomY,
      outerBottomY: pair.outerBottomY,
    });
    return { label: pair.label, polygon, ...bbox(polygon) };
  });

  // ── Layout ribs in a horizontal row ────────────────────────────────────
  let cursorX = padding;
  const positioned = ribs.map((rib) => {
    const offsetX = cursorX - rib.minX;
    cursorX += rib.width + spacing;
    return { ...rib, offsetX };
  });

  const totalWidth = cursorX - spacing + padding;
  const maxHeight =
    Math.max(...ribs.map((r) => r.height)) + padding * 2 + 10; // +10 for label

  // ── Build SVG ──────────────────────────────────────────────────────────
  const lines = [];
  lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  lines.push(
    `<svg xmlns="http://www.w3.org/2000/svg" version="1.1"` +
      ` viewBox="0 0 ${totalWidth.toFixed(2)} ${maxHeight.toFixed(2)}"` +
      ` width="${totalWidth.toFixed(2)}mm" height="${maxHeight.toFixed(2)}mm">`
  );

  // Engrave layer — labels
  lines.push(`<g id="engrave" stroke="none" fill="#000000">`);
  lines.push(
    `  <text x="${padding}" y="${padding}" font-family="monospace" font-size="8">` +
      `✎ Combined Rib Profiles — 1:1 mm</text>`
  );
  for (const rib of positioned) {
    const cx = rib.offsetX + rib.minX + rib.width / 2;
    lines.push(
      `  <text x="${cx.toFixed(2)}" y="${padding + 8}"` +
        ` text-anchor="middle" font-family="monospace" font-size="6">` +
        `${rib.label}-Rib</text>`
    );
  }
  lines.push(`</g>`);

  // Cut layer — rib outlines
  lines.push(`<g id="cut" fill="none" stroke="#FF0000" stroke-width="0.01">`);

  const yFloor = maxHeight - padding; // SVG-y of the rib's flat bottom

  for (const rib of positioned) {
    const pts = rib.polygon
      .map((p) => {
        const sx = (p.x + rib.offsetX).toFixed(2);
        const sy = (yFloor - p.y).toFixed(2); // flip y for SVG
        return `${sx},${sy}`;
      })
      .join(" ");
    lines.push(`  <polygon points="${pts}"/>`);
  }
  lines.push(`</g>`);

  lines.push(`</svg>`);
  return lines.join("\n");
}

// ─── DXF output ──────────────────────────────────────────────────────────────

/**
 * Generate a minimal DXF (R2000) string with LWPOLYLINE entities for each rib.
 *
 * @param {Array} profilePairs  Output of parseProfileSVG().
 * @param {object} [opts]
 * @param {number} [opts.minGapMm]   Passed through to generateRibPolygon.
 * @param {number} [opts.spacing=15] Gap between adjacent ribs (mm).
 * @returns {string} DXF file content.
 */
export function generateRibDXF(
  profilePairs,
  { minGapMm = DEFAULT_MIN_GAP_MM, spacing = 15 } = {}
) {
  const ribs = profilePairs.map((pair) => {
    const polygon = generateRibPolygon(pair.inner, pair.outer, {
      minGapMm,
      innerBottomY: pair.innerBottomY,
      outerBottomY: pair.outerBottomY,
    });
    return { label: pair.label, polygon, ...bbox(polygon) };
  });

  const dxf = [];

  // ── Header ─────────────────────────────────────────────────────────────
  dxf.push("0", "SECTION", "2", "HEADER");
  dxf.push("9", "$ACADVER", "1", "AC1015"); // AutoCAD 2000
  dxf.push("9", "$INSUNITS", "70", "4"); // 4 = millimeters
  dxf.push("9", "$MEASUREMENT", "70", "1"); // metric
  dxf.push("0", "ENDSEC");

  // ── Tables (minimal — needed for valid DXF) ────────────────────────────
  dxf.push("0", "SECTION", "2", "TABLES");
  // Layer table
  dxf.push("0", "TABLE", "2", "LAYER", "70", "2");
  // Layer: CUT
  dxf.push("0", "LAYER", "2", "CUT", "70", "0", "62", "1", "6", "CONTINUOUS");
  // Layer: ENGRAVE
  dxf.push(
    "0",
    "LAYER",
    "2",
    "ENGRAVE",
    "70",
    "0",
    "62",
    "7",
    "6",
    "CONTINUOUS"
  );
  dxf.push("0", "ENDTAB");
  dxf.push("0", "ENDSEC");

  // ── Entities ───────────────────────────────────────────────────────────
  dxf.push("0", "SECTION", "2", "ENTITIES");

  let offsetX = 0;

  for (const rib of ribs) {
    const shiftX = offsetX - rib.minX;

    // LWPOLYLINE for the rib outline
    dxf.push("0", "LWPOLYLINE");
    dxf.push("8", "CUT"); // layer
    dxf.push("90", String(rib.polygon.length)); // vertex count
    dxf.push("70", "1"); // closed polyline

    for (const p of rib.polygon) {
      dxf.push("10", (p.x + shiftX).toFixed(4)); // X
      dxf.push("20", p.y.toFixed(4)); // Y
    }

    // TEXT label
    const cx = rib.width / 2 + offsetX;
    const cy = rib.height + 5;
    dxf.push("0", "TEXT");
    dxf.push("8", "ENGRAVE");
    dxf.push("10", cx.toFixed(4)); // X
    dxf.push("20", cy.toFixed(4)); // Y
    dxf.push("40", "4"); // text height
    dxf.push("1", `${rib.label}-Rib`); // text value

    offsetX += rib.width + spacing;
  }

  dxf.push("0", "ENDSEC");
  dxf.push("0", "EOF");

  return dxf.join("\n");
}

// ─── Download helper (browser only) ──────────────────────────────────────────

/**
 * Trigger a file download in the browser.
 */
export function downloadBlob(content, filename, mimeType = "application/octet-stream") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── High-level API ──────────────────────────────────────────────────────────

/**
 * One-call entry point: parse an SVG string, generate combined ribs,
 * and return both SVG and DXF output strings.
 *
 * @param {string} svgText          Raw SVG from the curve-editor export.
 * @param {object} [opts]
 * @param {number} [opts.minGapInches=2]  Minimum bottom gap in inches.
 * @param {number} [opts.padding=10]      SVG margin (mm).
 * @param {number} [opts.spacing=15]      Gap between ribs in output (mm).
 * @returns {{ pairs: Array, svg: string, dxf: string }}
 */
export function generateRibs(svgText, opts = {}) {
  const {
    minGapInches = 2,
    padding = 10,
    spacing = 15,
  } = opts;

  const minGapMm = minGapInches * MM_PER_INCH;
  const pairs = parseProfileSVG(svgText);

  const svg = generateRibSVG(pairs, { minGapMm, padding, spacing });
  const dxf = generateRibDXF(pairs, { minGapMm, spacing });

  return { pairs, svg, dxf };
}

/**
 * Download generated rib files.
 *
 * @param {string} svgContent  SVG string from generateRibs().
 * @param {string} dxfContent  DXF string from generateRibs().
 * @param {string} [baseName="rib-profiles"]  Filename stem.
 */
export function downloadRibFiles(svgContent, dxfContent, baseName = "rib-profiles") {
  downloadBlob(svgContent, `${baseName}.svg`, "image/svg+xml");
  // Small delay so the browser doesn't swallow the second download
  setTimeout(() => {
    downloadBlob(dxfContent, `${baseName}.dxf`, "application/dxf");
  }, 200);
}
