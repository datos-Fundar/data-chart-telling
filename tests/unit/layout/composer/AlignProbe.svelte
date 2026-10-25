<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';

	let { align = false }: { align?: boolean } = $props();

	// Tick labels of very different widths, so each plot sizes a different left margin.
	const PANELS = [5, 5_000_000].map((scale) =>
		[2018, 2019, 2020].map((year, i) => ({ year, value: scale * (1 + i) }))
	);
</script>

<PlotComposer width={600} height={400} layout={{ columns: 1, align }}>
	{#each PANELS as data, i (i)}
		<LinePlot {data} x="year" y="value" />
	{/each}
</PlotComposer>
