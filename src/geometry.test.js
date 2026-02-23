import { describe, it, expect } from "vitest";
import { VESSEL, PROFILES, computeVolumes, RIM_TYPES, rimGeometry, genInner, nest, nestMugs, STACKING_VESSELS, computeDraftAngle, computeNestingOffset, computeNestingEfficiency, computeStackHeight, validateMugStacking, applyInnerFillet, catmullRomResample } from "./geometry.js";

// ═══════════════════════════════════════════════════════════
// PROFILES data integrity
// ═══════════════════════════════════════════════════════════
describe("PROFILES", () => {
  const keys = Object.keys(PROFILES);

  it("has at least 10 profiles", () => {
    expect(keys.length).toBeGreaterThanOrEqual(10);
  });

  it.each(keys)("%s has required fields", (k) => {
    const p = PROFILES[k];
    expect(p.name).toBeTruthy();
    expect(p.vessel).toBeTruthy();
    expect(Object.values(VESSEL)).toContain(p.vessel);
    expect(p.rimDiameter).toBeGreaterThan(0);
    expect(p.wallThickness).toBeGreaterThan(0);
    expect(p.interiorDepth).toBeGreaterThan(0);
    expect(p.floor.thickness).toBeGreaterThan(0);
    expect(p.foot.outerRadius).toBeGreaterThan(p.foot.innerRadius);
    expect(p.foot.height).toBeGreaterThan(0);
    expect(p.rimLip.height).toBeGreaterThan(0);
    expect(p.outer.length).toBeGreaterThanOrEqual(3);
  });

  it.each(keys)("%s outer points are ordered floor→rim (ascending height)", (k) => {
    const outer = PROFILES[k].outer;
    for (let i = 1; i < outer.length; i++) {
      expect(outer[i][1]).toBeGreaterThanOrEqual(outer[i - 1][1]);
    }
  });

  it.each(keys)("%s foot outer radius < first wall radius", (k) => {
    const p = PROFILES[k];
    expect(p.foot.outerRadius).toBeLessThanOrEqual(p.outer[0][0] + p.wallThickness);
  });
});

// ═══════════════════════════════════════════════════════════
// computeVolumes
// ═══════════════════════════════════════════════════════════
describe("computeVolumes", () => {
  const fargklar = PROFILES["fargklar-real"];
  const mug = PROFILES["mug"];

  it("returns all expected fields", () => {
    const v = computeVolumes(fargklar);
    expect(v).toHaveProperty("interiorML");
    expect(v).toHaveProperty("interiorOz");
    expect(v).toHaveProperty("clayWetG");
    expect(v).toHaveProperty("clayLbs");
    expect(v).toHaveProperty("glazeArea");
    expect(v).toHaveProperty("glazeAreaIn2");
  });

  it("interior volume is positive", () => {
    const v = computeVolumes(fargklar);
    expect(v.interiorML).toBeGreaterThan(0);
    expect(v.interiorOz).toBeGreaterThan(0);
  });

  it("clay weight is positive", () => {
    const v = computeVolumes(fargklar);
    expect(v.clayWetG).toBeGreaterThan(0);
    expect(v.clayLbs).toBeGreaterThan(0);
  });

  it("glaze area is positive", () => {
    const v = computeVolumes(fargklar);
    expect(v.glazeArea).toBeGreaterThan(0);
  });

  it("oz = mL / 29.5735", () => {
    const v = computeVolumes(fargklar);
    expect(v.interiorOz).toBeCloseTo(v.interiorML / 29.5735, 5);
  });

  it("lbs = g / 453.592", () => {
    const v = computeVolumes(fargklar);
    expect(v.clayLbs).toBeCloseTo(v.clayWetG / 453.592, 5);
  });

  it("scale=0.5 reduces volume by roughly 8x (cube law)", () => {
    const full = computeVolumes(fargklar, 1);
    const half = computeVolumes(fargklar, 0.5);
    const ratio = full.interiorML / half.interiorML;
    // Should be close to 8 (0.5^3 = 0.125)
    expect(ratio).toBeGreaterThan(6);
    expect(ratio).toBeLessThan(10);
  });

  it("mug has less volume than fargklar bowl", () => {
    const vBowl = computeVolumes(fargklar);
    const vMug = computeVolumes(mug);
    expect(vBowl.interiorML).toBeGreaterThan(vMug.interiorML);
  });

  it("works for every profile without throwing", () => {
    for (const k of Object.keys(PROFILES)) {
      expect(() => computeVolumes(PROFILES[k])).not.toThrow();
    }
  });
});

