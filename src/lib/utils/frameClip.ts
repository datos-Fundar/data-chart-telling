import type { MarkerConfig } from '$lib/types/markers/all';

/**
 * Whether each marker kind is clipped to the plot's frame by default. A
 * marker's own `clip` overrides it. Typed over every kind, so a new kind
 * can't be added without choosing its default.
 */
const FRAME_CLIP_DEFAULTS = {
	area: true,
	arrow: false,
	bar: true,
	bollinger: true,
	brush: false,
	box: true,
	cell: true,
	component: false,
	contour: false,
	delaunayLink: true,
	delaunayMesh: true,
	delta: false,
	density: true,
	difference: true,
	dot: false,
	geo: false,
	'geo-component': false,
	'geo-hover': false,
	graticule: false,
	hover: false,
	hull: true,
	image: false,
	inset: false,
	line: true,
	link: false,
	raster: true,
	rect: true,
	regression: true,
	rule: true,
	sphere: false,
	text: false,
	tick: true,
	trail: true,
	vector: false,
	voronoi: true,
	voronoiMesh: true,
	waffle: true
} satisfies Record<MarkerConfig['type'], boolean>;

/**
 * Whether a marker is clipped to the plot's frame: its own `clip` when set,
 * otherwise its kind's default.
 */
export function isFrameClipped(marker: { type: MarkerConfig['type']; clip?: unknown }): boolean {
	return (marker.clip ?? FRAME_CLIP_DEFAULTS[marker.type]) === true;
}
