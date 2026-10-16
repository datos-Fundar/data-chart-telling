<script lang="ts">
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import { TIME_SERIES } from '../../data/time-series';

	const data = TIME_SERIES.filter((d) => d.metric === 'GDP');
</script>

<!--
	`player.controls` lists what the bar draws, in order: one left out isn't
	drawn. And the chrome's `order` puts the whole bar where you want it.
-->
<div style="display: flex; flex-direction: column; gap: 24px;">
	<LinePlot
		width={760}
		height={320}
		title="Every control, looping"
		{data}
		x="year"
		y="value"
		color="region"
		scales={{ x: { domain: [2018, 2022] }, y: { domain: [0, 100] } }}
		timeline={{
			accessor: 'year',
			type: 'player',
			filterMode: 'upTo',
			player: {
				controls: ['play', 'value', 'slider', 'speed', 'loop'],
				loop: true,
				speeds: [0.5, 1, 2, 4]
			}
		}}
	/>
	<LinePlot
		width={760}
		height={320}
		title="Slider first, above the plot"
		{data}
		x="year"
		y="value"
		color="region"
		scales={{ x: { domain: [2018, 2022] }, y: { domain: [0, 100] } }}
		legend
		order={['title', 'timeline', 'legend', 'plot']}
		timeline={{
			accessor: 'year',
			type: 'player',
			filterMode: 'upTo',
			player: { controls: ['slider', 'value', 'play'], format: (year) => `Year ${year}` }
		}}
	/>
</div>
