<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import FigureReadout from './FigureReadout.svelte';
	import { LIFE } from '$datasets';
</script>

{#snippet footer()}
	<FigureReadout />
{/snippet}

<LinePlot
	width={720}
	height={360}
	title="Life expectancy at birth"
	data={LIFE}
	x="year"
	y="value"
	color="sex"
	tooltip
	{footer}
	scales={{ x: { nice: false } }}
/>
