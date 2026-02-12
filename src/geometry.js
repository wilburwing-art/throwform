// Vessel categories for rim filtering
export const VESSEL = { bowl: "bowl", plate: "plate", mug: "mug", cup: "cup", tumbler: "tumbler", serving: "serving" };

export const PROFILES = {
  "fargklar-real": {
    name: "IKEA Färgklar Bowl (EXTRACTED)", source: "dimensions.com SVG beziers",
    vessel: VESSEL.bowl,
    rimDiameter: 165, wallThickness: 5.5, interiorDepth: 47,
    floor: { thickness: 8 },
    foot: { outerRadius: 50, innerRadius: 46, height: 3.3 },
    rimLip: { height: 3, overhang: 1.5 },
    outer: [
      [55.3,0],[59.9,4.4],[64.2,9.2],[68.1,14.6],[71.6,20.3],
      [74.7,26.4],[77.5,32.8],[79.8,39.5],[81.7,46.3],[82.3,49.2],
      [82.9,52.1],[83.3,55.1],[83.7,58.0],[84.0,61.0],[84.3,64.0],
      [84.4,67.0],[84.5,70.0],
    ],
  },
  "fargklar-deep": {
    name: "Färgklar Deep Plate", source: "9\" ø × 2\" H",
    vessel: VESSEL.plate,
    rimDiameter: 230, wallThickness: 5, interiorDepth: 32,
    floor: { thickness: 6 },
    foot: { outerRadius: 42, innerRadius: 38, height: 3 },
    rimLip: { height: 2, overhang: 2 },
    outer: [[45,0],[52,5],[60,10],[70,17],[80,24],[90,31],[100,38],[108,44],[113,48],[115,50]],
  },
  "cereal": {
    name: "Classic Cereal Bowl", source: "6\" ø × 3\" H",
    vessel: VESSEL.bowl,
    rimDiameter: 152, wallThickness: 6, interiorDepth: 55,
    floor: { thickness: 10 },
    foot: { outerRadius: 28, innerRadius: 24, height: 4 },
    rimLip: { height: 3, overhang: 1 },
    outer: [[30,0],[36,10],[45,20],[55,30],[63,40],[69,50],[73,60],[75.5,70],[76,76]],
  },
  "ramen": {
    name: "Deep Ramen Bowl", source: "7.5\" ø × 3.5\" H",
    vessel: VESSEL.bowl,
    rimDiameter: 190, wallThickness: 6, interiorDepth: 68,
    floor: { thickness: 10 },
    foot: { outerRadius: 33, innerRadius: 29, height: 5 },
    rimLip: { height: 3, overhang: 1.5 },
    outer: [[35,0],[44,14],[56,26],[68,38],[80,50],[89,62],[94,74],[95,84],[95,89]],
  },
  "mug": {
    name: "Coffee Mug", source: "3.25\" ø × 3.75\" H",
    vessel: VESSEL.mug,
    rimDiameter: 82, wallThickness: 5, interiorDepth: 80,
    floor: { thickness: 8 },
    foot: { outerRadius: 32, innerRadius: 28, height: 3 },
    rimLip: { height: 2, overhang: 1 },
    outer: [[33,0],[34,10],[35,20],[36,30],[37,40],[38,50],[39,60],[40,70],[41,80],[41,90]],
  },
  "espresso": {
    name: "Espresso Demitasse", source: "2.25\" ø × 2.25\" H",
    vessel: VESSEL.cup,
    rimDiameter: 57, wallThickness: 3.5, interiorDepth: 42,
    floor: { thickness: 6 },
    foot: { outerRadius: 20, innerRadius: 17, height: 3 },
    rimLip: { height: 1.5, overhang: 0.5 },
    outer: [[22,0],[23,6],[24,12],[25.5,20],[27,28],[28,36],[28.5,44],[28.5,48]],
  },
  "cappuccino": {
    name: "Cappuccino Mug", source: "3.5\" ø × 2.75\" H",
    vessel: VESSEL.mug,
    rimDiameter: 89, wallThickness: 5, interiorDepth: 55,
    floor: { thickness: 8 },
    foot: { outerRadius: 30, innerRadius: 26, height: 3 },
    rimLip: { height: 2, overhang: 1 },
    outer: [[32,0],[34,8],[37,16],[39,24],[41,32],[43,40],[44,48],[44.5,55],[44.5,60]],
  },
  "latte": {
    name: "Latte Mug", source: "3.5\" ø × 4.5\" H",
    vessel: VESSEL.mug,
    rimDiameter: 89, wallThickness: 5, interiorDepth: 95,
    floor: { thickness: 8 },
    foot: { outerRadius: 32, innerRadius: 28, height: 3 },
    rimLip: { height: 2, overhang: 1 },
    outer: [[34,0],[35,12],[36,24],[37,36],[38,48],[39,60],[40,72],[41.5,84],[43,95],[44.5,103]],
  },
  "camp": {
    name: "Camp / Diner Mug", source: "3.5\" ø × 3.5\" H",
    vessel: VESSEL.mug,
    rimDiameter: 89, wallThickness: 6.5, interiorDepth: 75,
    floor: { thickness: 10 },
    foot: { outerRadius: 35, innerRadius: 31, height: 2.5 },
    rimLip: { height: 2.5, overhang: 1 },
    outer: [[36,0],[36.5,10],[37,20],[37.5,30],[38,40],[39,50],[40,60],[41.5,70],[43,78],[44.5,84]],
  },
  "stacking": {
    name: "Stacking Mug", source: "4\" ø × 2.75\" H",
    vessel: VESSEL.mug,
    rimDiameter: 102, wallThickness: 5.5, interiorDepth: 52,
    floor: { thickness: 9 },
    foot: { outerRadius: 38, innerRadius: 34, height: 3 },
    rimLip: { height: 2, overhang: 0.5 },
    outer: [[40,0],[41,7],[43,14],[45,22],[47,30],[48.5,38],[50,46],[51,52],[51,57]],
  },
  "teacup": {
    name: "Japanese Tea Cup", source: "3\" ø × 2.5\" H",
    vessel: VESSEL.cup,
    rimDiameter: 76, wallThickness: 4, interiorDepth: 50,
    floor: { thickness: 6 },
    foot: { outerRadius: 22, innerRadius: 18, height: 5 },
    rimLip: { height: 2, overhang: 0.5 },
    outer: [[24,0],[27,8],[31,16],[34,24],[36,32],[37.5,40],[38,48],[38,55]],
  },
  "serving": {
    name: "Serving Bowl", source: "10\" ø × 4\" H",
    vessel: VESSEL.serving,
    rimDiameter: 254, wallThickness: 7, interiorDepth: 70,
    floor: { thickness: 12 },
    foot: { outerRadius: 55, innerRadius: 50, height: 5 },
    rimLip: { height: 4, overhang: 3 },
    outer: [[58,0],[65,8],[75,16],[86,24],[97,34],[107,44],[115,54],[121,64],[125,74],[127,82],[127,88]],
  },
  "plate": {
    name: "Dinner Plate", source: "10.5\" ø × 1\" H",
    vessel: VESSEL.plate,
    rimDiameter: 267, wallThickness: 5, interiorDepth: 15,
    floor: { thickness: 7 },
    foot: { outerRadius: 55, innerRadius: 50, height: 3 },
    rimLip: { height: 2, overhang: 3 },
    outer: [[58,0],[70,3],[85,6],[100,9],[115,12],[127,15],[133,18],[133.5,20]],
  },
  "tumbler": {
    name: "Whiskey Tumbler", source: "3.5\" ø × 3.5\" H",
    vessel: VESSEL.tumbler,
    rimDiameter: 89, wallThickness: 6, interiorDepth: 72,
    floor: { thickness: 10 },
    foot: { outerRadius: 35, innerRadius: 31, height: 3 },
    rimLip: { height: 2, overhang: 0.5 },
    outer: [[36,0],[37,10],[38,18],[39,28],[40,38],[41,48],[42,58],[43,68],[44,78],[44.5,85]],
  },
  "custom": {
    name: "✎ Custom Bowl", source: "drag points to shape",
    vessel: VESSEL.bowl,
    rimDiameter: 160, wallThickness: 5, interiorDepth: 50,
    floor: { thickness: 8 },
    foot: { outerRadius: 35, innerRadius: 31, height: 4 },
    rimLip: { height: 3, overhang: 1 },
    outer: [[38,0],[46,10],[56,20],[66,30],[74,40],[79,50],[80,60]],
    custom: true,
  },
};

