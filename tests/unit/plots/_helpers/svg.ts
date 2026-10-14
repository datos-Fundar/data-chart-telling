import { vi } from 'vitest';

/** Waits until the plot's own <svg> (else any) is present in the container - not a legend icon's. */
export async function waitForSvg(container: Element): Promise<SVGElement> {
	let svg: SVGElement | null = null;
	await vi.waitFor(
		() => {
			svg = container.querySelector('.dct-plot svg') ?? container.querySelector('svg');
			if (!svg) throw new Error('SVG not yet rendered');
		},
		{ timeout: 3000, interval: 50 }
	);
	return svg!;
}

// svelteplot wraps each mark kind in its own <g class="…">; scoping by that
// class (rather than guessing tag names) is what actually distinguishes a
// line from a dot - both render as <path>, since Dot draws a d3.symbol path
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
// orientation, as <BarX> (g.bar-x) - either way each bar is a <rect>.
export function countBarRects(svg: SVGElement): number {
	return svg.querySelectorAll('g.bar-y rect, g.bar-x rect').length;
}

export function countCells(svg: SVGElement): number {
	return svg.querySelectorAll('g.cell rect').length;
}

// HoverMarker's optional `areaX`/`areaY` highlight - a plain `<rect>`
// tagged with this class (see `BarMarker.svelte`'s `role: 'highlight'`),
// distinct from a bar/pyramid plot's own `g.bar-y rect`/`g.bar-x rect` marks.
export function countHoverAreas(svg: SVGElement): number {
	return svg.querySelectorAll('rect.hover-area').length;
}

// GeoPlot's base map, `graticule`, and `sphere` markers all render through
// svelteplot's `Geo` mark - `Graticule`/`Sphere` are thin wrappers around
// `Geo` internally. `Geo` only puts the `geo` class on its wrapping `<g>`
// when it draws more than one feature per call (`scaledData.length > 1`);
// for a single-feature call (as `Sphere`/`Graticule` and any single-feature
// segment-style group always are) the class lands on the `<path>` itself
// instead - matching both keeps the count accurate either way. `vector` and
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
// `class="link"` passed through - subject to the same single-vs-multi-feature
// class placement quirk as `countGeoPaths`.
export function countLinkPaths(svg: SVGElement): number {
	return svg.querySelectorAll('g.link path, path.link').length;
}

export function countContourPaths(svg: SVGElement): number {
	return svg.querySelectorAll('g.contour path').length;
}

// svelteplot's `RegressionX`/`RegressionY` wrap their output in a
// `g.regression-x`/`g.regression-y` group, named for the *independent* axis
// (x for the default `RegressionY`, y for `RegressionX`) rather than which
// component was used - confirmed empirically, not documented.
export function countRegressionMarks(svg: SVGElement): number {
	return svg.querySelectorAll('g.regression-x, g.regression-y').length;
}

export function countBollingerMarks(svg: SVGElement): number {
	return svg.querySelectorAll('g.bollinger').length;
}

// svelteplot's `AreaX`/`AreaY` put the `area` class directly on the rendered
// `<path>`, not on a wrapping `<g>` (unlike most other mark kinds) - confirmed
// empirically. `DifferenceY` reuses the same `Area` component internally, so
// this also matches a `difference` marker's own paths; use
// `countDifferencePaths` to scope to just those.
export function countAreaPaths(svg: SVGElement): number {
	return svg.querySelectorAll('path.area').length;
}

// svelteplot's `Density` puts no class of its own on its rendered group -
// `DensityMarker.svelte` passes an explicit `class="density"` for the same
// class-based scoping every other marker kind gets from svelteplot itself.
export function countDensityPaths(svg: SVGElement): number {
	return svg.querySelectorAll('g.density path').length;
}

// `BoxY`'s own wrapping class is `box-y`, `BoxX`'s is `box-x` - confirmed
// empirically, matching `bar-x`/`bar-y`'s own convention.
export function countBoxMarks(svg: SVGElement): number {
	return svg.querySelectorAll('g.box-x, g.box-y').length;
}

export function countHullPaths(svg: SVGElement): number {
	return svg.querySelectorAll('g.hull path').length;
}

// `DifferenceY` renders two groups per call - `g.positive.difference` and
// `g.negative.difference` - each containing a clip-mask copy of `path.area`
// nested inside its own `<clipPath>` (never rendered, just a mask definition)
// plus the one actually-visible `path.area` as its own direct child;
// `>` scopes to just the visible one.
export function countDifferencePaths(svg: SVGElement): number {
	return svg.querySelectorAll('g.difference > path.area').length;
}

export function countArrowMarks(svg: SVGElement): number {
	return svg.querySelectorAll('g.arrow path').length;
}

// The class names below are svelteplot's own wrapping `<g>` per mark - confirmed
// empirically, same as the other counters in this file.
// Brush's pointer-capture layer is a `Frame` (`rect.frame`) - this matches the
// plot's own `frame` style too, so callers must use it only with no `styles.frame`;
// its drawn selection is `rect.brush-rect`, present only while `enabled`.
export function countBrushSelections(svg: SVGElement): number {
	return svg.querySelectorAll('rect.brush-rect').length;
}

export function countDelaunayLinkPaths(svg: SVGElement): number {
	return svg.querySelectorAll('g.delaunay-link path').length;
}

export function countDelaunayMeshPaths(svg: SVGElement): number {
	return svg.querySelectorAll('g.delaunay-mesh path').length;
}

export function countVoronoiPaths(svg: SVGElement): number {
	return svg.querySelectorAll('g.voronoi path').length;
}

export function countVoronoiMeshPaths(svg: SVGElement): number {
	return svg.querySelectorAll('g.voronoi-mesh path').length;
}

export function countImageMarks(svg: SVGElement): number {
	return svg.querySelectorAll('image').length;
}

export function countRasterMarks(svg: SVGElement): number {
	// svelteplot's `Raster` draws one bare `<image preserveAspectRatio="none">` (no wrapper class).
	return svg.querySelectorAll('image[preserveAspectRatio="none"]').length;
}

export function countTickMarks(svg: SVGElement): number {
	return svg.querySelectorAll('g.tick-x line, g.tick-y line').length;
}

export function countTrailPaths(svg: SVGElement): number {
	return svg.querySelectorAll('g.trail path').length;
}

export function countWaffleMarks(svg: SVGElement): number {
	return svg.querySelectorAll('g.waffle-x, g.waffle-y').length;
}
