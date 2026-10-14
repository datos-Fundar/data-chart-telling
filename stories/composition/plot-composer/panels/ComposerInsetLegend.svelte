<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import GridCell from '$lib/layout/grid/GridCell.svelte';
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import { TIME_SERIES } from '../../../data/time-series';
	import type { LegendSection } from '$lib/types/layout/legend';

	const north = TIME_SERIES.filter((d) => d.region === 'North');
	// The plot's default palette order, so the legend matches its lines.
	const legend: LegendSection[] = [
		{
			type: 'discrete',
			items: [
				{ name: 'GDP', color: '#1b9e77', symbol: 'line' },
				{ name: 'Employment', color: '#d95f02', symbol: 'line' }
			],
			layout: { type: 'vertical' }
		}
	];
</script>

<PlotComposer
	width={900}
	height={480}
	title="A legend inside the plot"
	subtitle="An inset panel can hold anything, not only a plot"
>
	<LinePlot
		data={north}
		x="year"
		y="value"
		color="metric"
		scales={{ y: { domain: [0, 160] } }}
	/>
	<GridCell inset={{ left: 0.1, bottom: 0.72, right: 0.3, top: 0.95 }}>
		<LegendLayout sections={legend} />
	</GridCell>
</PlotComposer>
