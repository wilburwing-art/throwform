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
// RIB POLYGON — constrained shape for laser-cut beech wood
// ═══════════════════════════════════════════════════════════
// One rib per bowl. Left edge = inner wall curve, right edge = outer wall curve,
// bottom = flat (wheel true), top = straight connecting rims.
// Rounded fillets at bottom corners, hanging hole in center.

export function generateRibPolygon(bowl, p, ribGap, opts = {}) {
  const { filletRadius = 2.5, holeRadius = 3.5 } = opts;

  const stepH = bowl.footH + bowl.floorT;
  const innerWall = bowl.inner;
  const outerWall = bowl.outer;

  const innerBaseR = innerWall[0][0];
  const outerBaseR = outerWall[0][0];

  const wallH = Math.max(
    ...innerWall.map(([, h]) => h),
    ...outerWall.map(([, h]) => h),
  );
  const totalH = stepH + wallH;
  const gap = ribGap;

  // Clamp fillet to avoid overlapping geometry
  const fr = Math.max(0.5, Math.min(filletRadius, stepH * 0.4, gap * 0.1));

  // Quarter-circle arc approximation
  const filletArc = (cx, cy, r, startDeg, endDeg, n = 8) => {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const a = (startDeg + (endDeg - startDeg) * i / n) * Math.PI / 180;
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
    return pts;
  };

  // Assemble polygon clockwise:
  // bottom-left fillet → bottom → bottom-right fillet → right step →
  // outer curve up → top → inner curve down → left step → bottom-left fillet
  const points = [];

  // 1. Bottom edge (after left fillet, before right fillet)
  points.push([fr, 0]);
  points.push([gap - fr, 0]);

  // 2. Bottom-right fillet: center (gap-fr, fr), arc 270°→360°
  const brArc = filletArc(gap - fr, fr, fr, 270, 360);
  for (let i = 1; i < brArc.length; i++) points.push(brArc[i]);

  // 3. Right edge: vertical through step zone
  points.push([gap, stepH]);

  // 4. Right edge: outer wall curve (floor → rim)
  for (let i = 0; i < outerWall.length; i++) {
    const sweep = outerWall[i][0] - outerBaseR;
    points.push([gap + sweep, stepH + outerWall[i][1]]);
  }

  // 5. Left edge: inner wall curve (rim → floor, reversed)
  for (let i = innerWall.length - 1; i >= 0; i--) {
    const sweep = innerWall[i][0] - innerBaseR;
    points.push([-sweep, stepH + innerWall[i][1]]);
  }

  // 6. Left edge: vertical down through step zone
  points.push([0, stepH]);
  points.push([0, fr]);

  // 7. Bottom-left fillet: center (fr, fr), arc 180°→270°
  const blArc = filletArc(fr, fr, fr, 180, 270);
  for (let i = 1; i < blArc.length; i++) points.push(blArc[i]);

  // Bounds
  const allX = points.map(([x]) => x);
  const allY = points.map(([, y]) => y);
  const minX = Math.min(...allX);
  const maxX = Math.max(...allX);
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  // Hanging hole: center of bounding box, offset slightly above midpoint
  const holeCx = (minX + maxX) / 2;
  const holeCy = totalH * 0.55;

  return {
    points,
    hole: { cx: holeCx, cy: holeCy, r: holeRadius },
    gap,
    totalH,
    stepH,
    wallH,
    minX, maxX, minY, maxY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

// ═══════════════════════════════════════════════════════════
// EXPORT CONTENT GENERATORS — pure functions returning strings
// ═══════════════════════════════════════════════════════════

// Generate rib tool SVG string for laser cutting (beech wood)
// One combined rib per bowl. Red (#FF0000) hairline cut paths,
// black (#000000) engrave text, separated into layers.
export function generateRibSVG(bowls, p, ribGap) {
  const CUT = "#FF0000";
  const ENGRAVE = "#000000";
  const HAIRLINE = "0.01";

  const ribs = bowls.map((b, i) => ({
    poly: generateRibPolygon(b, p, ribGap),
    label: `B${i + 1} · ${b.rim.toFixed(0)}mm`,
  }));

  // Layout: ribs horizontally with 20mm spacing
  const spacing = 20;
  let totalW = spacing;
  const positions = [];
  ribs.forEach(r => {
    positions.push(totalW - r.poly.minX);
    totalW += r.poly.width + spacing;
  });

  const maxH = Math.max(...ribs.map(r => r.poly.height));
  const labelMargin = 25;
  const svgH = maxH + labelMargin + 10;

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${totalW.toFixed(1)} ${svgH.toFixed(1)}" width="${totalW.toFixed(1)}mm" height="${svgH.toFixed(1)}mm">\n`;

  // Engrave layer
  svg += `<g id="engrave" stroke="none" fill="${ENGRAVE}">\n`;
  svg += `<text x="10" y="12" font-family="monospace" font-size="7">${p.name} Rib Set — 1:1mm — ${ribGap.toFixed(1)}mm gap</text>\n`;
  ribs.forEach((r, i) => {
    const cx = positions[i] + (r.poly.minX + r.poly.maxX) / 2;
    svg += `<text x="${cx.toFixed(1)}" y="${(svgH - 3).toFixed(1)}" text-anchor="middle" font-family="monospace" font-size="5">${r.label}</text>\n`;
  });
  svg += `</g>\n`;

  // Cut layer — path outlines + hanging hole circles
  svg += `<g id="cut" fill="none" stroke="${CUT}" stroke-width="${HAIRLINE}">\n`;
  ribs.forEach((r, i) => {
    const xOff = positions[i];
    const yOff = labelMargin - 5;

    // Polygon outline as path
    const d = r.poly.points.map(([px, py], j) => {
      const x = (px + xOff).toFixed(2);
      const y = (maxH - py + yOff).toFixed(2);
      return `${j === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ') + ' Z';
    svg += `<path d="${d}"/>\n`;

    // Hanging hole
    const hx = (r.poly.hole.cx + xOff).toFixed(2);
    const hy = (maxH - r.poly.hole.cy + yOff).toFixed(2);
    svg += `<circle cx="${hx}" cy="${hy}" r="${r.poly.hole.r.toFixed(2)}"/>\n`;
  });
  svg += `</g>\n`;

  svg += `</svg>`;
  return svg;
}

// Generate hand-cut template SVG on A4 landscape
export function generateTemplateSVG(bowls, p, ribGap) {
  const ribs = bowls.map((b, i) => ({
    poly: generateRibPolygon(b, p, ribGap),
    label: `B${i + 1} · ${b.rim.toFixed(0)}mm`,
  }));

  const pageW = 297, pageH = 210, margin = 15;
  const maxH = Math.max(...ribs.map(r => r.poly.height));
  const contentW = ribs.reduce((s, r) => s + r.poly.width + 12, 0);
  const scaleH = (pageH - margin * 2 - 30) / maxH;
  const scaleW = (pageW - margin * 2 - 10) / contentW;
  const scale = Math.min(scaleH, scaleW, 1);

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ${pageW} ${pageH}" width="${pageW}mm" height="${pageH}mm">\n`;

  // Page border + crop marks
  svg += `<rect x="${margin}" y="${margin}" width="${pageW - margin * 2}" height="${pageH - margin * 2}" fill="none" stroke="#ccc" stroke-width="0.3" stroke-dasharray="4,2"/>\n`;
  [[margin, margin], [pageW - margin, margin], [margin, pageH - margin], [pageW - margin, pageH - margin]].forEach(([x, y]) => {
    svg += `<line x1="${x - 5}" y1="${y}" x2="${x + 5}" y2="${y}" stroke="#999" stroke-width="0.3"/>\n`;
    svg += `<line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" stroke="#999" stroke-width="0.3"/>\n`;
  });

  // Header
  svg += `<text x="${margin + 2}" y="${margin + 8}" font-family="monospace" font-size="5" fill="#666">ThrowForm — ${p.name} — Hand Cut Template — PRINT AT 100% / NO SCALING</text>\n`;
  svg += `<text x="${margin + 2}" y="${margin + 14}" font-family="monospace" font-size="3.5" fill="#999">Gap: ${ribGap.toFixed(1)}mm · Wall: ${p.wallThickness}mm · Scale: ${scale === 1 ? "1:1" : scale.toFixed(2) + "x"}</text>\n`;

  // Calibration ruler
  const rulerX = pageW - margin - 52, rulerY = margin + 5;
  svg += `<line x1="${rulerX}" y1="${rulerY}" x2="${rulerX + 50}" y2="${rulerY}" stroke="#333" stroke-width="0.4"/>\n`;
  for (let i = 0; i <= 5; i++) {
    const x = rulerX + i * 10;
    svg += `<line x1="${x}" y1="${rulerY - 2}" x2="${x}" y2="${rulerY + 2}" stroke="#333" stroke-width="0.3"/>\n`;
    if (i < 5) svg += `<text x="${x + 5}" y="${rulerY + 6}" text-anchor="middle" font-family="monospace" font-size="3" fill="#666">${i * 10 + 10}</text>\n`;
  }
  svg += `<text x="${rulerX - 1}" y="${rulerY + 2}" text-anchor="end" font-family="monospace" font-size="3" fill="#666">0mm</text>\n`;

  // Ribs
  let xO = margin + 5;
  const yBase = margin + 22;
  ribs.forEach(r => {
    const poly = r.poly;
    const w = poly.width * scale;
    const h = poly.height * scale;

    // Convert polygon points to SVG coordinates (Y-flipped, scaled)
    const toSvg = ([px, py]) => [
      ((px - poly.minX) * scale).toFixed(2),
      (poly.height * scale - (py - poly.minY) * scale).toFixed(2),
    ];

    const pts = poly.points.map(pt => toSvg(pt).join(",")).join(" ");

    svg += `<g transform="translate(${xO.toFixed(1)},${yBase})">\n`;
    svg += `  <text x="${(w / 2).toFixed(1)}" y="-3" text-anchor="middle" font-family="monospace" font-size="4" fill="#7a9a7e">${r.label}</text>\n`;
    svg += `  <polygon points="${pts}" fill="#f5f0e8" stroke="#333" stroke-width="0.6"/>\n`;
    svg += `  <line x1="${(w / 2).toFixed(1)}" y1="0" x2="${(w / 2).toFixed(1)}" y2="${h.toFixed(1)}" stroke="#ccc" stroke-width="0.2" stroke-dasharray="2,2"/>\n`;

    // Hanging hole
    const [hcx, hcy] = toSvg([poly.hole.cx, poly.hole.cy]);
    svg += `  <circle cx="${hcx}" cy="${hcy}" r="${(poly.hole.r * scale).toFixed(1)}" fill="none" stroke="#999" stroke-width="0.3" stroke-dasharray="1,1"/>\n`;

    // Flat base label
    svg += `  <text x="${(w / 2).toFixed(1)}" y="${(h + 5).toFixed(1)}" text-anchor="middle" font-family="monospace" font-size="3" fill="#999">flat base — wheel true</text>\n`;
    svg += `</g>\n`;
    xO += w + 12;
  });

  svg += `</svg>`;
  return svg;
}

// Generate DXF (AC1015/R2000) for laser cutting
export function generateRibDXF(bowls, p, ribGap) {
  const ribs = bowls.map((b, i) => ({
    poly: generateRibPolygon(b, p, ribGap),
    label: `B${i + 1} ${b.rim.toFixed(0)}mm`,
  }));

  // Layout: same as SVG
  const spacing = 20;
  let totalW = spacing;
  const positions = [];
  ribs.forEach(r => {
    positions.push(totalW - r.poly.minX);
    totalW += r.poly.width + spacing;
  });
  const maxH = Math.max(...ribs.map(r => r.poly.height));

  let dxf = '';

  // HEADER
  dxf += '0\nSECTION\n2\nHEADER\n';
  dxf += '9\n$ACADVER\n1\nAC1015\n';
  dxf += '9\n$INSUNITS\n70\n4\n'; // millimeters
  dxf += '0\nENDSEC\n';

  // TABLES (layer definitions)
  dxf += '0\nSECTION\n2\nTABLES\n';
  dxf += '0\nTABLE\n2\nLAYER\n70\n2\n';
  // CUT layer — red
  dxf += '0\nLAYER\n2\nCUT\n70\n0\n62\n1\n6\nCONTINUOUS\n';
  // ENGRAVE layer — black (color 7 = white/black)
  dxf += '0\nLAYER\n2\nENGRAVE\n70\n0\n62\n7\n6\nCONTINUOUS\n';
  dxf += '0\nENDTAB\n';
  dxf += '0\nENDSEC\n';

  // ENTITIES
  dxf += '0\nSECTION\n2\nENTITIES\n';

  ribs.forEach((r, i) => {
    const xOff = positions[i];
    const pts = r.poly.points;
    const n = pts.length;

    // LWPOLYLINE for rib outline
    dxf += '0\nLWPOLYLINE\n8\nCUT\n90\n' + n + '\n70\n1\n'; // 70=1 → closed
    pts.forEach(([px, py]) => {
      dxf += '10\n' + (px + xOff).toFixed(3) + '\n20\n' + py.toFixed(3) + '\n';
    });

    // CIRCLE for hanging hole
    dxf += '0\nCIRCLE\n8\nCUT\n';
    dxf += '10\n' + (r.poly.hole.cx + xOff).toFixed(3) + '\n';
    dxf += '20\n' + r.poly.hole.cy.toFixed(3) + '\n';
    dxf += '40\n' + r.poly.hole.r.toFixed(3) + '\n';

    // TEXT label
    dxf += '0\nTEXT\n8\nENGRAVE\n';
    dxf += '10\n' + ((r.poly.minX + r.poly.maxX) / 2 + xOff).toFixed(3) + '\n';
    dxf += '20\n' + (maxH + 5).toFixed(3) + '\n';
    dxf += '40\n5\n'; // text height
    dxf += '1\n' + r.label + '\n';
  });

  dxf += '0\nENDSEC\n';
  dxf += '0\nEOF\n';

  return dxf;
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
