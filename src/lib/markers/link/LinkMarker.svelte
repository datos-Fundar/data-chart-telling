<script lang="ts">
	import { Geo } from 'svelteplot';
	import { geoPath } from 'd3-geo';
	import { resolveAccessor } from '$lib/utils/accessors';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { GeoGeometry } from '$lib/plots/map/geo/GeoGeometry';
	import { toProjectionLike, type StreamingProjection } from '$lib/plots/utils/tiles';
	import type { GeoLinkMarkerConfig } from '$lib/types/markers/geo';

	/**
	 * Renders one `'link'` marker - lines between point pairs. A plain `'auto'`
	 * link follows the great circle, as a `LineString` fed through `<Geo>`; a
	 * `'linear'` one, or any with an `altitude`, is a path drawn from the
	 * projected positions.
	 */
	let { marker }: { marker: GeoLinkMarkerConfig } = $props();

	type Point = [number, number];
	const STEPS = 64;

	const plot = usePlot().svelteplot;

	const getX1 = $derived(resolveAccessor(marker.x1));
	const getY1 = $derived(resolveAccessor(marker.y1));
	const getX2 = $derived(resolveAccessor(marker.x2));
	const getY2 = $derived(resolveAccessor(marker.y2));
	const altitude = $derived(marker.altitude ?? 0);
	const drawn = $derived(marker.curve === 'linear' || altitude > 0);

	const ends = (d: Record<string, unknown>): [Point, Point] => [
		[Number(getX1(d)), Number(getY1(d))],
		[Number(getX2(d)), Number(getY2(d))]
	];

	const arcFeatures = $derived(
		marker.data.map((d) => ({
			type: 'Feature' as const,
			properties: {},
			geometry: { type: 'LineString' as const, coordinates: GeoGeometry.greatCircle(...ends(d)) }
		}))
	);

	// The same shared, already-fitted projection every other map mark draws through.
	const projection = $derived(
		toProjectionLike(plot.scales.projection as unknown as StreamingProjection)
	);

	/** The projected globe's center and width; a projection that clips (a globe) is lifted radially, a flat one upward. */
	const frame = $derived.by(() => {
		const sphere = geoPath(plot.scales.projection as unknown as Parameters<typeof geoPath>[0]);
		const [[x0, y0], [x1, y1]] = sphere.bounds({ type: 'Sphere' });
		const probes: Point[] = [
			[-170, 0],
			[-90, 0],
			[0, 0],
			[90, 0],
			[170, 0]
		];
		return {
			center: [(x0 + x1) / 2, (y0 + y1) / 2] as Point,
			width: x1 - x0,
			globe: probes.some((probe) => projection(probe) === null)
		};
	});

	/** Unit vector of a lon/lat on the sphere. */
	const toVector = ([lon, lat]: Point): [number, number, number] => {
		const [lambda, phi] = [(lon * Math.PI) / 180, (lat * Math.PI) / 180];
		return [Math.cos(phi) * Math.cos(lambda), Math.cos(phi) * Math.sin(lambda), Math.sin(phi)];
	};
	const toLonLat = ([x, y, z]: [number, number, number]): Point => [
		(Math.atan2(y, x) * 180) / Math.PI,
		(Math.atan2(z, Math.hypot(x, y)) * 180) / Math.PI
	];

	/** The point of the sphere facing the viewer, on a globe. */
	const facing = $derived.by(() => {
		if (!frame.globe) return undefined;
		const lonLat = projection.invert?.(frame.center);
		return lonLat ? toVector(lonLat) : undefined;
	});

	/**
	 * Where a point sits on screen, and whether it faces the viewer. On a
	 * globe, a point on the far side shows where its mirror image across the
	 * view plane does - that is where a lifted arc over the horizon is drawn.
	 */
	function place(point: Point): { xy: Point; front: boolean } | null {
		const xy = projection(point);
		if (xy) return { xy, front: true };
		if (marker.occlusion !== 'globe' || !facing) return null;
		const vector = toVector(point);
		const depth = vector.reduce((sum, value, index) => sum + value * facing[index], 0);
		const mirrored = vector.map((value, index) => value - 2 * depth * facing[index]);
		const shown = projection(toLonLat(mirrored as [number, number, number]));
		return shown ? { xy: shown, front: false } : null;
	}

	/** A point lifted off a globe's surface; one from the far side counts only once it clears the globe's outline. */
	function lifted([x, y]: Point, rise: number, front: boolean): Point | null {
		const [cx, cy] = frame.center;
		const out: Point = [cx + (x - cx) * (1 + rise), cy + (y - cy) * (1 + rise)];
		return front || Math.hypot(out[0] - cx, out[1] - cy) > frame.width / 2 ? out : null;
	}

	/** One route as projected runs of points; a run ends where the projection clips or the line wraps around a flat map. */
	function runsOf(d: Record<string, unknown>): Point[][] {
		const [from, to] = ends(d);
		const start = projection(from);
		const end = projection(to);
		// A straight line needs both ends on screen; an arc keeps whatever part of it shows.
		if (marker.curve === 'linear' && (!start || !end)) return [];
		const steps = altitude > 0 ? STEPS : 1;
		const projected: ({ xy: Point; front: boolean } | null)[] =
			marker.curve === 'linear'
				? Array.from({ length: steps + 1 }, (_, index) => ({
						xy: [
							start![0] + ((end![0] - start![0]) * index) / steps,
							start![1] + ((end![1] - start![1]) * index) / steps
						] as Point,
						front: true
					}))
				: GeoGeometry.greatCircle(from, to, steps).map((point) => place(point));
		const chord = start && end ? Math.hypot(end[0] - start[0], end[1] - start[1]) : 0;

		const runs: Point[][] = [];
		let run: Point[] = [];
		projected.forEach((point, index) => {
			const rise = altitude * Math.sin((Math.PI * index) / steps);
			const next: Point | null = !point
				? null
				: frame.globe
					? lifted(point.xy, rise, point.front)
					: [point.xy[0], point.xy[1] - chord * rise];
			const previous = run[run.length - 1];
			const wrapped =
				next &&
				previous &&
				marker.curve !== 'linear' &&
				!frame.globe &&
				Math.abs(next[0] - previous[0]) > frame.width / 2;
			if (!next || wrapped) {
				if (run.length > 1) runs.push(run);
				run = next ? [next] : [];
			} else {
				run.push(next);
			}
		});
		if (run.length > 1) runs.push(run);
		return runs;
	}

	const paths = $derived(
		drawn
			? marker.data.flatMap((d) => {
					const runs = runsOf(d);
					return runs.length
						? [runs.map((run) => 'M' + run.map(([x, y]) => `${x},${y}`).join('L')).join('')]
						: [];
				})
			: []
	);
</script>

{#if drawn}
	<g class="link">
		{#each paths as d, index (index)}
			<path
				{d}
				fill="none"
				stroke={marker.styles?.stroke ?? 'currentColor'}
				stroke-width={marker.styles?.strokeWidth ?? 1}
				stroke-opacity={marker.styles?.strokeOpacity}
				stroke-dasharray={marker.styles?.strokeDasharray}
				style="vector-effect: non-scaling-stroke"
			/>
		{/each}
	</g>
{:else}
	<!-- No `fill` prop: svelteplot treats any string as scale-worthy unless it's a real CSS color, so a literal `'none'` would run through the color scale instead of staying unfilled. Omitting it leaves svelteplot's own unfilled default in place. -->
	<Geo
		class="link"
		data={arcFeatures}
		stroke={marker.styles?.stroke ?? 'currentColor'}
		strokeWidth={marker.styles?.strokeWidth ?? 1}
		strokeOpacity={marker.styles?.strokeOpacity}
		strokeDasharray={marker.styles?.strokeDasharray}
		style="vector-effect: non-scaling-stroke"
	/>
{/if}