// ═══════════════════════════════════════════════════════════
// VOLUME & CLAY WEIGHT — solid of revolution via frustum sum
// ═══════════════════════════════════════════════════════════
export function computeVolumes(p, scale = 1) {
  const outer = p.outer;
  const wt = p.wallThickness * scale;
  const footH = p.foot.height * scale;
  const floorT = p.floor.thickness * scale;
  const footOR = p.foot.outerRadius * scale;
  const footIR = p.foot.innerRadius * scale;
  const scaledOuter = outer.map(([r, h]) => [r * scale, h * scale]);

  const frustumV = (r1, r2, dh) => Math.PI / 3 * Math.abs(dh) * (r1 * r1 + r1 * r2 + r2 * r2);

  let interiorV = 0;
  const wallBaseR = scaledOuter[0][0];
  interiorV += frustumV(0, wallBaseR, 0.01);
  for (let i = 1; i < scaledOuter.length; i++) {
    interiorV += frustumV(scaledOuter[i - 1][0], scaledOuter[i][0], scaledOuter[i][1] - scaledOuter[i - 1][1]);
  }

  let outerV = 0;
  outerV += Math.PI * (footOR * footOR - footIR * footIR) * footH;
  outerV += frustumV(footIR, wallBaseR + wt, floorT);
  for (let i = 1; i < scaledOuter.length; i++) {
    outerV += frustumV(scaledOuter[i - 1][0] + wt, scaledOuter[i][0] + wt, scaledOuter[i][1] - scaledOuter[i - 1][1]);
  }

  const clayV = outerV - interiorV;
  const interiorML = interiorV / 1000;
  const interiorOz = interiorML / 29.5735;
  const clayWetG = (clayV / 1000) * 1.8;
  const clayLbs = clayWetG / 453.592;

  const surfSlice = (r1, h1, r2, h2) => {
    const arc = Math.sqrt((r2 - r1) ** 2 + (h2 - h1) ** 2);
    return 2 * Math.PI * ((r1 + r2) / 2) * arc;
  };
  let glazeArea = Math.PI * wallBaseR * wallBaseR;
  for (let i = 1; i < scaledOuter.length; i++) {
    glazeArea += surfSlice(scaledOuter[i - 1][0], scaledOuter[i - 1][1], scaledOuter[i][0], scaledOuter[i][1]);
    glazeArea += surfSlice(scaledOuter[i - 1][0] + wt, scaledOuter[i - 1][1], scaledOuter[i][0] + wt, scaledOuter[i][1]);
  }

  return { interiorML, interiorOz, clayWetG, clayLbs, glazeArea, glazeAreaIn2: glazeArea / 645.16 };
}

