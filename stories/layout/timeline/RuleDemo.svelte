<script lang="ts">
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import { ARGENTINA_CHILE_TRENDS } from '$datasets';
	import type { Orientation } from '$lib/types/layout/timeline';

	let {
		orientation = 'vertical',
		order
	}: {
		orientation?: Orientation;
		order?: ('title' | 'plot' | 'timeline' | '(timeline, plot)' | '(plot, timeline)' | 'divider')[];
	} = $props();
</script>

<!--
	`type: 'rule'` draws the timeline as a rule in the chrome, slicing the
	plot's rows by `accessor`: `progress` (0-1) picks the step, `orientation` says which way it
	runs - and, vertical, that it sits beside the plot, as `order`'s
	'(plot, timeline)' would. An `order` of your own places it instead.
-->
<BarPlot
	width={720}
	height={420}
	title="GDP per capita by country"
	data={ARGENTINA_CHILE_TRENDS.filter((d) => d.metric === 'GDP per capita')}
	x="country"
	y="value"
	scales={{ y: { domain: [0, 250] } }}
	{order}
	timeline={{ accessor: 'year', type: 'rule', progress: 0.5, orientation }}
/>
