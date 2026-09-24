<script lang="ts" generics="TData extends Record<string, unknown>">
	import { Text } from 'svelteplot';
	import { resolveAccessor } from '$lib/plots/utils/accessors';
	import { disabledFillOverride } from '$lib/plots/utils/legendDisabled';
	import { watchLabelOverflow } from '$lib/plots/utils/labelOverflow.svelte';
	import { isGapValue } from '$lib/plots/utils/gaps';
	import type { Series } from '$lib/types/plots/data/common';
	import type { ValuesStyle } from '$lib/types/layout/styles';
	import type { ValueAnchor } from '$lib/types/plots/constants';
	import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
	import type { VisualGroup } from '$lib/types/plots/segments/config';
	import type { LegendDisabledStyle } from '$lib/types/layout/legend';
	import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';
	import type { BarLayout } from '$lib/types/plots/bar/layout';

	/**
	 * Renders one series-group's value label — anchor-driven default
	 * position/offset, overridable per-field via `styles.values`. Positions
	 * account for the same grouped/stacked geometry as the bars themselves
	 * (via {@link BarLayout}), so a label lands on its own bar/segment instead
	 * of a shared default position.
	 */
	let {
		group,
		seriesIndex,
		barLayout,
		isHorizontal,
		valAnchor,
		formatValue,
		values,
		axisColor,
		disabled,
		width,
		height,
		numericMargins,
		onHoverSeries,
		onHoverEnd,
		onOverflow
	}: {
		group: VisualGroup<Series<TData>, BarSegmentStyle>;
		seriesIndex: number;
		barLayout: BarLayout;
		isHorizontal: boolean;
		valAnchor: ValueAnchor;
		formatValue: (value: number, seriesName: string) => string;
		values: ValuesStyle | undefined;
		axisColor: string;
		/** Resolved legend/hover-isolate dimming style for this group's series, if any. */
		disabled?: LegendDisabledStyle;
		/** The plot's own pixel size — together with `numericMargins`, the ground truth for its content box (see `bounds()` below). */
		width: number;
		height: number;
		/** `BasePlotLayout`'s resolved margins, already numeric on every side. */
		numericMargins: { top: number; right: number; bottom: number; left: number };
		/** Fired when the pointer enters this series' label — only wired when hover-isolate is enabled. */
		onHoverSeries?: () => void;
		onHoverEnd?: () => void;
		/** Reports how far this label overflows the plot's own content box, in pixels, on each side (0 = no overflow). */
		onOverflow?: (overflow: MarginOverflow) => void;
	} = $props();

	const fillOverride = $derived(disabledFillOverride(disabled));
	let groupEl: SVGGElement | undefined = $state();

	watchLabelOverflow({
		el: () => groupEl,
		// Built from our own `width`/`height`/`numericMargins` rather than
		// `usePlot().scales.x/y.fn.range()` — see line/ValueLabels.svelte's
		// matching comment for why that scale's exposed range can't be trusted
		// once a caller fixes `width`/`height` explicitly (every plot kind here
		// does).
		bounds: () => {
			// getBBox() inside isn't itself tracked — depend on whatever actually
			// changes the rendered label layout so this re-measures.
			void group;
			void values;
			void valAnchor;
			return {
				left: numericMargins.left,
				right: width - numericMargins.right,
				top: numericMargins.top,
				bottom: height - numericMargins.bottom
			};
		},
		onOverflow: (overflow) => onOverflow?.(overflow)
	});

	const xFn = $derived(resolveAccessor(group.series.x));
	const yFn = $derived(resolveAccessor(group.series.y));
	// A gap row — missing data, whether or not `styles.gaps` fills it with a
	// synthetic bar — never gets a value label, same as LinePlot's `lastPoints`.
	const labelData = $derived(group.series.data.filter((d) => !isGapValue(yFn(d))));

	const valueTextFn = $derived(
		barLayout.layout === 'stacked'
			? (d: TData) => barLayout.stackedBaseline(xFn(d), seriesIndex) + Number(yFn(d)) / 2
			: valAnchor === 'middle' && !isHorizontal
				? (d: TData) => Number(yFn(d)) / 2
				: valAnchor === 'end'
					? () => 0
					: (d: TData) => Number(yFn(d))
	);
	const defaultOffset = $derived(
		valAnchor === 'outside'
			? isHorizontal
				? 6
				: -6
			: valAnchor === 'start'
				? isHorizontal
					? -4
					: 4
				: valAnchor === 'end'
					? isHorizontal
						? 4
						: -4
					: 0
	);
	const defaultLA = $derived(
		valAnchor === 'outside' || valAnchor === 'end'
			? ('bottom' as const)
			: valAnchor === 'start'
				? ('top' as const)
				: ('middle' as const)
	);
	const groupOffset = $derived(barLayout.groupOffset(seriesIndex));
	const font = $derived(values?.fontStyle);

	// `textAnchor: 'outside'` is a per-point escape hatch resolved by
	// HoverMarker (which knows each point's signed x) — value labels already
	// have their own `anchor: 'outside'` concept (computed above), so if it
	// leaks through here just fall back to the anchor-derived default.
	const resolvedTextAnchor = $derived(
		font?.textAnchor === 'outside' ? undefined : font?.textAnchor
	);
</script>

<!-- svelteplot's Text mark never wires pointer handlers to its DOM node,
     despite declaring them in its types — a wrapping <g> catches the
     boundary crossing instead (pointerenter/leave fire on every ancestor). -->
<g
	bind:this={groupEl}
	role="presentation"
	onpointerenter={onHoverSeries}
	onpointerleave={onHoverEnd}
>
	<Text
		data={labelData}
		{...isHorizontal ? { y: xFn, x: valueTextFn } : { x: xFn, y: valueTextFn }}
		text={(d: TData) => formatValue(Number(yFn(d)), group.series.name)}
		dx={font?.dx ?? (isHorizontal ? defaultOffset : groupOffset.dx)}
		dy={font?.dy ?? (isHorizontal ? groupOffset.dy : defaultOffset)}
		textAnchor={resolvedTextAnchor ??
			(isHorizontal
				? valAnchor === 'outside' || valAnchor === 'end'
					? 'start'
					: valAnchor === 'start'
						? 'end'
						: 'middle'
				: 'middle')}
		lineAnchor={font?.lineAnchor ?? (isHorizontal ? 'middle' : defaultLA)}
		lineHeight={font?.lineHeight}
		rotate={font?.rotate}
		class={font?.class}
		textClass={font?.textClass}
		fill={font?.fill ?? axisColor}
		fillOpacity={fillOverride?.fillOpacity}
		fontSize={font?.fontSize ?? 12}
		fontWeight={font?.fontWeight}
		fontStyle={font?.fontStyle}
		stroke={font?.stroke}
		strokeWidth={font?.strokeWidth}
		paintOrder={font?.paintOrder}
	/>
</g>
