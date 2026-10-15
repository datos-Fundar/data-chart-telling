<script lang="ts">
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import { TIME_SERIES } from '../../data/time-series';
	import type { Orientation } from '$lib/types/layout/timeline';

	let {
		orientation = 'vertical',
		order
	}: { orientation?: Orientation; order?: ('title' | 'plot' | 'timeline' | '(timeline, plot)' | '(plot, timeline)' | 'divider')[] } = $props();
</script>

<!--
	`timeline` slices the plot's rows by `accessor` and draws a rule in the
	chrome: `progress` (0-1) picks the step, `orientation` says which way it
	runs - and, vertical, that it sits beside the plot, as `order`'s
	'(plot, timeline)' would. An `order` of your own places it instead.
-->
<BarPlot
	width={720}
	height={420}
	title="GDP by region"
	data={TIME_SERIES.filter((d) => d.metric === 'GDP')}
	x="region"
	y="value"
	scales={{ y: { domain: [0, 100] } }}
	{order}
	timeline={{ accessor: 'year', progress: 0.5, orientation }}
/>
