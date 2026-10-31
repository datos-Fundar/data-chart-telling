<script lang="ts">
	import { getContext, setContext, untrack, type Snippet } from 'svelte';
	import { ZoomedProjection } from '$lib/layout/coordinates/ZoomedProjection';
	import type { GeoZoomTransform } from '$lib/layout/coordinates/zoom.svelte';
	import type { StreamingProjection } from '$lib/plots/utils/tiles';

	/**
	 * Draws everything inside it through the plot's projection moved by `inner`
	 * then `outer`, instead of scaling the drawn SVG: a zoom moves and spreads the
	 * positions, while dots, text and strokes keep their size. Works by handing
	 * the marks below a view of svelteplot's plot state whose `scales.projection`
	 * is the moved one.
	 *
	 * Re-projecting every mark is the cost of that, and a map with thousands of
	 * features pays it on each wheel tick. So while the view is moving, the marks
	 * already drawn are carried to it with an SVG transform (cheap, if briefly
	 * coarser: strokes and dots scale with it), and the projection is only moved,
	 * and the marks redrawn, once the view has been still for `settleDelay` ms.
	 */
	let {
		inner,
		outer,
		settleDelay = 120,
		children
	}: {
		inner: GeoZoomTransform;
		outer: GeoZoomTransform;
		/** Milliseconds the view must be still before the marks are re-projected */
		settleDelay?: number;
		children: Snippet;
	} = $props();

	const same = (a: GeoZoomTransform, b: GeoZoomTransform) =>
		a.k === b.k && a.x === b.x && a.y === b.y;

	// The view the marks are drawn for; the first one is the one they mount with.
	let settled = $state.raw(untrack(() => ({ inner: { ...inner }, outer: { ...outer } })));

	$effect(() => {
		const next = { inner: { ...inner }, outer: { ...outer } };
		if (same(next.inner, settled.inner) && same(next.outer, settled.outer)) return;
		const timer = setTimeout(() => (settled = next), settleDelay);
		return () => clearTimeout(timer);
	});

	const carry = $derived(
		ZoomedProjection.between(
			ZoomedProjection.compose(settled.inner, settled.outer),
			ZoomedProjection.compose(inner, outer)
		)
	);
	const carrying = $derived(carry.k !== 1 || carry.x !== 0 || carry.y !== 0);

	type Scales = { projection?: StreamingProjection & { aspectRatio?: number } } | undefined;
	type PlotState = { scales: Scales; publicState: object };
	type PlotContext = { getPlotState: () => PlotState } & Record<string, unknown>;

	const context = getContext<PlotContext>('svelteplot');
	const plot = context.getPlotState();

	const scales = $derived.by((): Scales => {
		const own = plot.scales;
		return own?.projection
			? { ...own, projection: ZoomedProjection.of(own.projection, settled.inner, settled.outer) }
			: own;
	});

	const publicState = new Proxy(plot.publicState, {
		get: (target, key) => (key === 'scales' ? scales : Reflect.get(target, key, target))
	});
	const movedState = new Proxy(plot, {
		get: (target, key) => {
			if (key === 'scales') return scales;
			if (key === 'publicState') return publicState;
			return Reflect.get(target, key, target);
		}
	});

	setContext('svelteplot', { ...context, getPlotState: () => movedState });
</script>

<g transform={carrying ? `translate(${carry.x} ${carry.y}) scale(${carry.k})` : undefined}>
	{@render children()}
</g>