// ═══════════════════════════════════════════════════════════
// RIM TYPES — geometry definitions
// ═══════════════════════════════════════════════════════════
export const RIM_TYPES = {
  rounded: {
    name: "Rounded",
    desc: "Smooth curved top edge — resists chipping",
    icon: "◠",
    vessels: [VESSEL.bowl, VESSEL.mug, VESSEL.cup, VESSEL.tumbler, VESSEL.serving, VESSEL.plate],
  },
  beveled: {
    name: "Beveled",
    desc: "Angled cut on outside — feels lighter on the mouth",
    icon: "◿",
    vessels: [VESSEL.mug, VESSEL.cup, VESSEL.tumbler],
  },
  flared: {
    name: "Flared",
    desc: "Curves outward — faster pour, drink cooling",
    icon: "⌐",
    vessels: [VESSEL.bowl, VESSEL.mug, VESSEL.cup, VESSEL.serving],
  },
  tulip: {
    name: "Tulip",
    desc: "Curves inward — concentrates aroma, retains heat",
    icon: "⌐̃",
    vessels: [VESSEL.mug, VESSEL.cup, VESSEL.bowl],
  },
  straight: {
    name: "Straight",
    desc: "Extends vertically — neutral feel, ideal for stacking",
    icon: "│",
    vessels: [VESSEL.tumbler, VESSEL.mug, VESSEL.bowl, VESSEL.serving],
  },
  rolled: {
    name: "Rolled",
    desc: "Turns back toward body — reinforced, stronger edge",
    icon: "↺",
    vessels: [VESSEL.serving, VESSEL.bowl, VESSEL.mug],
  },
  tapered: {
    name: "Tapered",
    desc: "Thins to a fine edge — delicate feel, fine porcelain",
    icon: "╲",
    vessels: [VESSEL.cup, VESSEL.mug, VESSEL.tumbler],
  },
  flanged: {
    name: "Flanged",
    desc: "Flat horizontal shelf — safe grip, frames food",
    icon: "⌐",
    vessels: [VESSEL.plate, VESSEL.serving, VESSEL.bowl],
  },
  coupe: {
    name: "Coupe",
    desc: "No distinct lip — continuous curve, modern minimal",
    icon: "⏜",
    vessels: [VESSEL.plate, VESSEL.bowl, VESSEL.serving],
  },
  thickened: {
    name: "Thickened",
    desc: "Bulbous club rim — most chip-resistant, substantial feel",
    icon: "●",
    vessels: [VESSEL.mug, VESSEL.bowl, VESSEL.serving, VESSEL.tumbler],
  },
};

