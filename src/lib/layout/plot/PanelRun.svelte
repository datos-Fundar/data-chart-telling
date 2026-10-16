<script lang="ts" generics="TRow extends Record<string, unknown>">
	import { LegendState } from '$lib/layout/legend/LegendState.svelte';
	import type { Snippet } from 'svelte';
	import type { FacetStageState } from '$lib/types/phases';

	/**
	 * Runs a plot's data phases once over `rows`, for every facet panel, under
	 * the legend in scope, and hands the result to `children`. `frame` is the
	 * same run over the same rows without the legend: reused while the legend
	 * omits no series, since only omitting one changes the data phases.
	 */
	let {
		rows,
		run,
		frame,
		children
	}: {
		rows: TRow[];
		run: (rows: TRow[], legend: LegendState | null) => FacetStageState;
		frame?: FacetStageState;
		children: Snippet<[FacetStageState]>;
	} = $props();

	const legend = LegendState.current();
	const state = $derived(frame && !legend?.omits ? frame : run(rows, legend));
</script>

{@render children(state)}
