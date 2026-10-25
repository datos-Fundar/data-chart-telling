<script lang="ts">
	import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
	import { COUNTRIES_AT_2007 } from '$datasets';
</script>

<!--
	`size` and `symbol` adjust the sections their channels add: which sizes
	show and how they read, and how the shapes lay out.
-->
<ScatterPlot
	width={760}
	height={400}
	data={COUNTRIES_AT_2007}
	x="gdp"
	y="life"
	symbol="continent"
	r="population"
	legend={{
		r: { title: 'People', values: [10, 100, 300], format: (v: number) => `${v} M` },
		symbol: { title: 'Continent', columns: 2 }
	}}
/>
