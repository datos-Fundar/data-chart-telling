<script lang="ts">
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import FigureReadout from './FigureReadout.svelte';
	import { LIFE_EXPECTANCY } from '../../plots/line/data';
</script>

{#snippet footer()}
	<FigureReadout />
{/snippet}

<LinePlot
	width={720}
	height={360}
	title="Life expectancy at birth"
	data={LIFE_EXPECTANCY}
	x="year"
	y="value"
	color="sex"
	tooltip
	{footer}
/>
