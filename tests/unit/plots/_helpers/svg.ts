import { vi } from 'vitest';

/** Waits until at least one <svg> is present in the container. */
export async function waitForSvg(container: Element): Promise<SVGElement> {
  let svg: SVGElement | null = null;
  await vi.waitFor(
    () => {
      svg = container.querySelector('svg');
      if (!svg) throw new Error('SVG not yet rendered');
    },
    { timeout: 3000, interval: 50 },
  );
  return svg!;
}

// svelteplot wraps each mark kind in its own <g class="…">; scoping by that
// class (rather than guessing tag names) is what actually distinguishes a
// line from a dot — both render as <path>, since Dot draws a d3.symbol path
// rather than an <svg:circle>.
export function countLinePaths(svg: SVGElement): number {
  return svg.querySelectorAll('g.lines path').length;
}

export function countDotMarks(svg: SVGElement): number {
  return svg.querySelectorAll('g.dot path').length;
}

export function countTextLabels(svg: SVGElement): number {
  return svg.querySelectorAll('g.text text').length;
}

// BarPlot renders vertical bars as <BarY> (g.bar-y) or, in horizontal
// orientation, as <BarX> (g.bar-x) — either way each bar is a <rect>.
export function countBarRects(svg: SVGElement): number {
  return svg.querySelectorAll('g.bar-y rect, g.bar-x rect').length;
}

export function countCells(svg: SVGElement): number {
  return svg.querySelectorAll('g.cell rect').length;
}

// GeoPlot's base map, `graticule`, and `sphere` markers all render through
// svelteplot's `Geo` mark — `Graticule`/`Sphere` are thin wrappers around
// `Geo` internally. `Geo` only puts the `geo` class on its wrapping `<g>`
// when it draws more than one feature per call (`scaledData.length > 1`);
// for a single-feature call (as `Sphere`/`Graticule` and any single-feature
// segment-style group always are) the class lands on the `<path>` itself
// instead — matching both keeps the count accurate either way. `vector` and
// `link` each render as their own wrapping class; `contour` gets none from
// svelteplot itself, so `Plot.svelte` passes an explicit `class="contour"`
// for the same kind of scoping.
export function countGeoPaths(svg: SVGElement): number {
  return svg.querySelectorAll('g.geo path, path.geo').length;
}

export function countVectorMarks(svg: SVGElement): number {
  return svg.querySelectorAll('g.vector path').length;
}

// `link` markers render via `Geo` (see `Plot.svelte`) with an explicit
// `class="link"` passed through — subject to the same single-vs-multi-feature
// class placement quirk as `countGeoPaths`.
export function countLinkPaths(svg: SVGElement): number {
  return svg.querySelectorAll('g.link path, path.link').length;
}

export function countContourPaths(svg: SVGElement): number {
  return svg.querySelectorAll('g.contour path').length;
}
