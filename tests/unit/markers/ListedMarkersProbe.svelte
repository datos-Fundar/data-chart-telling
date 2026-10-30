<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import type { LinePlotProps } from '$lib/types/plots/evolution/line/props';

	let { markers }: { markers: LinePlotProps<Record<string, unknown>>['markers'] } = $props();

	const data = [2000, 2005, 2010, 2015, 2020].flatMap((year) => [
		{ year, series: 'a', value: year - 1990 },
		{ year, series: 'b', value: (year - 1990) / 2 }
	]);
</script>

<LinePlot {data} x="year" y="value" color="series" width={600} height={400} {markers} />
