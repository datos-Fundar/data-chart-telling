<script lang="ts">
	import { RuleX, RuleY } from 'svelteplot';
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import type { AxisValue } from '$lib/types/layout/scales';
	import type { StrokeStyle } from '$lib/types/plots/styling';

	/**
	 * A single vertical (`axis: 'x'`) or horizontal (`axis: 'y'`) reference
	 * line — or, with `data`, one line per row. Shared by author-configured
	 * `'rule'` markers and `HoverMarker`'s crosshair (which always calls it
	 * with a literal `value` and no `data`). Falls back to `'currentColor'`/`1`
	 * when the caller supplies no style. See `RuleMarkerConfig`'s own doc
	 * comment for `value`/`x1`/`x2`/`y1`/`y2`/inset semantics — forwarded here
	 * straight through to svelteplot's own `RuleX`/`RuleY`.
	 */
	let {
		axis,
		data,
		value,
		x1,
		x2,
		y1,
		y2,
		inset,
		insetTop,
		insetBottom,
		insetLeft,
		insetRight,
		styles
	}: {
		axis: 'x' | 'y';
		data?: Record<string, unknown>[];
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		value: AxisValue | string | ((d: any) => AxisValue);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		x1?: string | number | ((d: any) => AxisValue);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		x2?: string | number | ((d: any) => AxisValue);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		y1?: string | number | ((d: any) => AxisValue);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		y2?: string | number | ((d: any) => AxisValue);
		inset?: number;
		insetTop?: number;
		insetBottom?: number;
		insetLeft?: number;
		insetRight?: number;
		styles?: StrokeStyle;
	} = $props();

	const RuleMark = $derived(axis === 'x' ? RuleX : RuleY);
	const rows = $derived(data ?? [{ v: value }]);
	const positionFn = $derived(
		data
			? // eslint-disable-next-line @typescript-eslint/no-explicit-any
				resolveAccessor(value as any)
			: (d: { v: AxisValue }) => d.v
	);
</script>

<RuleMark
	data={rows}
	{...axis === 'x' ? { x: positionFn, y1, y2 } : { y: positionFn, x1, x2 }}
	{inset}
	{...axis === 'x' ? { insetTop, insetBottom } : { insetLeft, insetRight }}
	stroke={styles?.stroke ?? 'currentColor'}
	strokeWidth={styles?.strokeWidth ?? 1}
	strokeOpacity={styles?.strokeOpacity ?? 1}
	strokeDasharray={styles?.strokeDasharray}
/>