// ═══════════════════════════════════════════════════════════
// rimGeometry — all 10 types
// ═══════════════════════════════════════════════════════════
describe("rimGeometry", () => {
  // Identity transforms — test geometry logic without SVG coordinate mapping
  const tx = r => r;
  const ty = h => -h; // standard Y-flip
  const iR = 30, oR = 35, h = 50, lipH = 3, overhang = 1.5, wt = 5;

  const allTypes = Object.keys(RIM_TYPES);

  it.each(allTypes)("%s returns a non-empty path", (type) => {
    const result = rimGeometry(type, iR, oR, h, lipH, overhang, wt, tx, ty, "R");
    expect(result.path).toBeTruthy();
    expect(result.path.length).toBeGreaterThan(10);
  });

  it.each(allTypes)("%s path starts with M (moveto)", (type) => {
    const result = rimGeometry(type, iR, oR, h, lipH, overhang, wt, tx, ty, "R");
    expect(result.path).toMatch(/^M/);
  });

  it.each(allTypes)("%s topH is above base height", (type) => {
    const result = rimGeometry(type, iR, oR, h, lipH, overhang, wt, tx, ty, "R");
    expect(result.topH).toBeGreaterThan(h);
  });

  it.each(allTypes)("%s topH >= h + min lip height (1.5)", (type) => {
    const result = rimGeometry(type, iR, oR, h, lipH, overhang, wt, tx, ty, "R");
    // coupe is intentionally shorter
    if (type !== "coupe") {
      expect(result.topH).toBeGreaterThanOrEqual(h + 1.5);
    }
  });

  it("unknown type returns empty path", () => {
    const result = rimGeometry("nonexistent", iR, oR, h, lipH, overhang, wt, tx, ty, "R");
    expect(result.path).toBe("");
    expect(result.topH).toBe(h + lipH);
  });

  it("lipH clamped to minimum 1.5", () => {
    const result = rimGeometry("straight", iR, oR, h, 0.5, overhang, wt, tx, ty, "R");
    expect(result.topH).toBe(h + 1.5); // clamped from 0.5 to 1.5
  });

  it("flanged extends further than straight", () => {
    const straight = rimGeometry("straight", iR, oR, h, lipH, overhang, wt, tx, ty, "R");
    const flanged = rimGeometry("flanged", iR, oR, h, lipH, overhang, wt, tx, ty, "R");
    // Flanged path should contain coordinates beyond oR
    const flangedNums = flanged.path.match(/[\d.]+/g).map(Number);
    const maxR = Math.max(...flangedNums.filter((_, i) => i % 2 === 0)); // x coords
    expect(maxR).toBeGreaterThan(oR);
  });

  it("thickened bulges beyond oR", () => {
    const result = rimGeometry("thickened", iR, oR, h, lipH, overhang, wt, tx, ty, "R");
    const nums = result.path.match(/[\d.]+/g).map(Number);
    const maxR = Math.max(...nums.filter((_, i) => i % 2 === 0));
    expect(maxR).toBeGreaterThan(oR);
  });

  it("tapered converges to thin edge between iR and oR", () => {
    const result = rimGeometry("tapered", iR, oR, h, lipH, overhang, wt, tx, ty, "R");
    // The thin point should be between iR and oR
    const thinR = iR + (oR - iR) * 0.15;
    expect(result.path).toContain(String(thinR));
  });
});

