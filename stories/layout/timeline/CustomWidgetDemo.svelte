<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import CustomWidget from './CustomWidget.svelte';
	import { ARGENTINA_CHILE_TRENDS } from '$datasets';
</script>

{#snippet widget()}
	<CustomWidget />
{/snippet}

<!--
	With no `controls` the bar isn't drawn: the timeline is still there, and
	`useFigure().timeline` (or `usePlot().timeline`) reads and drives it from a
	widget of your own - here the plot's footer.
-->
<LinePlot
	width={760}
	height={380}
	title="Your own widget"
	data={ARGENTINA_CHILE_TRENDS.filter((d) => d.metric === 'GDP per capita')}
	x="year"
	y="value"
	color="country"
	scales={{ x: { domain: [1987, 2007] }, y: { domain: [0, 250] } }}
	footer={widget}
	timeline={{ accessor: 'year', type: 'player', filterMode: 'upTo', player: { controls: [] } }}
/>
