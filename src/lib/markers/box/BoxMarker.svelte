<script lang="ts">
	import { BoxX, BoxY } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { CssColor } from '$lib/utils/color';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import type { BoxMarkerConfig } from '$lib/types/markers/common';

	/**
	 * Renders one `'box'` marker as `<BoxX>` or `<BoxY>`, picked from the
	 * way the plot runs (`usePlot().axes`) - `marker.x`/`marker.y`
	 * map straight onto the plot's axes either way.
	 * `bar`/`rule`/`dot`/`tickMedian`/`tickMinMax` forward straight through to
	 * svelteplot's own same-named options - see `BoxMarkerConfig`'s own doc
	 * comment for the default styling this wrapper adds on top, inherited
	 * from `bar`.
	 */
	let { marker }: { marker: BoxMarkerConfig } = $props();

	const plot = usePlot();
	const isHorizontal = $derived(plot.axes?.isHorizontal ?? false);
	const BoxMark = $derived(isHorizontal ? BoxX : BoxY);

	/**
	 * With `thickness`, the box is that many pixels across, centered on the
	 * marker's share of its category's band (`slot`), instead of filling the band:
	 * the bar's insets and every sub-mark's offset follow it.
	 */
	const thickness = $derived(marker.thickness);
	const slotIndex = $derived(marker.slot?.index ?? 0);
	const slotCount = $derived(marker.slot?.count ?? 1);
	const bandwidth = $derived.by(() => {
		const scale = isHorizontal ? plot.svelteplot.scales.y : plot.svelteplot.scales.x;
		return scale?.type === 'band' ? scale.fn.bandwidth() : 0;
	});
	const placement = $derived.by(() => {
		if (thickness == null || !bandwidth) return undefined;
		const share = bandwidth / slotCount;
		const offset = share * slotIndex + share / 2 - bandwidth / 2;
		const inset = Math.max(0, (bandwidth - thickness) / 2);
		return {
			inset,
			side: isHorizontal
				? { insetTop: inset, insetBottom: inset }
				: { insetLeft: inset, insetRight: inset },
			shift: isHorizontal ? { dy: offset } : { dx: offset }
		};
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const data = $derived((marker.data ?? []) as any[]);

	const cfg = $derived(getConfiguration());

	/**
	 * The bar's own fully-resolved options - the author's own `bar`, with
	 * `fill` defaulted to this package's own `cfg.palette[0]` when unset
	 * (svelteplot's own bare default, `currentColor`, can't be resolved to a
	 * real color at this layer). Every other sub-mark's own default styling
	 * (below) is derived from this one object, so a change to `bar` (e.g. its
	 * `fillOpacity`) cascades to `rule`/`dot`/both ticks unless that sub-mark's
	 * own options object overrides the specific field.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const bar: Record<string, any> = $derived({
		fill:
			(typeof marker.bar === 'object' && marker.bar.fill != null
				? (marker.bar.fill as string)
				: undefined) ?? cfg.palette[0],
		...placement?.side,
		...placement?.shift,
		...(typeof marker.bar === 'object' ? marker.bar : {})
	});
	const barFill = $derived(bar.fill as string);

	/** `bar.insetLeft`/`insetRight` averaged into one symmetric value - a tick's own `inset` is a single number/percentage, not independent left/right. */
	const tickInset = $derived.by(() => {
		if (placement) return placement.inset;
		const l = typeof bar.insetLeft === 'number' ? bar.insetLeft : undefined;
		const r = typeof bar.insetRight === 'number' ? bar.insetRight : undefined;
		if (l === undefined && r === undefined) return undefined;
		return ((l ?? 0) + (r ?? 0)) / 2;
	});

	/**
	 * The style fields a line-shaped sub-mark (`rule`, `tickMedian`,
	 * `tickMinMax` - stroke, no fill) inherits from `bar` by default, besides
	 * its own `stroke` color (passed in separately: contrasting for
	 * `tickMedian`, matching for `rule`/`tickMinMax`).
	 */
	function lineStyleDefaults(strokeColor: string): Record<string, unknown> {
		const out: Record<string, unknown> = { stroke: strokeColor };
		if (bar.strokeWidth !== undefined) out.strokeWidth = bar.strokeWidth;
		const strokeOpacity = bar.fillOpacity ?? bar.opacity;
		if (strokeOpacity !== undefined) out.strokeOpacity = strokeOpacity;
		if (bar.opacity !== undefined) out.opacity = bar.opacity;
		return out;
	}

	/** The style fields `dot` (fill + stroke, like `bar` itself) inherits from `bar` by default. */
	function fillStyleDefaults(): Record<string, unknown> {
		const out: Record<string, unknown> = { fill: barFill };
		if (bar.fillOpacity !== undefined) out.fillOpacity = bar.fillOpacity;
		if (bar.stroke !== undefined) out.stroke = bar.stroke;
		if (bar.strokeWidth !== undefined) out.strokeWidth = bar.strokeWidth;
		if (bar.strokeOpacity !== undefined) out.strokeOpacity = bar.strokeOpacity;
		if (bar.opacity !== undefined) out.opacity = bar.opacity;
		return out;
	}

	const ruleDefault = $derived({ ...lineStyleDefaults(barFill), ...placement?.shift });
	const dotDefault: Record<string, unknown> = $derived({
		...fillStyleDefaults(),
		...placement?.shift
	});
	const tickMedianDefault = $derived({
		...lineStyleDefaults(CssColor.contrastText(barFill)),
		...placement?.shift,
		...(tickInset !== undefined ? { inset: tickInset } : {})
	});
	const tickMinMaxDefault = $derived({
		...lineStyleDefaults(barFill),
		...placement?.shift,
		...(tickInset !== undefined ? { inset: tickInset } : {})
	});

	/**
	 * Resolves a `tickMedian`/`tickMinMax` value against this package's own
	 * default (enabled, with `defaultStyle`) - `false` hides it; `true` or
	 * unset shows it at just the default style; an options object shows it
	 * with the default style as a base, overridden by whatever the object
	 * itself sets.
	 */
	function resolveTick(
		value: boolean | Record<string, unknown> | undefined,
		defaultStyle: Record<string, unknown>
	): Record<string, unknown> | false {
		if (value === false) return false;
		if (value === undefined || value === true) return defaultStyle;
		return { ...defaultStyle, ...value };
	}

	const tickMedian = $derived(resolveTick(marker.tickMedian, tickMedianDefault));
	const tickMinMax = $derived(resolveTick(marker.tickMinMax, tickMinMaxDefault));
	const rule = $derived({
		...ruleDefault,
		...(typeof marker.rule === 'object' ? marker.rule : {})
	});
	/**
	 * `dot.fill: true` is svelteplot's own `currentColor` shorthand, which would
	 * paint the outliers in the text color. Here it means the box's own fill,
	 * so outliers take the series color like the box does.
	 */
	const dot = $derived.by(() => {
		const own = typeof marker.dot === 'object' ? marker.dot : {};
		const fill = own.fill === true ? barFill : 'fill' in own ? own.fill : dotDefault.fill;
		return { ...dotDefault, ...own, fill };
	});

	/**
	 * Cast once here (rather than at each call site) since this package's own
	 * `Record<string, unknown>` is looser than svelteplot's own
	 * `Record<string, ChannelAccessor>`.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const passthrough: Record<string, any> = $derived({
		bar,
		rule,
		dot,
		tickMedian,
		tickMinMax
	});
</script>

<BoxMark {data} x={marker.x} y={marker.y} sort={marker.sort} {...passthrough} />