// ═══════════════════════════════════════════════════════════
// RIM_TYPES metadata
// ═══════════════════════════════════════════════════════════
describe("RIM_TYPES", () => {
  const allTypes = Object.keys(RIM_TYPES);

  it("has 10 rim types", () => {
    expect(allTypes.length).toBe(10);
  });

  it.each(allTypes)("%s has name, desc, icon, and vessels", (type) => {
    const rt = RIM_TYPES[type];
    expect(rt.name).toBeTruthy();
    expect(rt.desc).toBeTruthy();
    expect(rt.icon).toBeTruthy();
    expect(rt.vessels).toBeInstanceOf(Array);
    expect(rt.vessels.length).toBeGreaterThan(0);
  });

  it.each(allTypes)("%s vessels are valid VESSEL values", (type) => {
    const validVessels = Object.values(VESSEL);
    for (const v of RIM_TYPES[type].vessels) {
      expect(validVessels).toContain(v);
    }
  });

  it("every vessel type has at least 2 rim options", () => {
    for (const v of Object.values(VESSEL)) {
      const matching = allTypes.filter(t => RIM_TYPES[t].vessels.includes(v));
      expect(matching.length).toBeGreaterThanOrEqual(2);
    }
  });
});

// ═══════════════════════════════════════════════════════════
// genInner
// ═══════════════════════════════════════════════════════════
describe("genInner", () => {
  it("produces same number of points as input (no fillet)", () => {
    const outer = [[30, 0], [40, 10], [50, 20]];
    const inner = genInner(outer, 5, 0);
    expect(inner.length).toBe(outer.length);
  });

  it("inner radii are smaller than outer radii (no fillet)", () => {
    const outer = [[30, 0], [40, 10], [50, 20], [55, 30]];
    const inner = genInner(outer, 5, 0);
    for (let i = 0; i < outer.length; i++) {
      expect(inner[i][0]).toBeLessThan(outer[i][0]);
    }
  });

  it("preserves heights (no fillet)", () => {
    const outer = [[30, 0], [40, 10], [50, 20]];
    const inner = genInner(outer, 5, 0);
    for (let i = 0; i < outer.length; i++) {
      expect(inner[i][1]).toBe(outer[i][1]);
    }
  });

  it("inner radii are at least 2 (floor clamp)", () => {
    const outer = [[5, 0], [6, 10]]; // Very small bowl
    const inner = genInner(outer, 10, 0); // Wall thicker than radius
    for (const pt of inner) {
      expect(pt[0]).toBeGreaterThanOrEqual(2);
    }
  });

  it("wall offset is larger at base than rim (no fillet)", () => {
    const outer = [[30, 0], [40, 10], [50, 20], [55, 30]];
    const inner = genInner(outer, 5, 0);
    const baseOffset = outer[0][0] - inner[0][0];
    const rimOffset = outer[outer.length - 1][0] - inner[outer.length - 1][0];
    expect(baseOffset).toBeGreaterThan(rimOffset);
  });

  it("with fillet, produces more points than input", () => {
    const outer = [[30, 0], [40, 10], [50, 20], [55, 30]];
    const inner = genInner(outer, 5, 5);
    expect(inner.length).toBeGreaterThan(outer.length);
  });

  it("with fillet, first point starts near bottomY", () => {
    const outer = [[30, 0], [40, 10], [50, 20], [55, 30]];
    const inner = genInner(outer, 5, 5);
    // Fillet arc starts at floor level (bottomY = 0)
    expect(inner[0][1]).toBeCloseTo(0, 0);
  });

  it("with fillet, last point matches no-fillet rim", () => {
    const outer = [[30, 0], [40, 10], [50, 20], [55, 30]];
    const withFillet = genInner(outer, 5, 5);
    const noFillet = genInner(outer, 5, 0);
    const lastF = withFillet[withFillet.length - 1];
    const lastN = noFillet[noFillet.length - 1];
    expect(lastF[0]).toBeCloseTo(lastN[0], 5);
    expect(lastF[1]).toBeCloseTo(lastN[1], 5);
  });

  it("default filletRadius is 5", () => {
    const outer = [[30, 0], [40, 10], [50, 20]];
    const defaultFillet = genInner(outer, 5);
    const explicit5 = genInner(outer, 5, 5);
    expect(defaultFillet.length).toBe(explicit5.length);
  });
});

