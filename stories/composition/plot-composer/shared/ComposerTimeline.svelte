<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import Scrubber from '../../../common/Scrubber.svelte';
	import { ARGENTINA_CHILE_TRENDS } from '$datasets';

	const YEARS = [1987, 1992, 1997, 2002, 2007];
</script>

<Scrubber>
	{#snippet children({ progress })}
		<PlotComposer
			width={900}
			height={440}
			title="One scrubber, two plots"
			subtitle="Each panel's timeline only names its own time field"
			timeline={{ type: 'rule', progress, values: YEARS, orientation: 'horizontal' }}
			layout={{ columns: 2, widths: [3, 2] }}
		>
			<LinePlot
				data={ARGENTINA_CHILE_TRENDS.filter((d) => d.metric === 'GDP per capita')}
				x="year"
				y="value"
				color="country"
				scales={{ x: { domain: [1987, 2007] }, y: { domain: [0, 250] } }}
				timeline={{ accessor: 'year' }}
			/>
			<BarPlot
				data={ARGENTINA_CHILE_TRENDS.filter((d) => d.metric === 'GDP per capita')}
				x="country"
				y="value"
				scales={{ y: { domain: [0, 250] } }}
				timeline={{ accessor: 'year' }}
			/>
		</PlotComposer>
	{/snippet}
</Scrubber>
