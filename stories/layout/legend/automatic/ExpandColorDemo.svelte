<script lang="ts">
	import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
	import { PENGUIN_COUNTS } from '$datasets';
</script>

<!--
	`color` adjusts the automatic continuous section of the color ramp: here it
	turns it interactive - drag its handles to dim the cells outside a range -
	and widens it. The ramp's colors and range still come from the plot.
-->
<HeatmapPlot
	width={760}
	height={420}
	data={PENGUIN_COUNTS}
	x="island"
	y="species"
	color="count"
	legend={{ color: { title: 'Penguins', width: 260, interactive: { enabled: true } } }}
	styles={{ values: { format: (v: number) => `${v}` } }}
/>
