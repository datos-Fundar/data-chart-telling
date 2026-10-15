<script lang="ts">
	import BarPlot from '$lib/plots/bar/Plot.svelte';
	import { TIME_SERIES } from '../../data/time-series';
</script>

<!--
	`type: 'player'` draws the timeline as a bar in the chrome, below the plot
	by default: play and pause, the current step and a slider.
-->
<BarPlot
	width={760}
	height={420}
	title="GDP by region"
	data={TIME_SERIES.filter((d) => d.metric === 'GDP')}
	x="region"
	y="value"
	scales={{ y: { domain: [0, 100] } }}
	timeline={{ accessor: 'year', type: 'player' }}
/>
