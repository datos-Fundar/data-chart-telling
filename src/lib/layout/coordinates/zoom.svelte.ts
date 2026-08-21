import { select } from 'd3-selection';
import { zoom as d3zoom, zoomIdentity, type D3ZoomEvent } from 'd3-zoom';
import type { GeoZoomConfig } from '$lib/types/layout/coordinates';

export type GeoZoomTransform = { x: number; y: number; k: number };

/**
 * Wires drag-pan + scroll-zoom onto a DOM node via d3-zoom, exposing the
 * resulting transform as reactive Svelte state, applied by the caller as an
 * SVG `<g transform="translate(x,y) scale(k)">` wrapper.
 *
 * `panEnabled`/`zoomEnabled` gate drag-translate and wheel/pinch-scale
 * independently, as separate `.filter()`s on the same underlying instance.
 *
 * Limitations: hover/tooltip hit-testing doesn't compensate for an active
 * transform. Touch pinch-to-zoom is gated by `panEnabled`, not `zoomEnabled`
 * (d3-zoom can't distinguish a pinch from a one-finger drag until underway).
 */
export function createGeoZoom(args: {
	panEnabled: () => boolean;
	zoomEnabled: () => boolean;
	config: () => GeoZoomConfig | undefined;
	node: () => HTMLElement | null;
	/** When true, drag/touch is left for something else (e.g. `createGeoRotate`) — only wheel/pinch scaling stays wired here. */
	disableDrag?: () => boolean;
}) {
	let transform = $state<GeoZoomTransform>({ x: 0, y: 0, k: 1 });

	$effect(() => {
		const el = args.node();
		if ((!args.panEnabled() && !args.zoomEnabled()) || !el) return;
		const cfg = args.config();

		const behavior = d3zoom<HTMLElement, unknown>()
			.scaleExtent([cfg?.min ?? 1, cfg?.max ?? 8])
			.filter((event: Event) => {
				const isWheel = event.type === 'wheel';
				if (isWheel) return args.zoomEnabled();
				if (!args.panEnabled() || args.disableDrag?.()) return false;
				// d3-zoom's own default filter, minus the part this replaces.
				return !(event as MouseEvent).ctrlKey && !(event as MouseEvent).button;
			})
			.on('zoom', (event: D3ZoomEvent<HTMLElement, unknown>) => {
				transform = { x: event.transform.x, y: event.transform.y, k: event.transform.k };
			});

		const selection = select(el).call(behavior);

		const initial = cfg?.initial;
		if (initial) {
			behavior.transform(
				selection,
				zoomIdentity.translate(initial.x ?? 0, initial.y ?? 0).scale(initial.k ?? 1)
			);
		} else {
			transform = { x: 0, y: 0, k: 1 };
		}

		return () => {
			selection.on('.zoom', null);
		};
	});

	return {
		get transform() {
			return transform;
		}
	};
}
