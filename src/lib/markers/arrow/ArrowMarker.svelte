<script lang="ts">
	import { Arrow } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { RowStroke } from '$lib/markers/utils/RowStroke';
	import type { ArrowMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'arrow'` marker as `<Arrow>` - a point-to-point annotation.
	 * Restates svelteplot's own defaults, which an explicit `undefined` would
	 * otherwise erase. An arrow on a band axis ends at the middle of its band: the
	 * `<Arrow>` mark reads its start as the band's first edge and its end as the
	 * last, so such an arrow is placed in pixels instead.
	 */
	let { marker }: { marker: ArrowMarkerConfig } = $props();

	const plot = usePlot().svelteplot;
	const data = $derived(marker.data ?? []);
	/** Each row's own stroke, over the marker's `styles`. */
	const row = $derived(RowStroke.of(marker, marker.styles, { stroke: 'currentColor' }));

	type Row = Record<string, unknown>;
	type Channel = string | number | ((d: never) => unknown) | undefined;
	/** A channel of a row: a field key, a function of the row, or a literal. */
	const read = (channel: Channel, d: Row) =>
		typeof channel === 'string'
			? d[channel]
			: typeof channel === 'function'
				? (channel as (d: Row) => unknown)(d)
				: channel;
	/** Where `value` sits along `axis`, in pixels, at the middle of its band on a band axis. */
	const pixel = (axis: 'x' | 'y', value: unknown) => {
		const scale = plot.scales[axis];
		const at = scale.fn(value as never) as number;
		return scale.type === 'band' ? at + scale.fn.bandwidth() / 2 : at;
	};
	const onBand = $derived(plot.scales.x.type === 'band' || plot.scales.y.type === 'band');
	/** The rows with their ends in pixels, when an axis is a band. */
	const placed = $derived(
		onBand
			? data.map((d) => ({
					...d,
					__x1: pixel('x', read(marker.x1, d as Row)),
					__x2: pixel('x', read(marker.x2, d as Row)),
					__y1: pixel('y', read(marker.y1, d as Row)),
					__y2: pixel('y', read(marker.y2, d as Row))
				}))
			: data
	);
	/** A pixel channel the scales leave alone. */
	const own = (key: string) => ({ value: (d: Row) => d[key], scale: null }) as never;
</script>

<Arrow
	data={placed}
	x1={onBand ? own('__x1') : marker.x1}
	y1={onBand ? own('__y1') : marker.y1}
	x2={onBand ? own('__x2') : marker.x2}
	y2={onBand ? own('__y2') : marker.y2}
	bend={marker.bend}
	headAngle={marker.headAngle ?? 60}
	headLength={marker.headLength ?? 8}
	inset={marker.inset ?? 0}
	insetStart={marker.insetStart}
	insetEnd={marker.insetEnd}
	sweep={marker.sweep}
	stroke={row.stroke}
	strokeWidth={row.strokeWidth}
	strokeOpacity={row.strokeOpacity}
	strokeDasharray={marker.styles?.strokeDasharray}
/>
