<script lang="ts">
	import { RuleX, RuleY } from 'svelteplot';
	import type { AxisValue } from '$lib/types/layout/mapping';
	import type { RuleMarkerConfig } from '$lib/types/markers/common';

	/**
	 * A single vertical (`axis: 'x'`) or horizontal (`axis: 'y'`) reference
	 * line - or, with `data`, one line per row. Shared by author-configured
	 * `'rule'` markers and `HoverMarker`'s crosshair (which always calls it
	 * with a literal `value` and no `data`). Falls back to `'currentColor'`/`1`
	 * when the caller supplies no style. See `RuleMarkerConfig`'s own doc
	 * comment for `value`/`x1`/`x2`/`y1`/`y2`/inset semantics - forwarded here
	 * straight through to svelteplot's own `RuleX`/`RuleY`.
	 */
	const { marker }: { marker: RuleMarkerConfig } = $props();

	const axis = $derived(marker.axis);
	const data = $derived(marker.data);
	const value = $derived(marker.value);
	const styles = $derived(marker.styles);

	const RuleMark = $derived(axis === 'x' ? RuleX : RuleY);
	const rows = $derived(data ?? [{ v: value }]);
	/**
	 * With `data`, `value` is forwarded raw (a field key resolves per row via
	 * svelteplot's own `resolve()`, same as every other mark, and lets its
	 * axis-title auto-inference see the field name - a pre-resolved closure
	 * would defeat both). Without `data`, `value` is a literal against the
	 * single synthetic `{v: value}` row.
	 */
	const position = $derived(data ? value : (d: { v: AxisValue }) => d.v);

	/** A per-row channel given as a field key or a function, as the function svelteplot reads. */
	const accessor = <T,>(channel: string | ((d: never) => T) | undefined) =>
		typeof channel === 'string'
			? (d: Record<string, unknown>) => d[channel] as T
			: (channel as ((d: Record<string, unknown>) => T) | undefined);
	/** The stroke color per row is drawn as it is: `scale: null` keeps it out of svelteplot's color scale. */
	const stroke = $derived.by(() => {
		const own = accessor(marker.stroke);
		return own ? { value: own, scale: null } : (styles?.stroke ?? 'currentColor');
	});
	const strokeWidth = $derived(accessor<number>(marker.strokeWidth) ?? styles?.strokeWidth ?? 1);
	/** Like the color, the opacity per row is drawn as it is: svelteplot would map a function through its opacity scale. */
	const strokeOpacity = $derived.by(() => {
		const own = accessor<number>(marker.strokeOpacity);
		return (own ? { value: own, scale: null } : (styles?.strokeOpacity ?? 1)) as never;
	});
</script>

<RuleMark
	data={rows}
	{...axis === 'x'
		? { x: position, y1: marker.y1, y2: marker.y2 }
		: { y: position, x1: marker.x1, x2: marker.x2 }}
	inset={marker.inset}
	{...axis === 'x'
		? { insetTop: marker.insetTop, insetBottom: marker.insetBottom }
		: { insetLeft: marker.insetLeft, insetRight: marker.insetRight }}
	{stroke}
	{strokeWidth}
	{strokeOpacity}
	strokeDasharray={styles?.strokeDasharray}
/>
