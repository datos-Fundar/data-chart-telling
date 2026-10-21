<script lang="ts">
	import TimelineLayout from '$lib/layout/timeline/TimelineLayout.svelte';
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import Scrubber from '../../common/Scrubber.svelte';
	import type { Orientation } from '$lib/types/layout/timeline';

	/**
	 * `TimelineLayout`'s own `interpolate` option has no chart-level `y`/`color`
	 * to default from, so - unlike `LinePlot`/`BarPlot`, where `interpolate: true`
	 * is enough - a direct caller must spell out `value` (and usually `key`,
	 * since several categories share one time field here) explicitly.
	 */
	let {
		orientation = 'vertical',
		width = 680,
		height = 420
	}: {
		orientation?: Orientation;
		width?: number;
		height?: number;
	} = $props();

	type Row = { year: number; region: string; value: number };
	const YEARS = [2018, 2020, 2022]; // gaps on purpose - the tween visibly bridges them
	const REGIONS = ['North', 'Central', 'South', 'East', 'West'];
	const data: Row[] = YEARS.flatMap((year) =>
		REGIONS.map((region, i) => ({
			year,
			region,
			value: Math.round(30 + 10 * i + 6 * Math.sin(year - 2018 + i))
		}))
	);
</script>

<Scrubber>
	{#snippet children({ progress })}
		<TimelineLayout
			{data}
			accessor="year"
			{progress}
			{orientation}
			{width}
			{height}
			interpolate={{ key: 'region', value: 'value', segmentEasing: 'quadOut' }}
		>
			{#snippet child({ data: rows, width: w, height: h })}
				<BarPlot
					width={w}
					height={h}
					series={[{ name: 'region', x: 'region', y: 'value', data: rows }]}
				/>
			{/snippet}
		</TimelineLayout>
	{/snippet}
</Scrubber>
