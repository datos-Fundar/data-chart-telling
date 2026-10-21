<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
	import { LIFE_EXPECTANCY } from '../../../plots/evolution/line/data';
</script>

<!-- The composer's `legend` adjusts the one legend its panels share. -->
<PlotComposer
	width={760}
	height={360}
	title="Life expectancy at birth, Argentina"
	layout={{ columns: 2 }}
	legend={{ series: { interactive: { enabled: true } } }}
>
	<LinePlot data={LIFE_EXPECTANCY} x="year" y="value" color="sex" />
	<ScatterPlot data={LIFE_EXPECTANCY} x="year" y="value" color="sex" />
</PlotComposer>
