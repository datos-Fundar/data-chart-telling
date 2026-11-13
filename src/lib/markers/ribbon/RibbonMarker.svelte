<script lang="ts">
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { RowStyle } from '$lib/markers/utils/RowStyle';
	import { MarkerChannels } from '$lib/markers/utils/MarkerChannels';
	import { RibbonPath, type RibbonEnd } from '$lib/markers/ribbon/RibbonPath';
	import { resolveAccessor } from '$lib/utils/accessors';
	import type { RibbonMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'ribbon'` marker: a band per row from `x1` to `x2` on the plot's own scales. On a band axis a
	 * ribbon leaves from the far edge of its start's band and arrives at the near edge of its end's. Its `color` and
	 * `opacity` channels win over the fill and fill opacity of its `styles`, as a `rect`'s do.
	 */
	let { marker }: { marker: RibbonMarkerConfig } = $props();
	const cfg = $derived(getConfiguration());
	const events = MarkerEvents.use(() => marker);
	const plot = usePlot().svelteplot;

	type Row = Record<string, unknown>;
	const rows = $derived((marker.data ?? []) as Row[]);
	const styles = $derived({ ...cfg.ribbon, ...marker.styles });
	const curvature = $derived(marker.curvature ?? cfg.ribbon.curvature);
	const channelFill = $derived(MarkerChannels.buildFill(rows, marker.color, marker.scales, cfg));
	const channelOpacity = $derived(
		MarkerChannels.buildOpacity(rows, marker.opacity, marker.scales, cfg)
	);

	/** A channel of a row: a field key (a transform's are symbols), a function of the row, or a literal (a number, a date). */
	const read = (channel: unknown): ((row: Row) => unknown) | undefined =>
		channel === undefined
			? undefined
			: typeof channel === 'string' || typeof channel === 'symbol' || typeof channel === 'function'
				? (resolveAccessor(channel as never) as (row: Row) => unknown)
				: () => channel;
	const getX1 = $derived(read(marker.x1));
	const getX2 = $derived(read(marker.x2));
	const getY1 = $derived(read(marker.y1));
	const getY2 = $derived(read(marker.y2));
	const getY3 = $derived(read(marker.y3) ?? getY1);
	const getY4 = $derived(read(marker.y4) ?? getY2);

	/** A number of `styles` for the row: a value, the field of the rows it names, or a function of the row. */
	const numberOf = (style: unknown, row: Row, index: number): number | undefined => {
		const value = RowStyle.field(style as never) as unknown;
		const own =
			typeof value === 'function' ? (value as (r: Row, i: number) => unknown)(row, index) : value;
		return own == null ? undefined : Number(own);
	};
	/** A color of `styles` for the row: a value, the field of the rows it names, or a function of the row. */
	const colorOf = (style: unknown, row: Row, index: number) =>
		typeof style === 'function'
			? (style as (r: Row, i: number) => string)(row, index)
			: RowStyle.colorOf(style, rows)?.(row);

	/** Where `value` sits along x: the far edge of its band at the start, the near edge at the end. */
	const along = (value: unknown, side: 'start' | 'end') => {
		const scale = plot.scales.x;
		const at = Number(scale.fn(value as never));
		return scale.type === 'band' && side === 'start' ? at + scale.fn.bandwidth() : at;
	};
	const across = (value: unknown) => Number(plot.scales.y.fn(value as never));

	/** A row's ribbon as a path, or `undefined` when one of its ends is off the scales. */
	function pathOf(row: Row, index: number): string | undefined {
		if (!getX1 || !getX2 || !getY1 || !getY2 || !getY3 || !getY4) return undefined;
		const inset = numberOf(styles.inset, row, index) ?? 0;
		const start: RibbonEnd = {
			at: along(getX1(row), 'start') + (numberOf(styles.insetStart, row, index) ?? inset),
			from: across(getY1(row)),
			to: across(getY2(row))
		};
		const end: RibbonEnd = {
			at: along(getX2(row), 'end') - (numberOf(styles.insetEnd, row, index) ?? inset),
			from: across(getY3(row)),
			to: across(getY4(row))
		};
		const ends = [start.at, start.from, start.to, end.at, end.from, end.to];
		return ends.every(Number.isFinite) ? RibbonPath.horizontal(start, end, curvature) : undefined;
	}
</script>

<g class="ribbon">
	{#each rows as row, index (index)}
		{@const d = pathOf(row, index)}
		{#if d}
			<path
				{d}
				fill={channelFill?.(row) ?? colorOf(styles.fill, row, index)}
				fill-opacity={channelOpacity?.(row) ?? numberOf(styles.fillOpacity, row, index)}
				stroke={colorOf(styles.stroke, row, index)}
				stroke-width={numberOf(styles.strokeWidth, row, index)}
				stroke-opacity={numberOf(styles.strokeOpacity, row, index)}
				stroke-dasharray={colorOf(styles.strokeDasharray, row, index)}
				{...events.forRow(row, index)}
			/>
		{/if}
	{/each}
</g>
