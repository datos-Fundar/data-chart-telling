<script lang="ts" generics="TData extends Record<string, unknown>">
	import { getContext, untrack } from 'svelte';
	import type { Writable } from 'svelte/store';
	import { AxisX, AxisY, GridX, GridY } from 'svelteplot';
	import { usePlot } from '$lib/layout/plot/usePlot';
	import { getConfiguration } from '$lib/configuration/config.svelte';
	import { NiceTicks } from '$lib/layout/scales/NiceTicks';
	import { EdgeTicks } from '$lib/layout/scales/EdgeTicks';
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
		scales,
		edgeDomains = undefined,
		tickValues = undefined,
		fittedAxes = undefined
	}: {
		data: TData[];
		getX: (d: TData) => AxisValue;
		getY: (d: TData) => AxisValue;
		width: number;
		height: number;
		numericMargins: { top: number; right: number; bottom: number; left: number };
		scales?: AxisBasedScalesConfig<TData>;
		/**
		 * Where to leave the domain an axis widens to when an edge tick's
		 * `'extend'` resolved a collision (see `EdgeTicks`), for the plot to give its scale.
		 */
		edgeDomains?: Map<'x' | 'y', [number, number]>;
		/** The labels a category axis writes, when it leaves some out for want of room. */
		tickValues?: Partial<Record<'x' | 'y', string[]>>;
		/** The axes whose domain the plot kind fit itself, which the author did not pin. */
		fittedAxes?: string[];
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

	/** An axis paired with a discrete scale plays the "index" role for the pair, so *this* axis is the plain magnitude/value one (see `autoTickCount`, `edgeTicksOf`). */
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
		const natural = NiceTicks.count(span, spacing, min);
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
		const numbers = values.filter((v): v is number => typeof v === 'number');
		if (numbers.length === 0 || !numbers.every(Number.isInteger)) return undefined;
		return hi - lo < NiceTicks.count(span, spacing, min) ? 1 : undefined;
	}

	const xSpan = $derived(Math.max(0, width - numericMargins.left - numericMargins.right));
	const ySpan = $derived(Math.max(0, height - numericMargins.top - numericMargins.bottom));

	const xTickCount = $derived(
		autoTickCount(plot.scales.y.type, scales?.x, xValues, xSpan, NiceTicks.SPACING.x, 3)
	);
	const yTickCount = $derived(
		autoTickCount(plot.scales.x.type, scales?.y, yValues, ySpan, NiceTicks.SPACING.y, 2)
	);

	const xTickInterval = $derived(
		integerTickInterval(scales?.x, xValues, xSpan, NiceTicks.SPACING.x, 3)
	);
	const yTickInterval = $derived(
		integerTickInterval(scales?.y, yValues, ySpan, NiceTicks.SPACING.y, 2)
	);

	/**
	 * A continuous axis' nice ticks plus the data's first and last values (see
	 * {@link EdgeTicks}), when its other axis is continuous too and the author
	 * left its density and domain to the plot. Unset otherwise.
	 */
	function edgeTicksOf(
		axis: 'x' | 'y',
		type: string | undefined,
		oppositeType: string | undefined,
		scale: AxisBasedScalesConfig<TData>['x'],
		values: AxisValue[],
		span: number,
		min: number
	) {
		if (
			scale?.ticks != null ||
			scale?.tickSpacing != null ||
			scale?.interval != null ||
			(scale?.domain != null && !fittedAxes?.includes(axis))
		)
			return undefined;
		if (type != null && isDiscreteType(type)) return undefined;
		if (oppositeType != null && isDiscreteType(oppositeType)) return undefined;
		if (scale?.type != null && scale.type !== 'linear' && scale.type !== 'auto') return undefined;
		const present = values.filter((v) => v != null);
		if (!present.every((v) => typeof v === 'number')) return undefined;
		return EdgeTicks.build({
			axis,
			values: (present as number[]).filter(Number.isFinite),
			span,
			spacing: NiceTicks.SPACING[axis],
			min,
			fontSize: cfg.axis.fontSize,
			options: EdgeTicks.resolve(scale?.edgeTicks, cfg.axis.edgeTicks[axis])
		});
	}

	const xEdgeTicks = $derived(
		edgeTicksOf('x', plot.scales.x.type, plot.scales.y.type, scales?.x, xValues, xSpan, 3)
	);
	const yEdgeTicks = $derived(
		edgeTicksOf('y', plot.scales.y.type, plot.scales.x.type, scales?.y, yValues, ySpan, 2)
	);

	// Hands the plot the domain an axis widens to, only when it changes.
	$effect(() => {
		const next = { x: xEdgeTicks?.domain, y: yEdgeTicks?.domain };
		untrack(() => {
			for (const axis of ['x', 'y'] as const) {
				const domain = next[axis];
				const current = edgeDomains?.get(axis);
				if (domain?.[0] === current?.[0] && domain?.[1] === current?.[1]) continue;
				if (domain) edgeDomains?.set(axis, domain);
				else edgeDomains?.delete(axis);
			}
		});
	});

	/** A turned label is written on one line: the axis does not wrap it. */
	const turned = $derived(scales?.x?.tickRotate ? { wordwrap: false } : {}) as Record<
		string,
		unknown
	>;

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
		ticks={(xEdgeTicks?.ticks ?? tickValues?.x) as string[] | undefined}
		{...turned}
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
		ticks={(yEdgeTicks?.ticks ?? tickValues?.y) as string[] | undefined}
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
