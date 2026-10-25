<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import GridCell from '$lib/layout/grid/GridCell.svelte';
	import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import { ARGENTINA_CHILE_TRENDS } from '$datasets';
	import type { LegendSection } from '$lib/types/layout/legend';

	const north = ARGENTINA_CHILE_TRENDS.filter((d) => d.country === 'Argentina');
	// The plot's default palette order, so the legend matches its lines.
	const legend: LegendSection[] = [
		{
			type: 'discrete',
			items: [
				{ name: 'GDP per capita', color: '#1b9e77', symbol: 'line' },
				{ name: 'Population', color: '#d95f02', symbol: 'line' }
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
	<LinePlot data={north} x="year" y="value" color="metric" scales={{ y: { domain: [0, 250] } }} />
	<GridCell inset={{ left: 0.1, bottom: 0.72, right: 0.3, top: 0.95 }}>
		<LegendLayout sections={legend} />
	</GridCell>
</PlotComposer>