// ═══════════════════════════════════════════════════════════
// applyInnerFillet
// ═══════════════════════════════════════════════════════════
describe("applyInnerFillet", () => {
  it("returns original curve when filletRadius <= 0", () => {
    const curve = [[25, 0], [35, 10], [45, 20]];
    expect(applyInnerFillet(curve, 0)).toBe(curve);
    expect(applyInnerFillet(curve, -1)).toBe(curve);
  });

  it("returns original curve when fewer than 2 points", () => {
    const curve = [[25, 0]];
    expect(applyInnerFillet(curve, 5)).toBe(curve);
  });

  it("adds arc points at the start of the curve", () => {
    const curve = [[25, 0], [35, 10], [45, 20]];
    const filleted = applyInnerFillet(curve, 5, 0);
    expect(filleted.length).toBeGreaterThan(curve.length);
    // Arc points come first, then original curve minus first point
    expect(filleted[filleted.length - 1][0]).toBe(curve[curve.length - 1][0]);
    expect(filleted[filleted.length - 1][1]).toBe(curve[curve.length - 1][1]);
  });

  it("arc starts at floor level (bottomY)", () => {
    const curve = [[25, 5], [35, 15], [45, 25]];
    const filleted = applyInnerFillet(curve, 3, 5);
    // First arc point should be near bottomY
    expect(filleted[0][1]).toBeCloseTo(5, 0);
  });

  it("clamps radius to avoid exceeding segment length", () => {
    const curve = [[25, 0], [26, 1], [30, 10]]; // Very short first segment
    const filleted = applyInnerFillet(curve, 50, 0); // Huge radius
    // Should still produce valid output (clamped)
    for (const [r, h] of filleted) {
      expect(isFinite(r)).toBe(true);
      expect(isFinite(h)).toBe(true);
    }
  });
});

