<script lang="ts">
	import PlotComposer from '$lib/layout/composer/PlotComposer.svelte';
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import type { HoverStrategy } from '$lib/types/layout/hover';

	let { strategy }: { strategy: HoverStrategy } = $props();

	const DATA = [2018, 2019, 2020].map((year, i) => ({ year, value: 10 + i * 5 }));
</script>

<PlotComposer width={500} height={300} hover={{ strategy }}>
	<LinePlot data={DATA} x="year" y="value" markers={[{ type: 'hover' }]} />
</PlotComposer>
