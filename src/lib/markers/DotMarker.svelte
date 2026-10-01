<script lang="ts" generics="TData = Record<string, unknown>">
	import { Dot } from 'svelteplot';
	import {
		resolveChannelFill,
		resolveChannelSymbol,
		resolveChannelOpacityBuckets
	} from '$lib/markers/resolveChannelFill';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import type { DotMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'dot'` marker. `x`/`y` also accept a literal number/Date
	 * (every row draws at that fixed position) — used by markers like
	 * `DeltaMarker`/`PeakMarker` that place a dot at a computed point.
	 */
	const { marker }: { marker: DotMarkerConfig } = $props();

	const data = $derived((marker.data ?? []) as TData[]);
	const x = $derived(marker.x);
	const y = $derived(marker.y);
	const rProp = $derived(marker.r);
	const fillProp = $derived(marker.fill);
	const color = $derived(marker.color ? resolveAccessor(marker.color) : undefined);
	const opacityProp = $derived(marker.opacity ? resolveAccessor(marker.opacity) : undefined);
	const symbolProp = $derived(marker.symbol ? resolveAccessor(marker.symbol) : undefined);
	const scales = $derived(marker.scales);
	const styles = $derived(marker.styles);

	const cfg = $derived(getConfiguration());

	/**
	 * A per-row accessor (a field key string, now that it's forwarded raw, or
	 * a function) reads its position per row and needs real `data` to do
	 * that — an empty `data` legitimately means "nothing to plot", not "draw
	 * one anyway". Only a true literal (a number/Date, or unset) draws one
	 * dot at a fixed point regardless of `data`.
	 */
	const isAccessor = (v: unknown) => typeof v === 'function' || typeof v === 'string';
	const displayData = $derived(
		data.length > 0 || isAccessor(x) || isAccessor(y) ? data : [{} as TData]
	);

	const resolvedFill = $derived(resolveChannelFill(displayData, color, scales, cfg));
	const resolvedSymbolFn = $derived(resolveChannelSymbol(displayData, symbolProp, scales, cfg));
	/**
	 * `opacity` can't be a live per-row function the way `color`/`symbol` are —
	 * svelteplot re-derives its own domain from whatever a `fillOpacity`
	 * accessor returns and re-normalizes it (no "already resolved" escape
	 * hatch for a bare number, unlike a recognized CSS color/shape string) —
	 * so an active `opacity` channel splits `displayData` into buckets,
	 * each rendered as its own `<Dot>` call with one literal opacity value.
	 */
	const opacityBuckets = $derived(
		resolveChannelOpacityBuckets(displayData, opacityProp, scales, cfg)
	);

	const r = $derived(rProp ?? styles?.dotRadius ?? 5);
	const fill = $derived(resolvedFill ?? fillProp ?? styles?.dotFill ?? 'currentColor');
	const flatFillOpacity = $derived(styles?.dotFillOpacity ?? 1);
	const symbol = $derived(resolvedSymbolFn ?? styles?.dotSymbol ?? 'circle');
	const stroke = $derived(styles?.dotStroke ?? 'currentColor');
	const strokeWidth = $derived(styles?.dotStrokeWidth ?? 1);
	const strokeOpacity = $derived(styles?.dotStrokeOpacity ?? 1);
	const strokeDasharray = $derived(styles?.dotStrokeDasharray);
</script>

{#if opacityBuckets}
	{#each opacityBuckets as bucket (bucket.value)}
		<Dot
			data={bucket.data}
			x={x ?? 0}
			y={y ?? 0}
			{r}
			{fill}
			fillOpacity={bucket.value}
			{stroke}
			{strokeWidth}
			{strokeOpacity}
			{strokeDasharray}
			{symbol}
		/>
	{/each}
{:else}
	<Dot
		data={displayData}
		x={x ?? 0}
		y={y ?? 0}
		{r}
		{fill}
		fillOpacity={flatFillOpacity}
		{stroke}
		{strokeWidth}
		{strokeOpacity}
		{strokeDasharray}
		{symbol}
	/>
{/if}
