import { describe, it, expect } from "vitest";
import { PROFILES, nest, generateRibPolygon, generateRibSVG, generateTemplateSVG, generateRibDXF, generateProfileJSON } from "./geometry.js";

const profileKeys = Object.keys(PROFILES);
const ribGaps = [30, 50.8, 70];
const bowlCounts = [2, 3, 4];

// ═══════════════════════════════════════════════════════════
// generateRibPolygon — constrained polygon geometry
// ═══════════════════════════════════════════════════════════
describe("generateRibPolygon", () => {
  it.each(profileKeys)("%s — returns valid polygon", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 3, 3);
    const poly = generateRibPolygon(bowls[0], p, 50.8);
    expect(poly.points.length).toBeGreaterThan(10);
    expect(poly.hole).toBeDefined();
    expect(poly.hole.r).toBeGreaterThan(0);
    expect(poly.gap).toBe(50.8);
    expect(poly.totalH).toBeGreaterThan(0);
    expect(poly.width).toBeGreaterThan(0);
    expect(poly.height).toBeGreaterThan(0);
  });

  it.each(profileKeys)("%s — no NaN or Infinity in points", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    bowls.forEach(b => {
      const poly = generateRibPolygon(b, p, 50.8);
      poly.points.forEach(([x, y]) => {
        expect(Number.isFinite(x)).toBe(true);
        expect(Number.isFinite(y)).toBe(true);
      });
      expect(Number.isFinite(poly.hole.cx)).toBe(true);
      expect(Number.isFinite(poly.hole.cy)).toBe(true);
    });
  });

  it.each(profileKeys)("%s — bottom edge is at y=0 (flat base)", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const poly = generateRibPolygon(bowls[0], p, 50.8);
    const minY = Math.min(...poly.points.map(([, y]) => y));
    expect(minY).toBeCloseTo(0, 1);
  });

  it.each(profileKeys)("%s — gap parameter controls width at base", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const poly30 = generateRibPolygon(bowls[0], p, 30);
    const poly70 = generateRibPolygon(bowls[0], p, 70);
    expect(poly70.width).toBeGreaterThan(poly30.width);
  });
});

