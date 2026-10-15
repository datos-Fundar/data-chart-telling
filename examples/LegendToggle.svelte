<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { ROWS } from './data';
	import LegendReader from './LegendReader.svelte';
</script>

<!--
	The automatic legend can toggle series. `mode: 'omit'` drops a hidden series
	and refits the axes to what is left; 'dim' and 'hide' keep the axes.
	Anything inside the figure (here, the footer) reads the toggles through
	`useFigure().legend` - see LegendReader.
-->
<LinePlot
	width={720}
	height={400}
	data={ROWS}
	x="year"
	y="value"
	color="region"
	legend={{ series: { interactive: { enabled: true, disabled: { mode: 'omit' } } } }}
>
	{#snippet footer()}
		<LegendReader />
	{/snippet}
</LinePlot>
