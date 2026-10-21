<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';

	let { align = true }: { align?: boolean } = $props();

	const YEARS = [2018, 2019, 2020, 2021, 2022];
	// Value axes spanning a few units against millions: very different tick label widths.
	const rate = YEARS.map((year, i) => ({ year, value: 3 + Math.sin(i) * 1.5 }));
	const exports = YEARS.map((year, i) => ({ year, value: 2_400_000 + i * 350_000 }));
</script>

<PlotComposer
	width={720}
	height={460}
	title="Unemployment rate and exports"
	tags="A"
	layout={{ columns: 1, align }}
>
	<LinePlot data={rate} x="year" y="value" />
	<BarPlot data={exports} x="year" y="value" />
</PlotComposer>
