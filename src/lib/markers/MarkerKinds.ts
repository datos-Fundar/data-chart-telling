import type { MarkerConfig } from '$lib/types/markers/all';
import type { InheritedChannel, MarkerTraits } from '$lib/types/markers/traits';

type Kind = MarkerConfig['type'];

const SCALED: InheritedChannel[] = ['color', 'opacity', 'symbol', 'r', 'length'];

/**
 * Every marker kind's traits, in one row each. Typed over every kind, so a
 * new kind can't be added without declaring all of its traits here.
 */
export class MarkerKinds {
	static readonly traits = {
		area: {
			inherits: ['x', 'y', 'grouping', 'color', 'opacity'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'area'
		},
		arrow: { clip: false, drawsRows: true },
		band: { clip: true, drawsRows: false, legendSymbol: 'rect' },
		bar: {
			inherits: ['x', 'y', 'color'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'bar',
			labels: { default: 'box', box: 'band' }
		},
		bollinger: {
			inherits: ['x', 'y'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'line'
		},
		brush: { clip: false, drawsRows: false },
		box: {
			inherits: ['x', 'y'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'bar'
		},
		cell: {
			inherits: ['x', 'y', 'color', 'opacity'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'cell',
			labels: { default: 'box', box: 'cell' }
		},
		component: { clip: false, drawsRows: false },
		contour: { clip: false, drawsRows: false },
		delaunayLink: {
			inherits: ['x', 'y', 'grouping', 'color'],
			clip: true,
			drawsRows: true
		},
		delaunayMesh: {
			inherits: ['x', 'y', 'grouping', 'color'],
			clip: true,
			drawsRows: true
		},
		delta: { clip: false, drawsRows: false },
		density: {
			inherits: ['x', 'y', 'grouping', 'color'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'area'
		},
		difference: {
			inherits: ['x', 'y'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'area'
		},
		dot: {
			inherits: ['x', 'y', 'color', 'opacity', 'symbol', 'r'],
			clip: false,
			drawsRows: true,
			legendSymbol: 'dot'
		},
		geo: { clip: false, drawsRows: false },
		'geo-component': { clip: false, drawsRows: true },
		'geo-hover': { clip: false, drawsRows: false },
		graticule: { clip: false, drawsRows: false },
		hover: { clip: false, drawsRows: false },
		hull: {
			inherits: ['x', 'y', 'grouping', 'color'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'area'
		},
		image: {
			inherits: ['x', 'y'],
			clip: false,
			drawsRows: true
		},
		inset: { clip: false, drawsRows: false },
		line: {
			inherits: ['x', 'y', 'grouping', 'color'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'line'
		},
		link: { clip: false, drawsRows: false },
		raster: { clip: true, drawsRows: true },
		rect: {
			inherits: ['x', 'y', 'color', 'opacity'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'rect',
			labels: { default: 'box', box: 'edges' }
		},
		regression: {
			inherits: ['x', 'y'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'line'
		},
		rule: { clip: true, drawsRows: false, legendSymbol: 'line' },
		sphere: { clip: false, drawsRows: false },
		text: {
			inherits: ['x', 'y'],
			clip: false,
			drawsRows: true
		},
		tick: {
			inherits: ['color'],
			clip: true,
			drawsRows: true
		},
		trail: {
			inherits: ['x', 'y', 'grouping', 'color', 'opacity', 'r'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'line'
		},
		vector: { inherits: ['length'], clip: false, drawsRows: false },
		violin: {
			inherits: ['x', 'y'],
			clip: true,
			drawsRows: true,
			legendSymbol: 'area'
		},
		voronoi: {
			inherits: ['x', 'y', 'grouping', 'color'],
			clip: true,
			drawsRows: true
		},
		voronoiMesh: {
			inherits: ['x', 'y', 'grouping', 'color'],
			clip: true,
			drawsRows: true
		},
		waffle: {
			inherits: ['x', 'y', 'color'],
			clip: true,
			drawsRows: true,
			labels: { default: 'box', box: 'band' }
		}
	} satisfies Record<Kind, MarkerTraits>;

	/** The traits of a marker kind, or `undefined` for a type no kind declares. */
	static of(type: string | undefined): MarkerTraits | undefined {
		return type !== undefined && type in MarkerKinds.traits
			? MarkerKinds.traits[type as Kind]
			: undefined;
	}

	static inherits(type: string | undefined, channel: InheritedChannel): boolean {
		return MarkerKinds.of(type)?.inherits?.includes(channel) ?? false;
	}

	/** Whether the kind takes the plot's scales: it inherits a channel that has one. */
	static inheritsScales(type: string | undefined): boolean {
		return SCALED.some((channel) => MarkerKinds.inherits(type, channel));
	}
}
