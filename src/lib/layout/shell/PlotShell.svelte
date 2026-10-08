<script
	lang="ts"
	generics="TRow extends Record<string, unknown>, TScales extends object, TCore extends PlotShellCoreProps"
>
	import type { Component } from 'svelte';
	import PlotShellBody from '$lib/layout/shell/PlotShellBody.svelte';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { hasPlotShell, mergeScales } from '$lib/layout/shell/shell';
	import { buildTooltipConfig } from '$lib/layout/tooltip/utils';
	import type { PlotStylesConfig } from '$lib/types/configuration/styling';
	import type { TooltipProp } from '$lib/types/layout/tooltip';
	import type { MarginConfig, PlotChrome } from '$lib/types/plots/props';
	import type {
		PlotCellContext,
		PlotCellSnippet,
		PlotPresentation,
		PlotShellCoreProps
	} from '$lib/types/plots/presentation';
	import type { FacetConfig } from '$lib/types/layout/facet';
	import type { TimelineConfig } from '$lib/types/layout/timeline';

	/**
	 * Renders a plot kind's `Core` from its `core` props: bare when the plot has
	 * no chrome, timeline or facet, otherwise inside the shell, once per slice.
	 * `slice` builds the core's props for one slice; by default it swaps in the
	 * slice's rows, box, margins and shared scales. Without a `Core`, the `cell`
	 * snippet draws each slice instead - anything that takes `{ data, width, height }`.
	 * `presentation` is the kind's presentation, or how to build it from `core`.
	 * `margins` is bindable: a bare core reports the margin it settled on.
	 */
	let {
		Core,
		core,
		slice,
		cell,
		margins = $bindable(),
		tooltip,
		data,
		width,
		height,
		markers,
		title,
		subtitle,
		caption,
		header,
		footer,
		legend,
		order,
		timeline,
		facet,
		presentation
	}: PlotChrome & {
		// A generic plot core can't be typed against `core`'s own row type.
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		Core?: Component<any, Record<string, never>, 'margins'>;
		core?: TCore;
		slice?: (cell: PlotCellContext<TRow, TScales>) => TCore;
		cell?: PlotCellSnippet<TRow, TScales>;
		margins?: MarginConfig;
		tooltip?: TooltipProp<TRow>;
		/** The rows `timeline` and `facet` slice. Defaults to `core.data`. */
		data?: TRow[];
		width?: number;
		height?: number;
		markers?: { type: string }[];
		timeline?: TimelineConfig<TRow>;
		facet?: FacetConfig<TRow>;
		presentation:
			| PlotPresentation<TRow, TScales>
			| ((core: TCore, cfg: PlotStylesConfig) => PlotPresentation<TRow, TScales>);
	} = $props();

	const cfg = $derived(getConfiguration());
	const plotPresentation = $derived(
		typeof presentation === 'function' ? presentation(core as TCore, cfg) : presentation
	);
	const tooltipConfig = $derived(buildTooltipConfig(tooltip));

	const isBare = $derived(
		Core != null &&
			core != null &&
			!hasPlotShell({ title, subtitle, caption, header, footer, legend, timeline, facet })
	);

	function buildSliceProps(ctx: PlotCellContext<TRow, TScales>) {
		return {
			...core,
			...(ctx.data ? { data: ctx.data } : {}),
			width: ctx.width,
			height: ctx.height,
			margins: ctx.margins ?? margins,
			scales: mergeScales(ctx.scales, core?.scales as TScales | undefined),
			tooltip: ctx.tooltip
		};
	}
</script>

{#snippet coreCell(ctx: PlotCellContext<TRow, TScales>)}
	{#if cell}
		{@render cell(ctx)}
	{:else if Core}
		<Core {...(slice ?? buildSliceProps)(ctx)} />
	{/if}
{/snippet}

{#if isBare && Core && core}
	<Core {...core} bind:margins tooltip={tooltipConfig} />
{:else}
	<PlotShellBody
		{title}
		{subtitle}
		{caption}
		{header}
		{footer}
		{legend}
		{order}
		{timeline}
		{facet}
		width={width ?? core?.width ?? 0}
		height={height ?? core?.height ?? 0}
		data={data ?? (core?.data as TRow[] | undefined)}
		markers={markers ?? core?.markers}
		tooltip={tooltipConfig}
		presentation={plotPresentation}
		cell={coreCell}
	/>
{/if}