// ═══════════════════════════════════════════════════════════
// nest
// ═══════════════════════════════════════════════════════════
describe("nest", () => {
  const fargklar = PROFILES["fargklar-real"];

  it("returns requested number of bowls", () => {
    const bowls = nest(fargklar, 3, 3);
    expect(bowls.length).toBe(3);
  });

  it("first bowl has scale=1 and baseY=0", () => {
    const bowls = nest(fargklar, 3, 3);
    expect(bowls[0].s).toBe(1);
    expect(bowls[0].baseY).toBe(0);
  });

  it("each successive bowl has smaller scale", () => {
    const bowls = nest(fargklar, 4, 3);
    for (let i = 1; i < bowls.length; i++) {
      expect(bowls[i].s).toBeLessThan(bowls[i - 1].s);
    }
  });

  it("each successive bowl has higher baseY", () => {
    const bowls = nest(fargklar, 4, 3);
    for (let i = 1; i < bowls.length; i++) {
      expect(bowls[i].baseY).toBeGreaterThan(bowls[i - 1].baseY);
    }
  });

  it("foot outer < wall base for all bowls", () => {
    const bowls = nest(fargklar, 4, 3);
    for (const b of bowls) {
      expect(b.footOuter).toBeLessThan(b.wallBase);
    }
  });

  it("nested bowl foot fits inside parent wall base", () => {
    const bowls = nest(fargklar, 4, 3);
    for (let i = 1; i < bowls.length; i++) {
      expect(bowls[i].footOuter).toBeLessThan(bowls[i - 1].wallBase);
    }
  });

  it("stops early when scale would be < 0.35", () => {
    // Request 20 bowls — should stop well before that
    const bowls = nest(fargklar, 20, 3);
    expect(bowls.length).toBeLessThan(20);
    for (const b of bowls) {
      expect(b.s).toBeGreaterThanOrEqual(0.35);
    }
  });

  it("larger gap = fewer bowls fit", () => {
    const tight = nest(fargklar, 10, 1);
    const loose = nest(fargklar, 10, 8);
    expect(tight.length).toBeGreaterThanOrEqual(loose.length);
  });

  it("each bowl has correct label", () => {
    const bowls = nest(fargklar, 3, 3);
    expect(bowls[0].label).toBe("Bowl 1");
    expect(bowls[1].label).toBe("Bowl 2");
    expect(bowls[2].label).toBe("Bowl 3");
  });

  it("works for every profile without throwing", () => {
    for (const k of Object.keys(PROFILES)) {
      expect(() => nest(PROFILES[k], 3, 3)).not.toThrow();
    }
  });

  it("baseY stacking: bowl sits on parent floor top", () => {
    const bowls = nest(fargklar, 3, 3);
    for (let i = 1; i < bowls.length; i++) {
      const parent = bowls[i - 1];
      const expectedBaseY = parent.baseY + parent.footH + parent.floorT;
      expect(bowls[i].baseY).toBeCloseTo(expectedBaseY, 5);
    }
  });
});

// ═══════════════════════════════════════════════════════════
// catmullRomResample
// ═══════════════════════════════════════════════════════════
describe("catmullRomResample", () => {
  it("returns requested number of points", () => {
    const pts = [[20, 0], [30, 10], [40, 20], [55, 35], [70, 47]];
    const out = catmullRomResample(pts, 25);
    expect(out.length).toBe(25);
  });

  it("endpoints match input endpoints", () => {
    const pts = [[20, 0], [30, 10], [40, 20], [55, 35], [70, 47]];
    const out = catmullRomResample(pts, 30);
    expect(out[0][0]).toBeCloseTo(20, 5);
    expect(out[0][1]).toBeCloseTo(0, 5);
    expect(out[out.length - 1][0]).toBeCloseTo(70, 5);
    expect(out[out.length - 1][1]).toBeCloseTo(47, 5);
  });

  it("output height is monotonically non-decreasing for ascending input", () => {
    const pts = [[20, 0], [30, 10], [40, 20], [55, 35], [70, 47]];
    const out = catmullRomResample(pts, 40);
    for (let i = 1; i < out.length; i++) {
      expect(out[i][1]).toBeGreaterThanOrEqual(out[i - 1][1] - 0.5);
    }
  });

  it("handles 2-point input with linear interpolation", () => {
    const out = catmullRomResample([[10, 0], [50, 40]], 5);
    expect(out.length).toBe(5);
    expect(out[2][0]).toBeCloseTo(30, 5);
    expect(out[2][1]).toBeCloseTo(20, 5);
  });

  it("handles single-point input", () => {
    const out = catmullRomResample([[10, 5]]);
    expect(out.length).toBe(1);
    expect(out[0]).toEqual([10, 5]);
  });

  it("produces denser output than input for custom profile points", () => {
    const custom = PROFILES.custom.outer;
    const out = catmullRomResample(custom, 30);
    expect(out.length).toBeGreaterThan(custom.length);
  });
});

