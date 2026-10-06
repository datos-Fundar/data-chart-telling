import { getHover, createHover } from '$lib/layout/tooltip/hover.svelte';
import { createHoverController } from '$lib/layout/tooltip/controller.svelte';
import type { HoverConfig } from '$lib/types/plots/props';
import type { AxisValue } from '$lib/types/layout/mapping';

/** This facet's resolved hover store (shared across synced facets, else local) plus its hover controller. */
export function createPlotHover<TData extends Record<string, unknown>>(args: {
	hover: () => HoverConfig<TData>;
	getX: () => (d: TData) => AxisValue;
	getY: () => (d: TData) => AxisValue;
	width: () => number;
	height: () => number;
}) {
	const sharedHover = getHover();
	const localHover = createHover();
	const hoverStore = $derived(sharedHover ?? localHover);

	$effect(() => {
		if (sharedHover) return;
		localHover.strategy = args.hover().strategy ?? 'x';
		localHover.sync = args.hover().sync ?? false;
	});

	const ctrl = createHoverController<TData>({
		hover: () => hoverStore,
		facetId: () => args.hover().tooltip?.facetId ?? '',
		points: () => args.hover().points,
		getX: args.getX,
		getY: args.getY,
		label: () => args.hover().label,
		seriesFilter: () => args.hover().tooltip?.series,
		width: args.width,
		height: args.height,
		crosshair: () => args.hover().crosshair
	});

	return {
		get hoverStore() {
			return hoverStore;
		},
		ctrl
	};
}

/** Return type of {@link createPlotHover}. */
export type PlotHover<TData extends Record<string, unknown>> = ReturnType<
	typeof createPlotHover<TData>
>;
