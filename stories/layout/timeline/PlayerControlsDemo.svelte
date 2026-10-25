<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { ARGENTINA_CHILE_TRENDS } from '$datasets';

	const data = ARGENTINA_CHILE_TRENDS.filter((d) => d.metric === 'GDP per capita');
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
		color="country"
		scales={{ x: { domain: [1987, 2007] }, y: { domain: [0, 250] } }}
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
		color="country"
		scales={{ x: { domain: [1987, 2007] }, y: { domain: [0, 250] } }}
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