// Generates SVG path commands for a rim type
// iR = inner wall radius at top, oR = outer wall radius at top, h = base height (top of wall)
// lipH = lip height, overhang = how far it extends, wt = wall thickness
// Returns { path, topH } for one side
export function rimGeometry(type, iR, oR, h, lipH, overhang, wt, tx, ty, side) {
  const X = side === "R" ? tx : (r) => tx(-r);
  const lh = Math.max(lipH, 1.5);
  const ov = Math.max(overhang, 0.5);

  switch (type) {
    case "rounded": {
      const topH = h + lh;
      return {
        path: `M${X(iR)},${ty(h)} C${X(iR)},${ty(topH)} ${X(oR)},${ty(topH)} ${X(oR)},${ty(h)}`,
        topH: topH,
      };
    }
    case "beveled": {
      const topH = h + lh;
      const bevelStart = oR + ov * 0.3;
      const bevelEnd = oR;
      return {
        path: `M${X(iR)},${ty(h)} L${X(iR)},${ty(topH)} L${X(bevelStart)},${ty(topH)} L${X(bevelEnd + ov)},${ty(h + lh * 0.3)} L${X(oR)},${ty(h)}`,
        topH: topH,
      };
    }
    case "flared": {
      const flareR = oR + ov + wt * 0.8;
      const topH = h + lh;
      const midH = h + lh * 0.7;
      return {
        path: `M${X(iR)},${ty(h)} C${X(iR - ov * 0.3)},${ty(topH)} ${X(iR + wt * 0.5)},${ty(topH + lh * 0.3)} ${X(flareR)},${ty(midH)} C${X(flareR + ov * 0.2)},${ty(midH - lh * 0.2)} ${X(oR + ov * 0.5)},${ty(h + lh * 0.1)} ${X(oR)},${ty(h)}`,
        topH: topH + lh * 0.3,
      };
    }
    case "tulip": {
      const topH = h + lh;
      const inwardR = iR - wt * 0.6;
      return {
        path: `M${X(iR)},${ty(h)} C${X(iR)},${ty(h + lh * 0.3)} ${X(inwardR)},${ty(topH - lh * 0.2)} ${X(inwardR)},${ty(topH)} C${X(inwardR)},${ty(topH + lh * 0.15)} ${X(oR)},${ty(topH)} ${X(oR)},${ty(h + lh * 0.5)} L${X(oR)},${ty(h)}`,
        topH: topH + lh * 0.15,
      };
    }
    case "straight": {
      const topH = h + lh;
      return {
        path: `M${X(iR)},${ty(h)} L${X(iR)},${ty(topH)} L${X(oR)},${ty(topH)} L${X(oR)},${ty(h)}`,
        topH: topH,
      };
    }
    case "rolled": {
      const topH = h + lh;
      const rollR = oR + ov;
      const rollBackR = oR - wt * 0.15;
      return {
        path: `M${X(iR)},${ty(h)} L${X(iR)},${ty(topH - lh * 0.3)} C${X(iR)},${ty(topH + lh * 0.1)} ${X(rollR)},${ty(topH + lh * 0.1)} ${X(rollR)},${ty(topH - lh * 0.3)} C${X(rollR)},${ty(topH - lh * 0.7)} ${X(rollBackR)},${ty(h + lh * 0.3)} ${X(oR)},${ty(h)}`,
        topH: topH + lh * 0.1,
      };
    }
    case "tapered": {
      const topH = h + lh;
      const thinR = iR + (oR - iR) * 0.15;
      const midH = h + lh * 0.5;
      return {
        path: `M${X(iR)},${ty(h)} L${X(iR)},${ty(midH)} L${X(thinR)},${ty(topH)} L${X(oR)},${ty(midH)} L${X(oR)},${ty(h)}`,
        topH: topH,
      };
    }
    case "flanged": {
      const shelfW = ov + wt * 1.5;
      const topH = h + lh;
      const shelfR = oR + shelfW;
      return {
        path: `M${X(iR)},${ty(h)} L${X(iR)},${ty(topH)} L${X(shelfR)},${ty(topH)} L${X(shelfR)},${ty(topH - lh * 0.6)} C${X(shelfR - shelfW * 0.1)},${ty(topH - lh * 0.7)} ${X(oR + shelfW * 0.1)},${ty(h + lh * 0.1)} ${X(oR)},${ty(h)}`,
        topH: topH,
      };
    }
    case "coupe": {
      const topH = h + lh * 0.4;
      const midR = (iR + oR) / 2;
      return {
        path: `M${X(iR)},${ty(h)} C${X(iR)},${ty(topH)} ${X(midR)},${ty(topH + lh * 0.15)} ${X(oR)},${ty(h)}`,
        topH: topH + lh * 0.15,
      };
    }
    case "thickened": {
      const topH = h + lh;
      const bulge = wt * 0.4;
      const outerBulge = oR + bulge;
      const innerBulge = iR - bulge * 0.5;
      return {
        path: `M${X(iR)},${ty(h)} C${X(iR)},${ty(h + lh * 0.3)} ${X(innerBulge)},${ty(h + lh * 0.5)} ${X(innerBulge)},${ty(topH - lh * 0.3)} C${X(innerBulge)},${ty(topH + lh * 0.1)} ${X(outerBulge)},${ty(topH + lh * 0.1)} ${X(outerBulge)},${ty(topH - lh * 0.3)} C${X(outerBulge)},${ty(h + lh * 0.5)} ${X(oR)},${ty(h + lh * 0.3)} ${X(oR)},${ty(h)}`,
        topH: topH + lh * 0.1,
      };
    }
    default:
      return { path: "", topH: h + lh };
  }
}

