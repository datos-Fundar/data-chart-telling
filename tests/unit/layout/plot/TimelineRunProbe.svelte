<script lang="ts">
	import Plot from '$lib/layout/plot/Plot.svelte';
	import LineCore from '$lib/layout/plot/Core.svelte';
	import { Pipeline } from '$lib/phases/Pipeline';
	import { buildLineDefaults } from '$lib/plots/line/defaults';
	import type { FacetConfig } from '$lib/types/layout/facet';
	import type { TimelineConfig } from '$lib/types/layout/timeline';

	/** A faceted line plot whose only changing prop is its timeline's `progress`. */
	let { progress, onDataRun }: { progress: number; onDataRun: () => void } = $props();

	const data = ['Norte', 'Sur', 'Cuyo'].flatMap((region, r) =>
		[2021, 2022, 2023].map((anio, a) => ({ anio, region, valor: 3 + r * 7 + a }))
	);
	type Row = Record<string, unknown>;
	const core = { data, width: 720, height: 360, x: 'anio', y: 'valor' } as const;
	const facet: FacetConfig<Row> = { by: 'region' };

	// The line kind's pipeline, counting its data runs.
	function defaults() {
		const pipeline = Pipeline.ofAxisKind(buildLineDefaults());
		const runData = pipeline.runData.bind(pipeline);
		pipeline.runData = (...args) => {
			onDataRun();
			return runData(...args);
		};
		return pipeline;
	}
	const timeline = $derived<TimelineConfig<Row>>({ accessor: 'anio', progress });
</script>

<Plot Core={LineCore} {core} {defaults} {facet} {timeline} />
