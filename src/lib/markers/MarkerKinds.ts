import type { MarkerConfig } from '$lib/types/markers/all';
import type { MarkerTraits } from '$lib/types/markers/traits';

type Kind = MarkerConfig['type'];

/**
 * Every marker kind's traits, in one row each. Typed over every kind, so a
 * new kind can't be added without declaring all of its traits here.
 */
export class MarkerKinds {
	static readonly traits = {
		area: { clip: true, drawsRows: true, legendSymbol: 'area' },
		arrow: { clip: false, drawsRows: true },
		bar: { clip: true, drawsRows: true, legendSymbol: 'bar' },
		bollinger: { clip: true, drawsRows: true, legendSymbol: 'line' },
		brush: { clip: false, drawsRows: false },
		box: { clip: true, drawsRows: true, legendSymbol: 'bar' },
		cell: { clip: true, drawsRows: true, legendSymbol: 'cell' },
		component: { clip: false, drawsRows: false },
		contour: { clip: false, drawsRows: false },
		delaunayLink: { clip: true, drawsRows: true },
		delaunayMesh: { clip: true, drawsRows: true },
		delta: { clip: false, drawsRows: false },
		density: { clip: true, drawsRows: true, legendSymbol: 'area' },
		difference: { clip: true, drawsRows: true, legendSymbol: 'area' },
		dot: { clip: false, drawsRows: true, legendSymbol: 'dot' },
		geo: { clip: false, drawsRows: false },
		'geo-component': { clip: false, drawsRows: true },
		'geo-hover': { clip: false, drawsRows: false },
		graticule: { clip: false, drawsRows: false },
		hover: { clip: false, drawsRows: false },
		hull: { clip: true, drawsRows: true, legendSymbol: 'area' },
		image: { clip: false, drawsRows: true },
		inset: { clip: false, drawsRows: false },
		line: { clip: true, drawsRows: true, legendSymbol: 'line' },
		link: { clip: false, drawsRows: false },
		raster: { clip: true, drawsRows: true },
		rect: { clip: true, drawsRows: true, legendSymbol: 'rect' },
		regression: { clip: true, drawsRows: true, legendSymbol: 'line' },
		rule: { clip: true, drawsRows: false, legendSymbol: 'line' },
		sphere: { clip: false, drawsRows: false },
		text: { clip: false, drawsRows: true },
		tick: { clip: true, drawsRows: true },
		trail: { clip: true, drawsRows: true, legendSymbol: 'line' },
		vector: { clip: false, drawsRows: false },
		violin: { clip: true, drawsRows: true, legendSymbol: 'area' },
		voronoi: { clip: true, drawsRows: true },
		voronoiMesh: { clip: true, drawsRows: true },
		waffle: { clip: true, drawsRows: true }
	} satisfies Record<Kind, MarkerTraits>;

	/** The traits of a marker kind, or `undefined` for a type no kind declares. */
	static of(type: string | undefined): MarkerTraits | undefined {
		return type !== undefined && type in MarkerKinds.traits
			? MarkerKinds.traits[type as Kind]
			: undefined;
	}
}
