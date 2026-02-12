import { describe, it, expect } from "vitest";
import { PROFILES, nest, generateRibSVG, generateTemplateSVG, generateProfileJSON } from "./geometry.js";

const profileKeys = Object.keys(PROFILES);
const edgeAngles = [30, 45, 60];
const ribThicks = [6, 10];
const bowlCounts = [2, 3, 4];

// ═══════════════════════════════════════════════════════════
// generateRibSVG — CNC/3D print rib export
// ═══════════════════════════════════════════════════════════
describe("generateRibSVG", () => {
  it.each(profileKeys)("%s — produces valid SVG", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 3, 3);
    const svg = generateRibSVG(bowls, p, 45, 8);
    expect(svg).toContain("<?xml version");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("xmlns");
  });

  it.each(profileKeys)("%s — contains profile name in header", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 3, 3);
    const svg = generateRibSVG(bowls, p, 45, 8);
    expect(svg).toContain(p.name);
  });

  it.each(profileKeys)("%s — has inner+outer rib for each bowl", (k) => {
    const p = PROFILES[k];
    const nBowls = 3;
    const bowls = nest(p, nBowls, 3);
    const svg = generateRibSVG(bowls, p, 45, 8);
    for (let i = 1; i <= bowls.length; i++) {
      expect(svg).toContain(`B${i}-Inner`);
      expect(svg).toContain(`B${i}-Outer`);
    }
  });

  it.each(profileKeys)("%s — contains polygon and path elements", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 45, 8);
    expect(svg).toContain("<polygon");
    expect(svg).toContain("<path");
  });

  it.each(profileKeys)("%s — viewBox and dimensions are in mm", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 45, 8);
    expect(svg).toMatch(/width="\d+(\.\d+)?mm"/);
    expect(svg).toMatch(/height="\d+(\.\d+)?mm"/);
  });

  it.each(profileKeys)("%s — edge angle appears in SVG text", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateRibSVG(bowls, p, 30, 8);
    expect(svg).toContain("30°");
  });

  // Matrix: every profile × bowl count × edge angle × rib thickness
  describe("full matrix — no crashes", () => {
    for (const k of profileKeys) {
      for (const nB of bowlCounts) {
        for (const angle of edgeAngles) {
          for (const thick of ribThicks) {
            it(`${k} · ${nB} bowls · ${angle}° · ${thick}mm`, () => {
              const p = PROFILES[k];
              const bowls = nest(p, nB, 3);
              expect(bowls.length).toBeGreaterThan(0);
              const svg = generateRibSVG(bowls, p, angle, thick);
              expect(svg).toContain("<svg");
              expect(svg).toContain("</svg>");
              // Check polygon points aren't NaN or Infinity
              expect(svg).not.toContain("NaN");
              expect(svg).not.toContain("Infinity");
            });
          }
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
    const svg = generateTemplateSVG(bowls, p, 45, 8);
    expect(svg).toContain("<?xml version");
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
  });

  it.each(profileKeys)("%s — A4 landscape dimensions (297×210mm)", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 45, 8);
    expect(svg).toContain('width="297mm"');
    expect(svg).toContain('height="210mm"');
  });

  it.each(profileKeys)("%s — contains print-at-100%% instruction", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 45, 8);
    expect(svg).toContain("PRINT AT 100%");
  });

  it.each(profileKeys)("%s — contains profile name", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 45, 8);
    expect(svg).toContain(p.name);
  });

  it.each(profileKeys)("%s — has crop marks (corner registration)", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 45, 8);
    // Should have multiple crop mark lines
    const lineCount = (svg.match(/<line /g) || []).length;
    expect(lineCount).toBeGreaterThanOrEqual(8); // 4 corners × 2 lines each
  });

  it.each(profileKeys)("%s — has calibration ruler", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 45, 8);
    expect(svg).toContain("0mm");
  });

  it.each(profileKeys)("%s — has inner+outer labels", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 45, 8);
    expect(svg).toContain("Inner");
    expect(svg).toContain("Outer");
  });

  it.each(profileKeys)("%s — has working edge markers", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 45, 8);
    expect(svg).toContain("working edge");
  });

  it.each(profileKeys)("%s — has flat base label", (k) => {
    const p = PROFILES[k];
    const bowls = nest(p, 2, 3);
    const svg = generateTemplateSVG(bowls, p, 45, 8);
    expect(svg).toContain("flat base");
  });

  // Matrix: every profile × bowl count × edge angle
  describe("full matrix — no crashes, no NaN", () => {
    for (const k of profileKeys) {
      for (const nB of bowlCounts) {
        for (const angle of edgeAngles) {
          for (const thick of ribThicks) {
            it(`${k} · ${nB} bowls · ${angle}° · ${thick}mm`, () => {
              const p = PROFILES[k];
              const bowls = nest(p, nB, 3);
              const svg = generateTemplateSVG(bowls, p, angle, thick);
              expect(svg).toContain("<svg");
              expect(svg).toContain("</svg>");
              expect(svg).not.toContain("NaN");
              expect(svg).not.toContain("Infinity");
            });
          }
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
    // Re-generate from parsed data should be identical
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
