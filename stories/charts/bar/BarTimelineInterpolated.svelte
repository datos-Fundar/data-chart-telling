<script lang="ts">
	import BarChart from '$lib/charts/bar/Chart.svelte';
	import Scrubber from '../../common/Scrubber.svelte';
	import { REGION_BARS } from '../../data/region-bars';
</script>

<Scrubber>
	{#snippet children({ progress })}
		<BarChart
			width={680}
			height={420}
			title="Value by region over time, interpolated"
			subtitle="Interactive timeline — each bar crossfades between years instead of jumping"
			caption="The years 2018/2020/2022 have gaps: `interpolate: true` tweens each region's value across them."
			data={REGION_BARS}
			x="region"
			y="value"
			timeline={{ accessor: 'year', progress, orientation: 'horizontal', interpolate: true }}
		/>
	{/snippet}
</Scrubber>
