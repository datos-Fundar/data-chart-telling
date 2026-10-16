<script lang="ts" generics="TData extends Record<string, unknown>">
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { PlotInteraction } from '$lib/layout/interaction/PlotInteraction.svelte';
	import BasePlotLayout from '$lib/layout/base/BasePlotLayout.svelte';
	import { validateSegments } from '$lib/plots/utils/segments';
	import type { Pipeline } from '$lib/phases/Pipeline';
	import type { SegmentsConfig, MarginConfig } from '$lib/types/plots/props';
	import type { FacetStageState } from '$lib/types/phases';

	/**
	 * What every axis plot kind renders for one slice of its rows: its props
	 * run through the plot's `pipeline`, and the state that comes out drawn by
	 * `BasePlotLayout`. It sits under the plot's `Figure`, which provides the
	 * legend's toggles and the hover its phases read.
	 */
	type Props = {
		width: number;
		height: number;
		styles?: object;
		segments?: SegmentsConfig<never>;
		markers?: { type: string }[];
		scales?: object;
		margins?: MarginConfig;
		panelState?: FacetStageState;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		pipeline?: Pipeline<any, any>;
		data?: TData[];
		[prop: string]: unknown;
	};

	let {
		width,
		height,
		styles = {},
		segments = {},
		markers = [],
		scales = {},
		margins = $bindable(),
		panelState,
		pipeline,
		...rest
	}: Props = $props();

	$effect(() => {
		validateSegments(segments as never);
	});

	const cfg = $derived(getConfiguration());
	const interaction = PlotInteraction.current(() => cfg);
	const ctx = $derived({ cfg, interaction, range: interaction.legend?.range });

	const plotState = $derived(
		pipeline!.run(
			{ ...rest, width, height, styles, segments, markers, scales, margins },
			ctx,
			panelState
		)
	);
</script>

<BasePlotLayout {width} {height} state={plotState} bind:margins />