// ═══════════════════════════════════════════════════════════
// EXPORT CONTENT GENERATORS — pure functions returning strings
// ═══════════════════════════════════════════════════════════

// Generate rib tool SVG string for laser cutting / CNC
// Uses laser-standard conventions: red (#FF0000) hairline stroke for cut lines,
// black (#000000) for engrave/score text, separated into layers
export function generateRibSVG(bowls, p, edgeAngle, ribThick) {
  const CUT = "#FF0000";
  const ENGRAVE = "#000000";
  const HAIRLINE = "0.01";

  const edgeExt = ribThick / (2 * Math.tan((edgeAngle / 2) * Math.PI / 180));
  const tools = [];
  bowls.forEach((b, i) => {
    const wt = p.wallThickness * b.s;
    const stepH = b.footH + b.floorT;
    const innerWall = b.outer.map(([r, h]) => [r, h]);
    const outerWall = b.outer.map(([r, h]) => [r + wt, h]);
    const innerBaseR = innerWall[0][0], outerBaseR = outerWall[0][0];
    const wallH = Math.max(...innerWall.map(q => q[1]));
    const maxSweep = Math.max(...innerWall.map(q => q[0] - innerBaseR), ...outerWall.map(q => q[0] - outerBaseR)) || 1;
    const sweepScale = (ribThick * 0.75) / maxSweep;
    const maxH = wallH + stepH;
    const innerWork = innerWall.map(([r, h]) => [ribThick + (r - innerBaseR) * sweepScale + edgeExt, h + stepH]);
    const innerBack = [[-edgeExt, 0], [-edgeExt, maxH]];
    const innerStepR = [[ribThick + edgeExt, 0]];
    tools.push({ label: `B${i + 1}-Inner-${b.rim.toFixed(0)}mm`, work: innerWork, back: innerBack, maxH, stepR: innerStepR });
    const outerStraight = [[ribThick + edgeExt, 0], [ribThick + edgeExt, stepH]];
    const outerCurve = outerWall.map(([r, h]) => [ribThick + (r - outerBaseR) * sweepScale + edgeExt, h + stepH]);
    tools.push({ label: `B${i + 1}-Outer-${b.rim.toFixed(0)}mm`, work: [...outerStraight, ...outerCurve], back: [[-edgeExt, 0], [-edgeExt, maxH]], maxH, stepR: null });
  });

  const mh = Math.max(...tools.map(t => t.maxH)) + 30;
  let tw = 20; tools.forEach(t => { const xs = [...t.work.map(q => q[0]), ...t.back.map(q => q[0])]; tw += (Math.max(...xs) - Math.min(...xs)) + 30; });

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${tw} ${mh}" width="${tw}mm" height="${mh}mm">\n`;
  // Engrave layer — text labels (separate from cut geometry)
  svg += `<g id="engrave" stroke="none" fill="${ENGRAVE}">\n`;
  svg += `<text x="10" y="14" font-family="monospace" font-size="8">${p.name} Rib Set (Inner+Outer) — 1:1mm — ${edgeAngle}°</text>\n`;

  let xO = 20;
  const toolOffsets = [];
  tools.forEach(t => {
    const xs = [...t.work.map(q => q[0]), ...t.back.map(q => q[0]), ...(t.stepR || []).map(q => q[0])];
    const minX = Math.min(...xs), w = Math.max(...xs) - minX;
    toolOffsets.push({ xO, minX, w });
    svg += `<text x="${xO + w / 2}" y="19" text-anchor="middle" font-family="monospace" font-size="6">${t.label}</text>\n`;
    xO += w + 30;
  });
  svg += `</g>\n`;

  // Cut layer — closed polygon outlines only, red hairline stroke
  svg += `<g id="cut" fill="none" stroke="${CUT}" stroke-width="${HAIRLINE}">\n`;
  tools.forEach((t, idx) => {
    const { xO: ox, minX } = toolOffsets[idx];
    const px = (x, h) => `${(x - minX).toFixed(2)},${(t.maxH - h).toFixed(2)}`;
    const pts = [...t.back.map(([x,h])=>px(x,h)), ...[...t.work].reverse().map(([x,h])=>px(x,h)), ...(t.stepR||[]).map(([x,h])=>px(x,h))].join(" ");
    svg += `<polygon points="${pts}" transform="translate(${ox},25)"/>\n`;
  });
  svg += `</g>\n`;

  svg += "</svg>";
  return svg;
}

