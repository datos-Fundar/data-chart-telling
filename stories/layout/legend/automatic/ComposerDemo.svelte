<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
	import { LIFE } from '$datasets';
</script>

<!-- The panels leave their legend to the composer, which shows every series they draw, once. -->
<PlotComposer
	width={760}
	height={360}
	title="Life expectancy at birth, Argentina"
	tags="A"
	layout={{ columns: 2 }}
>
	<LinePlot data={LIFE} x="year" y="value" color="sex" scales={{ x: { nice: false } }} />
	<ScatterPlot data={LIFE} x="year" y="value" color="sex" />
</PlotComposer>
