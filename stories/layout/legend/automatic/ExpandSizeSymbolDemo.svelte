<script lang="ts">
	import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
	import { COUNTRIES } from '../../../plots/correlation/scatter/data';
</script>

<!--
	`size` and `symbol` adjust the sections their channels add: which sizes
	show and how they read, and how the shapes lay out.
-->
<ScatterPlot
	width={760}
	height={400}
	data={COUNTRIES}
	x="gdpPerCapita"
	y="lifeExpectancy"
	symbol="region"
	r="population"
	legend={{
		r: { title: 'People', values: [10, 100, 300], format: (v: number) => `${v} M` },
		symbol: { title: 'Region', columns: 2 }
	}}
/>