// Generate hand-cut template SVG string
export function generateTemplateSVG(bowls, p, edgeAngle, ribThick) {
  const edgeExt = ribThick / (2 * Math.tan((edgeAngle / 2) * Math.PI / 180));
  const tools = [];
  bowls.forEach((b, i) => {
    const wt = p.wallThickness * b.s;
    const stepH = b.footH + b.floorT;
    const innerWall = b.outer.map(([r, h]) => [r, h]);
    const outerWall = b.outer.map(([r, h]) => [r + wt, h]);
    const innerBaseR = innerWall[0][0], outerBaseR = outerWall[0][0];
    const wallH = Math.max(...innerWall.map(q => q[1]));
    const maxSweep = Math.max(...innerWall.map(q => q[0] - innerBaseR), ...outerWall.map(q => q[0] - outerBaseR)) || 1;
    const sweepScale = (ribThick * 0.75) / maxSweep;
    const maxH = wallH + stepH;
    const innerWork = innerWall.map(([r, h]) => [ribThick + (r - innerBaseR) * sweepScale + edgeExt, h + stepH]);
    const innerBack = [[-edgeExt, 0], [-edgeExt, maxH]];
    const innerStepR = [[ribThick + edgeExt, 0]];
    tools.push({ label: `B${i + 1} Inner ${b.rim.toFixed(0)}mm`, work: innerWork, back: innerBack, maxH, stepR: innerStepR, type: "inner" });
    const outerStraight = [[ribThick + edgeExt, 0], [ribThick + edgeExt, stepH]];
    const outerCurve = outerWall.map(([r, h]) => [ribThick + (r - outerBaseR) * sweepScale + edgeExt, h + stepH]);
    tools.push({ label: `B${i + 1} Outer ${b.rim.toFixed(0)}mm`, work: [...outerStraight, ...outerCurve], back: [[-edgeExt, 0], [-edgeExt, maxH]], maxH, stepR: null, type: "outer" });
  });

  const pageW = 297, pageH = 210, margin = 15;
  const mh = Math.max(...tools.map(t => t.maxH));
  const scale = Math.min((pageH - margin * 2 - 30) / mh, 1);

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${pageW} ${pageH}" width="${pageW}mm" height="${pageH}mm">\n`;
  svg += `<rect x="${margin}" y="${margin}" width="${pageW - margin * 2}" height="${pageH - margin * 2}" fill="none" stroke="#ccc" stroke-width="0.3" stroke-dasharray="4,2"/>\n`;
  [[margin, margin], [pageW - margin, margin], [margin, pageH - margin], [pageW - margin, pageH - margin]].forEach(([x, y]) => {
    svg += `<line x1="${x - 5}" y1="${y}" x2="${x + 5}" y2="${y}" stroke="#999" stroke-width="0.3"/>\n`;
    svg += `<line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" stroke="#999" stroke-width="0.3"/>\n`;
  });
  svg += `<text x="${margin + 2}" y="${margin + 8}" font-family="monospace" font-size="5" fill="#666">ThrowForm — ${p.name} — Hand Cut Template — PRINT AT 100% / NO SCALING</text>\n`;
  svg += `<text x="${margin + 2}" y="${margin + 14}" font-family="monospace" font-size="3.5" fill="#999">Edge: ${edgeAngle}° · Body: ${ribThick}mm · Wall: ${p.wallThickness}mm · Scale: ${scale === 1 ? "1:1" : scale.toFixed(2) + "x"}</text>\n`;

  const rulerX = pageW - margin - 52, rulerY = margin + 5;
  svg += `<line x1="${rulerX}" y1="${rulerY}" x2="${rulerX + 50}" y2="${rulerY}" stroke="#333" stroke-width="0.4"/>\n`;
  for (let i = 0; i <= 5; i++) {
    const x = rulerX + i * 10;
    svg += `<line x1="${x}" y1="${rulerY - 2}" x2="${x}" y2="${rulerY + 2}" stroke="#333" stroke-width="0.3"/>\n`;
    if (i < 5) svg += `<text x="${x + 5}" y="${rulerY + 6}" text-anchor="middle" font-family="monospace" font-size="3" fill="#666">${i * 10 + 10}</text>\n`;
  }
  svg += `<text x="${rulerX - 1}" y="${rulerY + 2}" text-anchor="end" font-family="monospace" font-size="3" fill="#666">0mm</text>\n`;

  let xO = margin + 5;
  const yBase = margin + 22;
  tools.forEach(t => {
    const xs = [...t.work.map(q => q[0]), ...t.back.map(q => q[0]), ...(t.stepR || []).map(q => q[0])];
    const minX = Math.min(...xs), w = (Math.max(...xs) - minX) * scale;
    const h = t.maxH * scale;
    const px = (x, ht) => `${((x - minX) * scale).toFixed(2)},${(t.maxH * scale - ht * scale).toFixed(2)}`;
    const pts = [...t.back.map(([x,ht]) => px(x,ht)), ...[...t.work].reverse().map(([x,ht]) => px(x,ht)), ...(t.stepR || []).map(([x,ht]) => px(x,ht))].join(" ");
    svg += `<g transform="translate(${xO},${yBase})">\n`;
    svg += `  <text x="${w / 2}" y="-3" text-anchor="middle" font-family="monospace" font-size="4" fill="${t.type === 'inner' ? '#7a9a7e' : '#8c7e6f'}">${t.label}</text>\n`;
    svg += `  <polygon points="${pts}" fill="#f5f0e8" stroke="#333" stroke-width="0.6"/>\n`;
    svg += `  <line x1="${w / 2}" y1="0" x2="${w / 2}" y2="${h}" stroke="#ccc" stroke-width="0.2" stroke-dasharray="2,2"/>\n`;
    const wPath = t.work.map(([x, ht], j) => `${j === 0 ? "M" : "L"}${((x - minX) * scale).toFixed(2)} ${(t.maxH * scale - ht * scale).toFixed(2)}`).join(" ");
    svg += `  <path d="${wPath}" fill="none" stroke="${t.type === 'inner' ? '#7a9a7e' : '#8c7e6f'}" stroke-width="1.2"/>\n`;
    const midWork = t.work[Math.floor(t.work.length / 2)];
    const mx = (midWork[0] - minX) * scale, my = t.maxH * scale - midWork[1] * scale;
    svg += `  <text x="${mx + 3}" y="${my}" font-family="monospace" font-size="3" fill="${t.type === 'inner' ? '#7a9a7e' : '#8c7e6f'}">← working edge</text>\n`;
    svg += `  <text x="${w / 2}" y="${h + 5}" text-anchor="middle" font-family="monospace" font-size="3" fill="#999">▼ flat base — wheel side ▼</text>\n`;
    svg += `</g>\n`;
    xO += w + 12;
  });
  svg += "</svg>";
  return svg;
}

