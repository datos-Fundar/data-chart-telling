<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './datasets';

	// A rule has no controls of its own: the page moves it through `progress` (0 to 1).
	// One step per year; a line plot shows every row up to the current step.
	let progress = $state(0.5);
</script>

<input type="range" min="0" max="1" step="0.001" bind:value={progress} />
<LinePlot
	width={720}
	height={400}
	data={REGION_VALUES}
	x="date"
	y="value"
	color="region"
	timeline={{ accessor: (row) => row.date.getUTCFullYear(), type: 'rule', progress }}
/>