// ═══════════════════════════════════════════════════════════
// generateRibSVG — laser cutting rib export
// ═══════════════════════════════════════════════════════════
describe("generateRibSVG", () => {
  it.each(profileKeys)("%s — produces valid SVG", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 3, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    expect(svg).toContain("<?xml version");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("xmlns");
  });

  it.each(profileKeys)("%s — has UTF-8 encoding in XML declaration", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    expect(svg).toContain('encoding="UTF-8"');
  });

  it.each(profileKeys)("%s — has SVG version 1.1", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    expect(svg).toContain('version="1.1"');
  });

  it.each(profileKeys)("%s — cut lines use red #FF0000 stroke", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    expect(svg).toContain('stroke="#FF0000"');
  });

  it.each(profileKeys)("%s — cut lines use hairline 0.01 stroke-width", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    expect(svg).toContain('stroke-width="0.01"');
  });

  it.each(profileKeys)("%s — has separate cut and engrave layers", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    expect(svg).toContain('id="cut"');
    expect(svg).toContain('id="engrave"');
  });

  it.each(profileKeys)("%s — engrave layer uses black fill", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    expect(svg).toContain('fill="#000000"');
  });

  it.each(profileKeys)("%s — cut layer has path elements (polygon outlines)", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    const cutLayer = svg.split('id="cut"')[1].split("</g>")[0];
    expect(cutLayer).toContain("<path");
  });

  it.each(profileKeys)("%s — cut layer has circle elements (hanging holes)", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    const cutLayer = svg.split('id="cut"')[1].split("</g>")[0];
    expect(cutLayer).toContain("<circle");
  });

  it.each(profileKeys)("%s — contains profile name in header", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 3, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    expect(svg).toContain(p.name);
  });

  it.each(profileKeys)("%s — has one rib label per bowl (combined)", (k) => {
    const p = PROFILES[k];
    const nBowls = 3;
    const bowls = nest(p, nBowls, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    for (let i = 1; i <= bowls.length; i++) {
      expect(svg).toContain(`B${i}`);
    }
  });

  it.each(profileKeys)("%s — viewBox and dimensions are in mm", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    expect(svg).toMatch(/width="\d+(\.\d+)?mm"/);
    expect(svg).toMatch(/height="\d+(\.\d+)?mm"/);
  });

  it.each(profileKeys)("%s — gap value appears in SVG text", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 50.8);
    expect(svg).toContain("50.8");
  });

  // Matrix: every profile × bowl count × gap
  describe("full matrix — no crashes, laser-valid", () => {
    for (const k of profileKeys) {
      for (const nB of bowlCounts) {
        for (const gap of ribGaps) {
          it(`${k} · ${nB} bowls · ${gap}mm gap`, () => {
            const p = PROFILES[k];
            const bowls = nest(p, nB, 3);
            expect(bowls.length).toBeGreaterThan(0);
            const svg = generateRibSVG(bowls, p, gap);
            expect(svg).toContain("<svg");
            expect(svg).toContain("</svg>");
            expect(svg).not.toContain("NaN");
            expect(svg).not.toContain("Infinity");
            expect(svg).toContain('encoding="UTF-8"');
            expect(svg).toContain('version="1.1"');
            expect(svg).toContain("#FF0000");
            expect(svg).toContain('stroke-width="0.01"');
          });
        }
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════
// generateRibDXF — DXF laser cutting export
// ═══════════════════════════════════════════════════════════
describe("generateRibDXF", () => {
  it.each(profileKeys)("%s — produces valid DXF structure", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 3, 3);
    const dxf = generateRibDXF(bowls, p, 50.8);
    expect(dxf).toContain("SECTION");
    expect(dxf).toContain("HEADER");
    expect(dxf).toContain("TABLES");
    expect(dxf).toContain("ENTITIES");
    expect(dxf).toContain("EOF");
    expect(dxf).toContain("ENDSEC");
  });

  it.each(profileKeys)("%s — contains LWPOLYLINE entities (rib outlines)", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const dxf = generateRibDXF(bowls, p, 50.8);
    expect(dxf).toContain("LWPOLYLINE");
  });

  it.each(profileKeys)("%s — contains CIRCLE entities (hanging holes)", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const dxf = generateRibDXF(bowls, p, 50.8);
    expect(dxf).toContain("CIRCLE");
  });

  it.each(profileKeys)("%s — contains CUT and ENGRAVE layers", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const dxf = generateRibDXF(bowls, p, 50.8);
    expect(dxf).toContain("CUT");
    expect(dxf).toContain("ENGRAVE");
  });

  it.each(profileKeys)("%s — units set to millimeters (INSUNITS=4)", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const dxf = generateRibDXF(bowls, p, 50.8);
    expect(dxf).toContain("$INSUNITS");
  });

  it.each(profileKeys)("%s — no NaN or Infinity in coordinates", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 3, 3);
    const dxf = generateRibDXF(bowls, p, 50.8);
    expect(dxf).not.toContain("NaN");
    expect(dxf).not.toContain("Infinity");
  });

  // Matrix: every profile × bowl count × gap
  describe("full matrix — no crashes", () => {
    for (const k of profileKeys) {
      for (const nB of bowlCounts) {
        for (const gap of ribGaps) {
          it(`${k} · ${nB} bowls · ${gap}mm gap`, () => {
            const p = PROFILES[k];
            const bowls = nest(p, nB, 3);
            expect(bowls.length).toBeGreaterThan(0);
            const dxf = generateRibDXF(bowls, p, gap);
            expect(dxf).toContain("HEADER");
            expect(dxf).toContain("EOF");
            expect(dxf).not.toContain("NaN");
            expect(dxf).not.toContain("Infinity");
          });
        }
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════
// generateTemplateSVG — hand cut template export
// ═══════════════════════════════════════════════════════════
describe("generateTemplateSVG", () => {
  it.each(profileKeys)("%s — produces valid SVG", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 3, 3);
    const svg = generateTemplateSVG(bowls, p, 50.8);
    expect(svg).toContain("<?xml version");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it.each(profileKeys)("%s — has UTF-8 encoding", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 50.8);
    expect(svg).toContain('encoding="UTF-8"');
  });

  it.each(profileKeys)("%s — has SVG version 1.1", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 50.8);
    expect(svg).toContain('version="1.1"');
  });

  it.each(profileKeys)("%s — A4 landscape dimensions (297×210mm)", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 50.8);
    expect(svg).toContain('width="297mm"');
    expect(svg).toContain('height="210mm"');
  });

  it.each(profileKeys)("%s — contains print-at-100%% instruction", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 50.8);
    expect(svg).toContain("PRINT AT 100%");
  });

  it.each(profileKeys)("%s — contains profile name", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 50.8);
    expect(svg).toContain(p.name);
  });

  it.each(profileKeys)("%s — has crop marks (corner registration)", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 50.8);
    const lineCount = (svg.match(/<line /g) || []).length;
    expect(lineCount).toBeGreaterThanOrEqual(8);
  });

  it.each(profileKeys)("%s — has calibration ruler", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 50.8);
    expect(svg).toContain("0mm");
  });

  it.each(profileKeys)("%s — has flat base label", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 50.8);
    expect(svg).toContain("flat base");
  });

  // Matrix: every profile × bowl count × gap
  describe("full matrix — no crashes, no NaN", () => {
    for (const k of profileKeys) {
      for (const nB of bowlCounts) {
        for (const gap of ribGaps) {
          it(`${k} · ${nB} bowls · ${gap}mm gap`, () => {
            const p = PROFILES[k];
            const bowls = nest(p, nB, 3);
            const svg = generateTemplateSVG(bowls, p, gap);
            expect(svg).toContain("<svg");
            expect(svg).toContain("</svg>");
            expect(svg).not.toContain("NaN");
            expect(svg).not.toContain("Infinity");
            expect(svg).toContain('encoding="UTF-8"');
            expect(svg).toContain('version="1.1"');
          });
        }
      }
    }
  });
});

