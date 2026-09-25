<script lang="ts">
	import LineChart from '$lib/charts/line/Chart.svelte';
	import Scrubber from '../../common/Scrubber.svelte';
	import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';

	const data = TIME_SERIES.filter((d) => d.region === 'North');
	const years = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
</script>

<Scrubber>
	{#snippet children({ progress })}
		<LineChart
			width={680}
			height={460}
			title="GDP vs. Employment, year by year"
			subtitle="Interactive timeline — the line grows up to the selected year"
			caption="Unlike bar/heatmap, the timeline accumulates the data instead of isolating a single year."
			{data}
			x="year"
			y="value"
			color={'metric' as keyof SeriesPoint}
			scales={{ x: { domain: [years[0], years[years.length - 1]] }, y: { domain: [20, 80] } }}
			timeline={{ accessor: 'year', progress, orientation: 'horizontal' }}
		/>
	{/snippet}
</Scrubber>
