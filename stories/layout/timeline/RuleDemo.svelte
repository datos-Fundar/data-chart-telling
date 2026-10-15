<script lang="ts">
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import { TIME_SERIES } from '../../data/time-series';
	import type { Orientation } from '$lib/types/layout/timeline';

	let { orientation = 'vertical' }: { orientation?: Orientation } = $props();
</script>

<!--
	`timeline` slices the plot's rows by `accessor` and draws a rule beside
	it: `progress` (0-1) picks the step, `orientation` says which way it runs.
-->
<BarPlot
	width={720}
	height={420}
	title="GDP by region"
	data={TIME_SERIES.filter((d) => d.metric === 'GDP')}
	x="region"
	y="value"
	scales={{ y: { domain: [0, 100] } }}
	timeline={{ accessor: 'year', progress: 0.5, orientation }}
/>
