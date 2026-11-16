<script lang="ts">
	import { MarkerEvents } from '$lib/markers/utils/MarkerEvents';
	import { Paint } from '$lib/markers/utils/Paint';
	import GradientDefs from '$lib/markers/utils/GradientDefs.svelte';
	import { RegressionX, RegressionY } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import type { RegressionMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'regression'` marker - a fitted curve (svelteplot's
	 * `RegressionX`/`RegressionY`), with a confidence band shown by default
	 * (svelteplot's own default `confidence` is `0.99`; set `confidence:
	 * false` to omit it). `RegressionX` or `RegressionY` is picked from the way
	 * the plot runs (`usePlot().axes`).
	 *
	 * Confirmed empirically: the band always renders in the same color as
	 * `stroke`, at a fixed low opacity - its own `fill` prop takes no
	 * author-supplied value (any literal or per-row function alike renders
	 * identically); passing it at all is only what turns the band on, so
	 * it's set here as a fixed placeholder gated on `confidence` being
	 * active, never exposed as its own style option.
	 */
	let { marker }: { marker: RegressionMarkerConfig } = $props();
	const events = MarkerEvents.use(() => marker);

	const plot = usePlot();
	const isHorizontal = $derived(marker.isHorizontal ?? plot.axes?.isHorizontal ?? false);
	const RegressionMark = $derived(isHorizontal ? RegressionX : RegressionY);

	const data = $derived(marker.data ?? []);
	const id = $props.id();
	const stroke = $derived(Paint.single(marker.styles?.stroke, undefined, `${id}-stroke`));
</script>

<GradientDefs paints={[stroke]} />
<RegressionMark
	{...events.props}
	{data}
	x={marker.x}
	y={marker.y}
	type={marker.regressionType}
	order={marker.order}
	base={marker.base}
	span={marker.span}
	confidence={marker.confidence}
	stroke={stroke.value ?? 'currentColor'}
	strokeWidth={marker.styles?.strokeWidth}
	strokeOpacity={marker.styles?.strokeOpacity}
	strokeDasharray={marker.styles?.strokeDasharray}
	fill={marker.confidence !== false ? 'currentColor' : undefined}
/>
