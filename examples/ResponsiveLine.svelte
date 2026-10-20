<script lang="ts">
	import { LinePlot } from '@fundar/data-chart-telling';
	import { REGION_VALUES } from './data';

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
			title="Monthly inflation by region"
			subtitle="Change from the previous month, 2023-2026"
			data={REGION_VALUES}
			x="date"
			y="value"
			color="region"
			scales={{
				x: { label: 'Month' },
				y: { label: 'Inflation (%)' }
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
