<script lang="ts">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import { merge } from '$lib/utils/merge';
	import type { Component } from 'svelte';
	import { Pipeline } from '$lib/phases/Pipeline';
	import type { AxisPlotDefaults } from '$lib/types/phases';
	import type { PlotCellContext } from '$lib/types/layout/plot';
	import type { FacetConfig } from '$lib/types/layout/facet';

	/* eslint-disable @typescript-eslint/no-explicit-any */
	let {
		Core,
		core,
		buildDefaults,
		facet,
		once,
		legend,
		onDataRun = () => {}
	}: {
		Core: Component<any, any, any>;
		core: Record<string, unknown>;
		buildDefaults: () => AxisPlotDefaults<any, any>;
		facet: FacetConfig<any>;
		/** One data run every panel reads, or each panel's core running every phase over its rows. */
		once: boolean;
		legend?: unknown;
		onDataRun?: () => void;
	} = $props();
	/* eslint-enable @typescript-eslint/no-explicit-any */

	function perFacet(cell: PlotCellContext<Record<string, unknown>, object>) {
		return {
			...core,
			data: cell.data,
			width: cell.width,
			height: cell.height,
			margins: cell.margins,
			scales: merge(cell.scales, core.scales as object | undefined),
			tooltip: cell.tooltip
		} as never;
	}

	// The kind's pipeline, counting its data runs.
	function defaults() {
		const pipeline = Pipeline.ofAxisKind(buildDefaults());
		const runData = pipeline.runData.bind(pipeline);
		pipeline.runData = (...args) => {
			onDataRun();
			return runData(...args);
		};
		return pipeline;
	}
</script>

<!-- Without `once`, each cell's core gets its rows and shared scales but no panel state, so it runs every phase. -->
<Plot
	{Core}
	core={core as never}
	{defaults}
	facet={facet as never}
	slice={once ? undefined : perFacet}
	legend={legend as never}
/>
