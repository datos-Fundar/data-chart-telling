<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';

	const rows = (names: string[]) =>
		names.flatMap((metric) => [1, 2, 3].map((year) => ({ metric, year, value: year * 10 })));
</script>

<PlotComposer width={600} height={300} layout={{ columns: 2 }}>
	<LinePlot data={rows(['GDP', 'Employment'])} x="year" y="value" color="metric" />
	<LinePlot data={rows(['Hidden'])} x="year" y="value" color="metric" legend={false} />
</PlotComposer>