// ═══════════════════════════════════════════════════════════
// generateProfileJSON — profile export
// ═══════════════════════════════════════════════════════════
describe("generateProfileJSON", () => {
  it.each(profileKeys)("%s — produces valid JSON", (k) => {
    const p = PROFILES[k];
    const json = generateProfileJSON(p, p.name);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it.each(profileKeys)("%s — contains all required fields", (k) => {
    const p = PROFILES[k];
    const json = generateProfileJSON(p, p.name);
    const data = JSON.parse(json);
    expect(data.throwform).toBe("1.0");
    expect(data.name).toBe(p.name);
    expect(data.rimDiameter).toBe(p.rimDiameter);
    expect(data.wallThickness).toBe(p.wallThickness);
    expect(data.interiorDepth).toBe(p.interiorDepth);
    expect(data.floor).toEqual(p.floor);
    expect(data.foot).toEqual(p.foot);
    expect(data.rimLip).toEqual(p.rimLip);
    expect(data.outer).toEqual(p.outer);
  });

  it.each(profileKeys)("%s — roundtrips: parse(generate(p)) matches original", (k) => {
    const p = PROFILES[k];
    const json = generateProfileJSON(p, p.name);
    const data = JSON.parse(json);
    const json2 = generateProfileJSON(data, data.name);
    expect(json2).toBe(json);
  });

  it("uses fallback name when none provided", () => {
    const p = PROFILES["fargklar-real"];
    const json = generateProfileJSON(p);
    const data = JSON.parse(json);
    expect(data.name).toBe(p.name);
  });

  it("overrides name when provided", () => {
    const p = PROFILES["fargklar-real"];
    const json = generateProfileJSON(p, "My Custom Bowl");
    const data = JSON.parse(json);
    expect(data.name).toBe("My Custom Bowl");
  });
});
