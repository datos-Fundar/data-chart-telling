<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { ROWS } from './data';

	// A plot draws at the pixel size it is given. To fill a container (or the
	// window), bind its size and pass it down.
	let width = $state(0);
	let height = $state(0);
</script>

<div class="fill" bind:clientWidth={width} bind:clientHeight={height}>
	{#if width > 0 && height > 0}
		<LinePlot
			{width}
			{height}
			title="Value by region"
			subtitle="Index, 2016-2023"
			data={ROWS}
			x="year"
			y="value"
			color="region"
			scales={{
				x: { label: 'Year', tickFormat: (d) => String(d) },
				y: { label: 'Index' }
			}}
			styles={{ values: { show: true, format: (v, name) => `${name}: ${v}` } }}
			margins={{ right: 'auto' }}
		/>
	{/if}
</div>

<style>
	.fill {
		width: 100%;
		height: 100vh;
	}
</style>
