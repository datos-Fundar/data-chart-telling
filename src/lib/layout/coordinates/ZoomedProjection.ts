import { geoTransform } from 'd3-geo';
import type { GeoZoomTransform } from '$lib/layout/coordinates/zoom.svelte';
import type { StreamingProjection } from '$lib/plots/utils/tiles';

/** A fitted projection with a pan and scale applied to where it puts things, so positions move and zoom while what is drawn at them keeps its size. */
export class ZoomedProjection {
	/** `outer` over `inner` as one pan and scale of the pixels. */
	static compose(inner: GeoZoomTransform, outer: GeoZoomTransform): GeoZoomTransform {
		return { k: inner.k * outer.k, x: outer.k * inner.x + outer.x, y: outer.k * inner.y + outer.y };
	}

	/** The pan and scale that carries what is drawn through `settled` to where `live` puts it. */
	static between(settled: GeoZoomTransform, live: GeoZoomTransform): GeoZoomTransform {
		const k = live.k / settled.k;
		return { k, x: live.x - settled.x * k, y: live.y - settled.y * k };
	}

	/** `projection`, then `outer` over `inner` (each a pan and scale) as one move in pixels. */
	static of(
		projection: StreamingProjection & { aspectRatio?: number },
		inner: GeoZoomTransform,
		outer: GeoZoomTransform
	): StreamingProjection & { aspectRatio?: number } {
		const { k, x, y } = ZoomedProjection.compose(inner, outer);
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
