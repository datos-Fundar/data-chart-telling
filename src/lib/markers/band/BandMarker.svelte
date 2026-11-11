<script lang="ts">
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { RowStyle } from '$lib/markers/utils/RowStyle';
	import { Bands, type Band } from '$lib/markers/band/Bands';
	import type { BandMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'band'` marker: a rectangle over the band of each category it names, across the whole of the
	 * other axis. Nothing on an axis that is not a band scale. It takes the pointer only with a handler of its own,
	 * so a band behind the plot's shapes does not take their hover.
	 */
	const { marker }: { marker: BandMarkerConfig } = $props();
	const cfg = $derived(getConfiguration());
	const events = MarkerEvents.use(() => marker);
	const plot = usePlot().svelteplot;

	const bands = $derived(Bands.of(marker));
	const rows = $derived(marker.data ?? []);
	const styles = $derived({ ...cfg.band, ...marker.styles });
	const scale = $derived(plot.scales[marker.axis]);
	const across = $derived(plot.scales[marker.axis === 'x' ? 'y' : 'x']);

	/** The pixels the other axis spans, lowest first. */
	const extent = $derived.by((): [number, number] => {
		const range = across?.fn?.range?.() as number[] | undefined;
		if (!range || range.length < 2) return [0, 0];
		const [a, b] = [Number(range[0]), Number(range[range.length - 1])];
		return [Math.min(a, b), Math.max(a, b)];
	});

	/** Where a band is drawn: its slice of the band along the axis, the other axis' whole span across it. */
	function boxOf(band: Band) {
		const bandwidth = scale.fn.bandwidth?.() ?? 0;
		const start = Number(scale.fn(band.category as never));
		// Horizontal bars count their slices from the bottom of the band, as `BandNudge` and the bars' hit areas do.
		const from = start + (marker.axis === 'y' ? band.slice.end : band.slice.start) * bandwidth;
		const size = Math.max(0, bandwidth * (1 - band.slice.start - band.slice.end));
		const [low, high] = extent;
		return marker.axis === 'x'
			? { x: from, y: low, width: size, height: high - low }
			: { x: low, y: from, width: high - low, height: size };
	}

	/** A color of `styles` for the row: a value, the field of the rows it names, or a function of the row. */
	const colorOf = (style: unknown, row: unknown) => RowStyle.colorOf(style, rows)?.(row);
	/** A number of `styles` for the row: a value, the field of the rows it names, or a function of the row. */
	const numberOf = (style: unknown, row: unknown): number | undefined => {
		const read = RowStyle.field(style as never) as unknown;
		const value = typeof read === 'function' ? (read as (row: unknown) => unknown)(row) : read;
		return value == null ? undefined : Number(value);
	};
</script>

{#if scale?.type === 'band'}
	<g class="band" pointer-events={events.any ? undefined : 'none'}>
		{#each bands as band (band.category instanceof Date ? +band.category : band.category)}
			{@const box = boxOf(band)}
			{@const radius = numberOf(styles.borderRadius, band.row)}
			<rect
				{...box}
				rx={radius}
				ry={radius}
				fill={colorOf(styles.fill, band.row)}
				fill-opacity={numberOf(styles.fillOpacity, band.row)}
				stroke={colorOf(styles.stroke, band.row)}
				stroke-width={numberOf(styles.strokeWidth, band.row)}
				stroke-opacity={numberOf(styles.strokeOpacity, band.row)}
				stroke-dasharray={colorOf(styles.strokeDasharray, band.row)}
				{...events.forRow(band.row, band.index)}
			/>
		{/each}
	</g>
{/if}
