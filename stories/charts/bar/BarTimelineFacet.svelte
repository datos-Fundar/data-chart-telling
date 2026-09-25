<script lang="ts">
	import BarChart from '$lib/charts/bar/Chart.svelte';
	import Scrubber from '../../common/Scrubber.svelte';
	import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';
</script>

<Scrubber>
	{#snippet children({ progress })}
		<BarChart
			width={760}
			height={460}
			title="Metrics by region and year"
			subtitle="Shared timeline + facets"
			data={TIME_SERIES}
			x={'metric' as keyof SeriesPoint}
			y="value"
			facet={{ by: 'region' as keyof SeriesPoint, columns: 2 }}
			timeline={{ accessor: 'year', progress, orientation: 'horizontal' }}
		/>
	{/snippet}
</Scrubber>
