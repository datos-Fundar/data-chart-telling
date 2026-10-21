<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
	import Scrubber from '../../../common/Scrubber.svelte';
	import { TIME_SERIES } from '../../../data/time-series';

	const YEARS = [2018, 2019, 2020, 2021, 2022];
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
				data={TIME_SERIES.filter((d) => d.metric === 'GDP')}
				x="year"
				y="value"
				color="region"
				scales={{ x: { domain: [2018, 2022] }, y: { domain: [0, 100] } }}
				timeline={{ accessor: 'year' }}
			/>
			<BarPlot
				data={TIME_SERIES.filter((d) => d.metric === 'GDP')}
				x="region"
				y="value"
				scales={{ y: { domain: [0, 100] } }}
				timeline={{ accessor: 'year' }}
			/>
		</PlotComposer>
	{/snippet}
</Scrubber>
