<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import PlotPanel from '$lib/layout/composer/PlotPanel.svelte';
	import LinePlot from '$lib/plots/line/Plot.svelte';

	const DATA = [2018, 2019, 2020].map((year, i) => ({ year, value: 10 + i }));
</script>

<PlotComposer width={600} height={400}>
	<PlotPanel>
		{#snippet children({ width, height })}
			<LinePlot {width} {height} data={DATA} x="year" y="value" />
		{/snippet}
	</PlotPanel>
	<PlotPanel inset={{ left: 0.5, bottom: 0.5, right: 1, top: 1 }}>
		{#snippet children({ width, height })}
			<LinePlot {width} {height} data={DATA} x="year" y="value" />
		{/snippet}
	</PlotPanel>
</PlotComposer>
