<script lang="ts">
	import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
	import type { FacetConfig } from '$lib/types/layout/facet';

	type Row = { region: string; sex: 'male' | 'female'; year: number; value: number };

	let {
		data,
		width = 400,
		height = 320
	}: { data: Row[]; width?: number; height?: number } = $props();

	const facet: FacetConfig<Row> = {
		by: 'region',
		columns: 1,
		mode: 'paginated',
		pageSize: 1,
		navLayout: 'below'
	};
</script>

<LinePlot
	{data}
	{facet}
	{width}
	{height}
	x="year"
	y="value"
	color="sex"
	styles={{ values: { show: true } }}
/>
