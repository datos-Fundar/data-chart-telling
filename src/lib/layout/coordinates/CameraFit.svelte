<script lang="ts">
	import { geoBounds, type GeoPermissibleObjects } from 'd3-geo';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import {
		toProjectionLike,
		type StreamingProjection,
		type ProjectionLike
	} from '$lib/plots/utils/tiles';
	import { parseInsetLocation } from '$lib/markers/inset/insetLayout';
	import type { ResolvedGeoCameraTarget } from './resolveCameraTarget';
	import type { GeoZoomTransform } from './zoom.svelte';
	import type { GeoInsetLocation } from '$lib/types/markers/geo';

	/**
	 * Mounted inside `<Plot>` to reach `usePlot()` for the live fitted
	 * projection (see `TileLayer` for the same pattern). Computes the pixel
	 * `{x,y,k}` that fits/anchors `target` within `width`×`height`, reporting
	 * it reactively via `onFit`.
	 */
	let {
		target,
		anchor,
		padding = 24,
		zoom = 1,
		width,
		height,
		onFit
	}: {
		target: ResolvedGeoCameraTarget;
		anchor?: GeoInsetLocation;
		padding?: number;
		zoom?: number;
		width: number;
		height: number;
		onFit: (fit: GeoZoomTransform) => void;
	} = $props();

	const plot = usePlot().svelteplot;

	// Runtime shape verified against svelteplot's own projection helper - see TileLayer.svelte.
	const rawProjection = $derived(
		plot.scales.projection as unknown as StreamingProjection | undefined
	);
	const projection = $derived(rawProjection ? toProjectionLike(rawProjection) : undefined);

	/** A grid of lon/lat samples approximating `target`'s extent, antimeridian-safe. */
	function sampleLonLat(t: ResolvedGeoCameraTarget): [number, number][] {
		if (t.kind === 'point') return [[t.lon, t.lat]];
		const [[w, s], [e, n]] = geoBounds(t.geometry as GeoPermissibleObjects);
		const east = e < w ? e + 360 : e;
		const lons = [w, (w + east) / 2, east].map((lon) => ((((lon + 180) % 360) + 360) % 360) - 180);
		const lats = [s, (s + n) / 2, n];
		const points: [number, number][] = [];
		for (const lon of lons) for (const lat of lats) points.push([lon, lat]);
		return points;
	}

	function project(proj: ProjectionLike, points: [number, number][]): [number, number][] {
		const out: [number, number][] = [];
		for (const p of points) {
			const projected = proj(p);
			if (projected) out.push(projected);
		}
		return out;
	}

	$effect(() => {
		if (!projection) return;
		const projected = project(projection, sampleLonLat(target));
		if (!projected.length) return;

		let minX = Infinity;
		let maxX = -Infinity;
		let minY = Infinity;
		let maxY = -Infinity;
		for (const [x, y] of projected) {
			if (x < minX) minX = x;
			if (x > maxX) maxX = x;
			if (y < minY) minY = y;
			if (y > maxY) maxY = y;
		}
		const bboxW = maxX - minX;
		const bboxH = maxY - minY;

		// No extent to fit for a plain point - `zoom` is used directly as the scale.
		const availW = Math.max(1, width - padding * 2);
		const availH = Math.max(1, height - padding * 2);
		const fitScale =
			bboxW > 0 && bboxH > 0
				? Math.min(availW / bboxW, availH / bboxH)
				: bboxW > 0
					? availW / bboxW
					: bboxH > 0
						? availH / bboxH
						: 1;
		const k = fitScale * zoom;

		const centerX = (minX + maxX) / 2;
		const centerY = (minY + maxY) / 2;

		const { h, v } = parseInsetLocation(anchor ?? 'middle-middle');
		const halfW = (bboxW * k) / 2;
		const halfH = (bboxH * k) / 2;
		const targetX =
			h === 'left' ? padding + halfW : h === 'right' ? width - padding - halfW : width / 2;
		const targetY =
			v === 'top' ? padding + halfH : v === 'bottom' ? height - padding - halfH : height / 2;

		onFit({ x: targetX - centerX * k, y: targetY - centerY * k, k });
	});
</script>
