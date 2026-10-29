<script lang="ts" generics="TRow extends Record<string, unknown>">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import PlotScopeCore from './PlotScopeCore.svelte';
	import type { FacetConfig, FacetScoped } from '$lib/types/layout/facet';
	import type { TimelineConfig } from '$lib/types/layout/timeline';

	let {
		data,
		facet,
		timeline,
		markers,
		segments
	}: {
		data: TRow[];
		facet?: FacetConfig<TRow>;
		timeline?: TimelineConfig<TRow>;
		markers: (FacetScoped & { id: string; type: string })[];
		segments: Record<string, (FacetScoped & { id: string })[]>;
	} = $props();
</script>

<Plot
	Core={PlotScopeCore as never}
	core={{ width: 600, height: 400, markers, segments } as never}
	{data}
	{facet}
	{timeline}
	width={600}
	height={400}
/>
