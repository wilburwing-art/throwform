import { describe, it, expect } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
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

describe("Profile switching", () => {
  it("does not crash when switching to each profile", () => {
    const { container } = render(<App />);
    const profileNames = ["Mug", "Cappuccino", "Ramen", "Cereal", "Pasta", "Salad", "Planter", "Custom"];
    for (const name of profileNames) {
      const buttons = Array.from(container.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent.includes(name));
      if (btn) {
        act(() => { fireEvent.click(btn); });
        const svgs = container.querySelectorAll("svg");
        expect(svgs.length).toBeGreaterThan(0);
      }
    }
  });

  it("does not crash when selecting individual bowls", () => {
    const { container } = render(<App />);
    const buttons = Array.from(container.querySelectorAll("button"));
    for (const label of ["B1", "B2", "B3"]) {
      const btn = buttons.find(b => b.textContent.trim() === label);
      if (btn) {
        act(() => { fireEvent.click(btn); });
        const svgs = container.querySelectorAll("svg");
        expect(svgs.length).toBeGreaterThan(0);
      }
    }
  });

  it("does not crash switching between all profile pairs", () => {
    const { container } = render(<App />);
    const profileNames = ["Färgklar", "Mug", "Cappuccino", "Ramen", "Cereal", "Pasta", "Salad", "Planter"];
    // Switch in each direction
    for (let i = 0; i < profileNames.length; i++) {
      for (let j = 0; j < profileNames.length; j++) {
        if (i === j) continue;
        const buttons1 = Array.from(container.querySelectorAll("button"));
        const btn1 = buttons1.find(b => b.textContent.includes(profileNames[i]));
        if (btn1) act(() => { fireEvent.click(btn1); });
        const buttons2 = Array.from(container.querySelectorAll("button"));
        const btn2 = buttons2.find(b => b.textContent.includes(profileNames[j]));
        if (btn2) act(() => { fireEvent.click(btn2); });
        // Should still have SVGs and evenodd paths
        const paths = container.querySelectorAll('path[fill-rule="evenodd"]');
        expect(paths.length).toBeGreaterThan(0);
      }
    }
  });

  it("SVG paths have no NaN values after profile switch", () => {
    const { container } = render(<App />);
    const profileNames = ["Mug", "Ramen", "Pasta", "Planter"];
    for (const name of profileNames) {
      const buttons = Array.from(container.querySelectorAll("button"));
      const btn = buttons.find(b => b.textContent.includes(name));
      if (btn) {
        act(() => { fireEvent.click(btn); });
        const allPaths = container.querySelectorAll("path");
        for (const path of allPaths) {
          const d = path.getAttribute("d");
          if (d) expect(d).not.toContain("NaN");
        }
      }
    }
  });
});
