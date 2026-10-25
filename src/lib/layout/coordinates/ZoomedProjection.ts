import { geoTransform } from 'd3-geo';
import type { GeoZoomTransform } from '$lib/layout/coordinates/zoom.svelte';
import type { StreamingProjection } from '$lib/plots/utils/tiles';

/** A fitted projection with a pan and scale applied to where it puts things, so positions move and zoom while what is drawn at them keeps its size. */
export class ZoomedProjection {
	/** `projection`, then `outer` over `inner` (each a pan and scale) as one move in pixels. */
	static of(
		projection: StreamingProjection & { aspectRatio?: number },
		inner: GeoZoomTransform,
		outer: GeoZoomTransform
	): StreamingProjection & { aspectRatio?: number } {
		const k = inner.k * outer.k;
		const x = outer.k * inner.x + outer.x;
		const y = outer.k * inner.y + outer.y;
		if (k === 1 && x === 0 && y === 0) return projection;
		const move = geoTransform({
			point(px: number, py: number) {
				this.stream.point(px * k + x, py * k + y);
			}
		});
		return {
			aspectRatio: projection.aspectRatio,
			invert: projection.invert
				? ([px, py]: [number, number]) => projection.invert!([(px - x) / k, (py - y) / k])
				: undefined,
			stream: (sink) => projection.stream(move.stream(sink))
		} as StreamingProjection & { aspectRatio?: number };
	}
}
