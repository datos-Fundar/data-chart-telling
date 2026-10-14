import type { MarkerConfig } from '$lib/types/markers/all';

/**
 * How marks are clipped to the plot's frame. Which markers are clipped is
 * per kind, with a marker's own `clip` overriding it, and a clipped mark may
 * reach `top`/`right`/`bottom`/`left` px past the frame before it's cut
 * (from `frameClip.tolerance`).
 */
export class FrameClipping {
	static readonly defaults = {
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

	constructor(
		readonly top: number,
		readonly right: number,
		readonly bottom: number,
		readonly left: number
	) {}

	/**
	 * Parses a tolerance: a number for all four sides, or CSS shorthand px
	 * values for 1-4 of them. Throws on anything else, so a bad config fails loudly.
	 */
	static parse(tolerance: number | string): FrameClipping {
		const tokens =
			typeof tolerance === 'number' ? [String(tolerance)] : tolerance.trim().split(/\s+/);
		if (tokens.length < 1 || tokens.length > 4) {
			throw new Error(`frameClip.tolerance takes 1-4 values, got "${tolerance}"`);
		}
		const [top, right = top, bottom = top, left = right] = tokens.map((token) => {
			const match = /^(\d+(?:\.\d+)?|\.\d+)(px)?$/.exec(token);
			if (!match) throw new Error(`frameClip.tolerance must be non-negative px, got "${token}"`);
			return Number(match[1]);
		});
		return new FrameClipping(top, right, bottom, left);
	}

	/** Whether `marker` is clipped: its own `clip` when set, otherwise its kind's default. */
	static isClipped(marker: { type: MarkerConfig['type']; clip?: unknown }): boolean {
		return (marker.clip ?? FrameClipping.defaults[marker.type]) === true;
	}
}