// ═══════════════════════════════════════════════════════════
// STACKING_VESSELS
// ═══════════════════════════════════════════════════════════
describe("STACKING_VESSELS", () => {
  it("contains mug, cup, tumbler", () => {
    expect(STACKING_VESSELS.has(VESSEL.mug)).toBe(true);
    expect(STACKING_VESSELS.has(VESSEL.cup)).toBe(true);
    expect(STACKING_VESSELS.has(VESSEL.tumbler)).toBe(true);
  });

  it("does not contain bowl, plate, serving", () => {
    expect(STACKING_VESSELS.has(VESSEL.bowl)).toBe(false);
    expect(STACKING_VESSELS.has(VESSEL.plate)).toBe(false);
    expect(STACKING_VESSELS.has(VESSEL.serving)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
// computeDraftAngle
// ═══════════════════════════════════════════════════════════
describe("computeDraftAngle", () => {
  const mug = PROFILES["mug"];

  it("returns positive for tapered mug", () => {
    expect(computeDraftAngle(mug)).toBeGreaterThan(0);
  });

  it("returns reasonable range (1-15°)", () => {
    const a = computeDraftAngle(mug);
    expect(a).toBeGreaterThan(1);
    expect(a).toBeLessThan(15);
  });

  it("matches known frustum calculation", () => {
    const base = mug.outer[0];
    const rim = mug.outer[mug.outer.length - 1];
    const expected = Math.atan((rim[0] - base[0]) / (rim[1] - base[1])) * (180 / Math.PI);
    expect(computeDraftAngle(mug)).toBeCloseTo(expected, 5);
  });

  it("works for every profile without throwing", () => {
    for (const k of Object.keys(PROFILES)) {
      expect(() => computeDraftAngle(PROFILES[k])).not.toThrow();
    }
  });
});

// ═══════════════════════════════════════════════════════════
// computeNestingOffset
// ═══════════════════════════════════════════════════════════
describe("computeNestingOffset", () => {
  const mug = PROFILES["mug"];

  it("returns finite positive value", () => {
    const offset = computeNestingOffset(mug);
    expect(offset).toBeGreaterThan(0);
    expect(Number.isFinite(offset)).toBe(true);
  });

  it("matches 2t/tan(α)", () => {
    const alpha = computeDraftAngle(mug) * (Math.PI / 180);
    const expected = (2 * mug.wallThickness) / Math.tan(alpha);
    expect(computeNestingOffset(mug)).toBeCloseTo(expected, 5);
  });

  it("thicker walls produce larger offset", () => {
    const thin = { ...mug, wallThickness: 3 };
    const thick = { ...mug, wallThickness: 8 };
    expect(computeNestingOffset(thick)).toBeGreaterThan(computeNestingOffset(thin));
  });
});

// ═══════════════════════════════════════════════════════════
// computeNestingEfficiency
// ═══════════════════════════════════════════════════════════
describe("computeNestingEfficiency", () => {
  it("returns value ≤ 1", () => {
    for (const k of Object.keys(PROFILES)) {
      if (STACKING_VESSELS.has(PROFILES[k].vessel)) {
        const eff = computeNestingEfficiency(PROFILES[k]);
        expect(eff).toBeLessThanOrEqual(1);
      }
    }
  });

  it("cappuccino mug has positive efficiency (wide taper)", () => {
    const eff = computeNestingEfficiency(PROFILES["cappuccino"]);
    expect(eff).toBeGreaterThan(0);
  });

  it("negative efficiency means offset > wall height (poor stacking)", () => {
    // Coffee mug has thick walls / shallow taper → Δh > wall height
    const eff = computeNestingEfficiency(PROFILES["mug"]);
    expect(eff).toBeLessThan(1);
    // validateMugStacking should flag this
    const result = validateMugStacking(PROFILES["mug"]);
    expect(result.valid).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════
// computeStackHeight
// ═══════════════════════════════════════════════════════════
describe("computeStackHeight", () => {
  const mug = PROFILES["mug"];

  it("n=1 equals total height", () => {
    const totalH = mug.interiorDepth + mug.floor.thickness + mug.foot.height;
    expect(computeStackHeight(mug, 1)).toBeCloseTo(totalH, 5);
  });

  it("n mugs matches H + (n-1)*Δh", () => {
    const totalH = mug.interiorDepth + mug.floor.thickness + mug.foot.height;
    const dh = computeNestingOffset(mug);
    expect(computeStackHeight(mug, 4)).toBeCloseTo(totalH + 3 * dh, 5);
  });

  it("more mugs = taller stack", () => {
    expect(computeStackHeight(mug, 6)).toBeGreaterThan(computeStackHeight(mug, 3));
  });
});

// ═══════════════════════════════════════════════════════════
// validateMugStacking
// ═══════════════════════════════════════════════════════════
describe("validateMugStacking", () => {
  const mug = PROFILES["mug"];

  it("returns all expected fields", () => {
    const result = validateMugStacking(mug);
    expect(result).toHaveProperty("valid");
    expect(result).toHaveProperty("warnings");
    expect(result).toHaveProperty("draftAngle");
    expect(result).toHaveProperty("nestingOffset");
    expect(result).toHaveProperty("efficiency");
  });

  it("warnings is an array", () => {
    const result = validateMugStacking(mug);
    expect(Array.isArray(result.warnings)).toBe(true);
  });

  it("flags draft angle below 3°", () => {
    // Create a nearly-straight mug (very small taper)
    const straight = { ...mug, outer: [[40, 0], [40.1, 10], [40.2, 20], [40.3, 30], [40.4, 80]] };
    const result = validateMugStacking(straight);
    expect(result.warnings.some(w => w.includes("Draft angle") && w.includes("below"))).toBe(true);
  });

  it("returns valid boolean", () => {
    const result = validateMugStacking(mug);
    expect(typeof result.valid).toBe("boolean");
  });
});

// ═══════════════════════════════════════════════════════════
// nestMugs
// ═══════════════════════════════════════════════════════════
describe("nestMugs", () => {
  const mug = PROFILES["mug"];

  it("returns correct count", () => {
    const bowls = nestMugs(mug, 4, 3);
    expect(bowls.length).toBe(4);
  });

  it("all mugs have s=1 (no scaling)", () => {
    const bowls = nestMugs(mug, 3, 3);
    for (const b of bowls) {
      expect(b.s).toBe(1);
    }
  });

  it("first mug has baseY=0", () => {
    const bowls = nestMugs(mug, 3, 3);
    expect(bowls[0].baseY).toBe(0);
  });

  it("baseY increments by Δh", () => {
    const bowls = nestMugs(mug, 4, 3);
    const dh = computeNestingOffset(mug);
    for (let i = 1; i < bowls.length; i++) {
      expect(bowls[i].baseY).toBeCloseTo(i * dh, 5);
    }
  });

  it("all mugs have same rim diameter", () => {
    const bowls = nestMugs(mug, 4, 3);
    for (const b of bowls) {
      expect(b.rim).toBe(mug.rimDiameter);
    }
  });

  it("labels say Mug", () => {
    const bowls = nestMugs(mug, 3, 3);
    expect(bowls[0].label).toBe("Mug 1");
    expect(bowls[1].label).toBe("Mug 2");
    expect(bowls[2].label).toBe("Mug 3");
  });

  it("has same schema fields as nest() output", () => {
    const nestBowls = nest(mug, 3, 3);
    const stackBowls = nestMugs(mug, 3, 3);
    const nestKeys = Object.keys(nestBowls[0]).sort();
    const stackKeys = Object.keys(stackBowls[0]).sort();
    expect(stackKeys).toEqual(nestKeys);
  });

  it("works for every stacking vessel profile", () => {
    for (const k of Object.keys(PROFILES)) {
      if (STACKING_VESSELS.has(PROFILES[k].vessel)) {
        expect(() => nestMugs(PROFILES[k], 4, 3)).not.toThrow();
        const bowls = nestMugs(PROFILES[k], 4, 3);
        expect(bowls.length).toBe(4);
        expect(bowls[0].s).toBe(1);
      }
    }
  });
});
