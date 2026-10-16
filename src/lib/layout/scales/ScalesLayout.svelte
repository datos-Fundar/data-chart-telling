<script lang="ts" generics="TData extends Record<string, unknown>">
	import { getContext, untrack } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { AxisX, AxisY, GridX, GridY } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { tickStep, ticksInRange, naturalTickCount } from '$lib/layout/scales/niceDomain';
	import { DISCRETE_SCALE_TYPES } from '$lib/types/layout/scales';
	import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
	import type { AxisValue } from '$lib/types/layout/mapping';

	/** Axis ticks, titles and grid lines for the plot kinds with an x/y axis pair. */
	let {
		data,
		getX,
		getY,
		width,
		height,
		numericMargins,
		scales
	}: {
		data: TData[];
		getX: (d: TData) => AxisValue;
		getY: (d: TData) => AxisValue;
		width: number;
		height: number;
		numericMargins: { top: number; right: number; bottom: number; left: number };
		scales?: AxisBasedScalesConfig<TData>;
	} = $props();

	const cfg = $derived(getConfiguration());
	const plot = usePlot().svelteplot;

	const xValues = $derived(data.map(getX));
	const yValues = $derived(data.map(getY));

	/** `[min, max]` of a numeric pinned `scale.domain`, else of `values`. */
	function axisExtent(
		scale: AxisBasedScalesConfig<TData>['x'],
		values: AxisValue[]
	): [number, number] | undefined {
		const domainNumbers = scale?.domain?.filter((d): d is number => typeof d === 'number');
		const source =
			domainNumbers && domainNumbers.length >= 2
				? domainNumbers
				: values.filter((v): v is number => typeof v === 'number');
		if (source.length < 2) return undefined;
		const lo = Math.min(...source);
		const hi = Math.max(...source);
		return hi > lo ? [lo, hi] : undefined;
	}

	/** An axis paired with a discrete scale plays the "index" role for the pair, so *this* axis is the plain magnitude/value one (see `autoTickCount`, `edgeInclusiveTicks`). */
	const isDiscreteType = (type: string) =>
		(DISCRETE_SCALE_TYPES as readonly string[]).includes(type);

	/**
	 * Tick count for an index-like axis: its distinct values, at most what fits
	 * the pixel span. Unset when the caller sets tick density or the domain.
	 */
	function autoTickCount(
		oppositeType: string | undefined,
		scale: AxisBasedScalesConfig<TData>['x'],
		values: AxisValue[],
		span: number,
		spacing: number,
		min: number
	): number | undefined {
		if (
			scale?.ticks != null ||
			scale?.tickSpacing != null ||
			scale?.interval != null ||
			scale?.domain != null
		)
			return undefined;
		if (oppositeType != null && isDiscreteType(oppositeType)) return undefined;
		const uniqueCount = new Set(values.map(String)).size;
		const natural = naturalTickCount(span, spacing, min);
		return uniqueCount >= 2 && uniqueCount < natural ? uniqueCount : undefined;
	}

	/** Forces a whole-unit tick interval on an integer domain that spans fewer integers than the pixel span would naturally want ticks for. */
	function integerTickInterval(
		scale: AxisBasedScalesConfig<TData>['x'],
		values: AxisValue[],
		span: number,
		spacing: number,
		min: number
	): number | undefined {
		if (scale?.ticks != null || scale?.tickSpacing != null || scale?.interval != null)
			return undefined;
		if (scale?.type != null && scale.type !== 'linear' && scale.type !== 'auto') return undefined;
		const extent = axisExtent(scale, values);
		if (!extent) return undefined;
		const [lo, hi] = extent;
		if (!Number.isInteger(lo) || !Number.isInteger(hi)) return undefined;
		return hi - lo < naturalTickCount(span, spacing, min) ? 1 : undefined;
	}

	const xSpan = $derived(Math.max(0, width - numericMargins.left - numericMargins.right));
	const ySpan = $derived(Math.max(0, height - numericMargins.top - numericMargins.bottom));

	const xTickCount = $derived(autoTickCount(plot.scales.y.type, scales?.x, xValues, xSpan, 80, 3));
	const yTickCount = $derived(autoTickCount(plot.scales.x.type, scales?.y, yValues, ySpan, 50, 2));

	const xTickInterval = $derived(integerTickInterval(scales?.x, xValues, xSpan, 80, 3));
	const yTickInterval = $derived(integerTickInterval(scales?.y, yValues, ySpan, 50, 2));

	/**
	 * A continuous axis' nice ticks plus its domain's endpoints, when the
	 * opposite axis is continuous too - at least a whole unit apart when every
	 * value is a whole number. Unset when the caller sets tick density
	 * or the domain.
	 */
	function edgeInclusiveTicks(
		oppositeType: string | undefined,
		scale: AxisBasedScalesConfig<TData>['x'],
		values: AxisValue[],
		span: number,
		spacing: number,
		min: number
	): number[] | undefined {
		if (
			scale?.ticks != null ||
			scale?.tickSpacing != null ||
			scale?.interval != null ||
			scale?.domain != null
		)
			return undefined;
		if (oppositeType != null && isDiscreteType(oppositeType)) return undefined;
		if (scale?.type != null && scale.type !== 'linear' && scale.type !== 'auto') return undefined;
		const extent = axisExtent(scale, values);
		if (!extent) return undefined;
		const [lo, hi] = extent;
		const count = naturalTickCount(span, spacing, min);
		// Whole-number values (years, counts) never get ticks between them.
		const integers = values.every((v) => typeof v !== 'number' || Number.isInteger(v));
		const step = integers ? Math.max(1, tickStep(lo, hi, count)) : tickStep(lo, hi, count);
		const base = ticksInRange(lo, hi, step);
		const eps = step * 1e-6;
		const withLo = base.length === 0 || base[0] - lo > eps ? [lo, ...base] : base;
		return withLo.length === 0 || hi - withLo[withLo.length - 1] > eps ? [...withLo, hi] : withLo;
	}

	const xTicksExplicit = $derived(
		edgeInclusiveTicks(plot.scales.y.type, scales?.x, xValues, xSpan, 80, 3)
	);

	const yTitleFontSize = $derived(scales?.y?.titleFontSize ?? cfg.axis.titleFontSize);

	/**
	 * Vertical Y-axis title placement, when `scales.y.labelOrientation === 'vertical'`:
	 * `scales.y.label`, else the channel name svelteplot would title the axis with.
	 */
	const verticalYLabel = $derived.by(() => {
		if (scales?.y?.labelOrientation !== 'vertical' || scales.y.label === false) return null;
		const text = scales.y.label || plot.scales.y.autoTitle;
		if (!text) return null;
		const position = scales.y.labelPosition ?? 'middle';
		const x = yTitleFontSize;
		const top = numericMargins.top;
		const bottom = height - numericMargins.bottom;
		const y = position === 'top' ? top : (top + bottom) / 2;
		return { text, x, y, anchor: position === 'top' ? ('end' as const) : ('middle' as const) };
	});

	// svelteplot sizes an `'auto'` left margin to the widest need its marks
	// register here; a vertical title asks for the y axis' own plus its line.
	const { autoMarginLeft } = getContext<{ autoMarginLeft: Writable<Map<string, number>> }>(
		'svelteplot/autoMargins'
	);
	const marginId = `dct-vertical-y-label-${Math.random().toString(36).slice(2)}`;
	const VERTICAL_LABEL_GAP = 6;
	const axisMarginLeft = $derived(
		Math.max(0, ...[...$autoMarginLeft].filter(([id]) => id !== marginId).map(([, v]) => v))
	);
	$effect(() => {
		const wanted =
			verticalYLabel && (scales?.y?.axisDisplay ?? 'visible') === 'visible'
				? axisMarginLeft + Math.ceil(yTitleFontSize * 1.25) + VERTICAL_LABEL_GAP
				: undefined;
		untrack(() => {
			if (wanted === undefined) $autoMarginLeft.delete(marginId);
			else if ($autoMarginLeft.get(marginId) !== wanted) $autoMarginLeft.set(marginId, wanted);
		});
	});
	$effect(() => () => {
		$autoMarginLeft.delete(marginId);
	});
