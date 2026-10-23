<script lang="ts">
	import { getContext, setContext, type Snippet } from 'svelte';
	import { ZoomedProjection } from '$lib/layout/coordinates/ZoomedProjection';
	import type { GeoZoomTransform } from '$lib/layout/coordinates/zoom.svelte';
	import type { StreamingProjection } from '$lib/plots/utils/tiles';

	/**
	 * Draws everything inside it through the plot's projection moved by `inner`
	 * then `outer`, instead of scaling the drawn SVG: a zoom moves and spreads the
	 * positions, while dots, text and strokes keep their size. Works by handing
	 * the marks below a view of svelteplot's plot state whose `scales.projection`
	 * is the moved one.
	 */
	let {
		inner,
		outer,
		children
	}: { inner: GeoZoomTransform; outer: GeoZoomTransform; children: Snippet } = $props();

	type Scales = { projection?: StreamingProjection & { aspectRatio?: number } } | undefined;
	type PlotState = { scales: Scales; publicState: object };
	type PlotContext = { getPlotState: () => PlotState } & Record<string, unknown>;

	const context = getContext<PlotContext>('svelteplot');
	const state = context.getPlotState();

	const scales = $derived.by((): Scales => {
		const own = state.scales;
		return own?.projection
			? { ...own, projection: ZoomedProjection.of(own.projection, inner, outer) }
			: own;
	});

	const publicState = new Proxy(state.publicState, {
		get: (target, key) => (key === 'scales' ? scales : Reflect.get(target, key, target))
	});
	const movedState = new Proxy(state, {
		get: (target, key) => {
			if (key === 'scales') return scales;
			if (key === 'publicState') return publicState;
			return Reflect.get(target, key, target);
		}
	});

	setContext('svelteplot', { ...context, getPlotState: () => movedState });
</script>

{@render children()}
