<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';
	import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
	import { LIFE_EXPECTANCY } from '../../../plots/line/data';
</script>

<!-- The panels leave their legend to the composer, which shows every series they draw, once. -->
<PlotComposer
	width={760}
	height={360}
	title="Life expectancy at birth, Argentina"
	tags="A"
	layout={{ columns: 2 }}
>
	<LinePlot data={LIFE_EXPECTANCY} x="year" y="value" color="sex" />
	<ScatterPlot data={LIFE_EXPECTANCY} x="year" y="value" color="sex" />
</PlotComposer>
