import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import App from "./App.jsx";

// Helper: render App and return the container
function renderApp() {
  const { container } = render(<App />);
  return container;
}

describe("CrossSection SVG rendering", () => {
  it("renders an SVG element", () => {
    const c = renderApp();
    const svgs = c.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("SVG contains grid pattern definition", () => {
    const c = renderApp();
    const svgs = c.querySelectorAll("svg");
    const svgHTML = Array.from(svgs).map(s => s.innerHTML).join("");
    expect(svgHTML).toContain('id="mmgrid"');
  });

  it("grid rect covers full SVG via url(#mmgrid)", () => {
    const c = renderApp();
    const gridRect = c.querySelector('rect[fill="url(#mmgrid)"]');
    expect(gridRect).not.toBeNull();
  });

  it("clay body uses fillRule evenodd (grid shows through)", () => {
    const c = renderApp();
    const paths = c.querySelectorAll("path");
    const evenoddPaths = Array.from(paths).filter(
      p => p.getAttribute("fill-rule") === "evenodd"
    );
    expect(evenoddPaths.length).toBeGreaterThan(0);
  });

  it("clay body path contains multiple subpaths (M...Z M...Z)", () => {
    const c = renderApp();
    const paths = c.querySelectorAll("path");
    const evenoddPaths = Array.from(paths).filter(
      p => p.getAttribute("fill-rule") === "evenodd"
    );
    for (const path of evenoddPaths) {
      const d = path.getAttribute("d");
      const mCount = (d.match(/M/g) || []).length;
      const zCount = (d.match(/Z/g) || []).length;
      // Should have outer + inner + foot = at least 3 subpaths
      expect(mCount).toBeGreaterThanOrEqual(2);
      expect(zCount).toBeGreaterThanOrEqual(2);
    }
  });

  it("has center dashed line", () => {
    const c = renderApp();
    const lines = c.querySelectorAll("line");
    const dashed = Array.from(lines).filter(
      l => l.getAttribute("stroke-dasharray")
    );
    expect(dashed.length).toBeGreaterThan(0);
  });

  it("has TABLE label text", () => {
    const c = renderApp();
    const texts = Array.from(c.querySelectorAll("text"));
    const tableText = texts.find(t => t.textContent === "TABLE");
    expect(tableText).not.toBeNull();
  });
});

describe("Rim type selector", () => {
  it("shows rim buttons in the design tab", () => {
    const c = renderApp();
    const buttons = Array.from(c.querySelectorAll("button"));
    const rimButton = buttons.find(b => b.textContent.includes("Rounded"));
    expect(rimButton).not.toBeNull();
  });

  it("shows 'best' badge for recommended rim types", () => {
    const c = renderApp();
    const bestBadges = Array.from(c.querySelectorAll("span")).filter(
      s => s.textContent === "best"
    );
    expect(bestBadges.length).toBeGreaterThan(0);
  });

  it("shows 'Show all' toggle", () => {
    const c = renderApp();
    const buttons = Array.from(c.querySelectorAll("button"));
    const toggle = buttons.find(b => b.textContent === "Show all");
    expect(toggle).not.toBeNull();
  });
});

describe("Profile selector", () => {
  it("renders profile selection buttons", () => {
    const c = renderApp();
    const buttons = Array.from(c.querySelectorAll("button"));
    const fargklar = buttons.find(b => b.textContent.includes("Färgklar"));
    expect(fargklar).not.toBeNull();
  });

  it("renders mug profiles", () => {
    const c = renderApp();
    const buttons = Array.from(c.querySelectorAll("button"));
    const cappuccino = buttons.find(b => b.textContent.includes("Cappuccino"));
    expect(cappuccino).not.toBeNull();
  });
});

describe("Bowl nesting selector", () => {
  it("renders bowl selection buttons (All + numbered)", () => {
    const c = renderApp();
    const buttons = Array.from(c.querySelectorAll("button"));
    const allBtn = buttons.find(b => b.textContent.trim() === "All");
    expect(allBtn).not.toBeNull();
    const b1 = buttons.find(b => b.textContent.trim() === "B1");
    expect(b1).not.toBeNull();
  });
});