</script>

{#snippet axisX()}
	<AxisX
		ticks={xTicksExplicit}
		tickCount={xTickCount}
		interval={xTickInterval}
		tickSize={scales?.x?.tickSize ?? cfg.axis.xTickSize}
		tickPadding={scales?.x?.tickPadding ?? cfg.axis.xTickPadding}
		tickFontSize={cfg.axis.fontSize}
		titleFontSize={scales?.x?.titleFontSize ?? cfg.axis.titleFontSize}
	/>
{/snippet}
{#if scales?.x?.axisDisplay === 'hidden'}
	<g style:visibility="hidden">{@render axisX()}</g>
{:else if scales?.x?.axisDisplay !== 'none'}
	{@render axisX()}
{/if}
{#snippet axisY()}
	<AxisY
		tickCount={yTickCount}
		interval={yTickInterval}
		tickSize={scales?.y?.tickSize ?? cfg.axis.yTickSize}
		tickPadding={scales?.y?.tickPadding ?? cfg.axis.yTickPadding}
		tickFontSize={cfg.axis.fontSize}
		titleFontSize={scales?.y?.titleFontSize ?? cfg.axis.titleFontSize}
	/>
{/snippet}
{#if scales?.y?.axisDisplay === 'hidden'}
	<g style:visibility="hidden">{@render axisY()}</g>
{:else if scales?.y?.axisDisplay !== 'none'}
	{@render axisY()}
{/if}
{#if verticalYLabel && (scales?.y?.axisDisplay ?? 'visible') === 'visible'}
	<text
		x={verticalYLabel.x}
		y={verticalYLabel.y}
		transform="rotate(-90, {verticalYLabel.x}, {verticalYLabel.y})"
		text-anchor={verticalYLabel.anchor}
		font-size={yTitleFontSize}
		fill={cfg.axis.color}
		opacity="0.8">{verticalYLabel.text}</text
	>
{/if}
{#if scales?.x?.grid}
	<GridX
		stroke={typeof scales.x.grid === 'object' ? scales.x.grid.stroke : undefined}
		strokeWidth={typeof scales.x.grid === 'object' ? scales.x.grid.strokeWidth : undefined}
		strokeOpacity={typeof scales.x.grid === 'object' ? scales.x.grid.strokeOpacity : undefined}
		strokeDasharray={typeof scales.x.grid === 'object' ? scales.x.grid.strokeDasharray : undefined}
	/>
{/if}
{#if scales?.y?.grid}
	<GridY
		stroke={typeof scales.y.grid === 'object' ? scales.y.grid.stroke : undefined}
		strokeWidth={typeof scales.y.grid === 'object' ? scales.y.grid.strokeWidth : undefined}
		strokeOpacity={typeof scales.y.grid === 'object' ? scales.y.grid.strokeOpacity : undefined}
		strokeDasharray={typeof scales.y.grid === 'object' ? scales.y.grid.strokeDasharray : undefined}
	/>
{/if}
