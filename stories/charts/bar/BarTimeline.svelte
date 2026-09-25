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
			title="Value by region over time"
			subtitle="Interactive timeline — drag the scrubber"
			caption="The timeline filters the data to the selected year."
			data={REGION_BARS}
			x="region"
			y="value"
			timeline={{ accessor: 'year', progress, orientation: 'horizontal' }}
		/>
	{/snippet}
</Scrubber>
