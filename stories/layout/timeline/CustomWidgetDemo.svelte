<script lang="ts">
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import CustomWidget from './CustomWidget.svelte';
	import { TIME_SERIES } from '../../data/time-series';
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
	data={TIME_SERIES.filter((d) => d.metric === 'GDP')}
	x="year"
	y="value"
	color="region"
	scales={{ x: { domain: [2018, 2022] }, y: { domain: [0, 100] } }}
	footer={widget}
	timeline={{ accessor: 'year', type: 'player', filterMode: 'upTo', player: { controls: [] } }}
/>
