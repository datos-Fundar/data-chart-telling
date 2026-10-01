<script lang="ts">
	import { isHorizontalFor } from '$lib/markers/orientation';
	import { RegressionX, RegressionY, usePlot } from 'svelteplot';
	import type { RegressionMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'regression'` marker — a fitted curve (svelteplot's
	 * `RegressionX`/`RegressionY`), with a confidence band shown by default
	 * (svelteplot's own default `confidence` is `0.99`; set `confidence:
	 * false` to omit it). `RegressionX` or `RegressionY` is picked from the plot's
	 * axis scale types (see `isHorizontalFor`).
	 *
	 * Confirmed empirically: the band always renders in the same color as
	 * `stroke`, at a fixed low opacity — its own `fill` prop takes no
	 * author-supplied value (any literal or per-row function alike renders
	 * identically); passing it at all is only what turns the band on, so
	 * it's set here as a fixed placeholder gated on `confidence` being
	 * active, never exposed as its own style option.
	 */
	let { marker }: { marker: RegressionMarkerConfig } = $props();

	const plot = usePlot();
	const isHorizontal = $derived(isHorizontalFor(plot.scales.x?.type, plot.scales.y?.type));

	const data = $derived(marker.data ?? []);
</script>

{#if isHorizontal}
	<RegressionX
		{data}
		x={marker.x}
		y={marker.y}
		type={marker.regressionType}
		order={marker.order}
		base={marker.base}
		span={marker.span}
		confidence={marker.confidence}
		stroke={marker.styles?.stroke ?? 'currentColor'}
		strokeWidth={marker.styles?.strokeWidth}
		strokeOpacity={marker.styles?.strokeOpacity}
		strokeDasharray={marker.styles?.strokeDasharray}
		fill={marker.confidence !== false ? 'currentColor' : undefined}
	/>
{:else}
	<RegressionY
		{data}
		x={marker.x}
		y={marker.y}
		type={marker.regressionType}
		order={marker.order}
		base={marker.base}
		span={marker.span}
		confidence={marker.confidence}
		stroke={marker.styles?.stroke ?? 'currentColor'}
		strokeWidth={marker.styles?.strokeWidth}
		strokeOpacity={marker.styles?.strokeOpacity}
		strokeDasharray={marker.styles?.strokeDasharray}
		fill={marker.confidence !== false ? 'currentColor' : undefined}
	/>
{/if}