// Generate profile JSON string
export function generateProfileJSON(p, name) {
  const data = {
    throwform: "1.0",
    name: name || p.name,
    rimDiameter: p.rimDiameter,
    wallThickness: p.wallThickness,
    interiorDepth: p.interiorDepth,
    floor: p.floor,
    foot: p.foot,
    rimLip: p.rimLip,
    outer: p.outer,
  };
  return JSON.stringify(data, null, 2);
}

export function genInner(o, wt) { return o.map(([x, y], i) => [Math.max(x - wt * (1 + 0.3 * (1 - i / (o.length - 1))), 2), y]) }

export function nest(p, n, gap) {
  const bowls = [], rimR = p.outer[p.outer.length - 1][0];
  for (let i = 0; i < n; i++) {
    const s = 1 - i * (p.wallThickness + gap) / rimR;
    if (s < 0.35) break;
    const o = p.outer.map(([x, y]) => [x * s, y * s]);
    const wallBase = o[0][0];

    let fOuter = p.foot.outerRadius * s;
    let fInner = p.foot.innerRadius * s;
    const ringW = (p.foot.outerRadius - p.foot.innerRadius) * s;
    fOuter = Math.min(fOuter, wallBase - 1);
    if (i > 0) {
      const parentWallBase = bowls[i - 1].outer[0][0];
      fOuter = Math.min(fOuter, parentWallBase - 2);
    }
    fInner = fOuter - Math.max(ringW, 2);
    fInner = Math.max(fInner, 2);

    const footH = p.foot.height * s;
    const floorT = p.floor.thickness * s;

    let baseY = 0;
    if (i > 0) {
      const par = bowls[i - 1];
      baseY = par.baseY + par.footH + par.floorT;
    }

    const th = p.interiorDepth * s + floorT + footH;
    bowls.push({ i, label: `Bowl ${i + 1}`, s, outer: o, inner: genInner(o, p.wallThickness),
      h: th, intDepth: p.interiorDepth * s, rim: p.rimDiameter * s,
      footOuter: fOuter, footInner: fInner,
      footH, floorT, baseY,
      wallBase,
    });
  }
  return bowls;
}
