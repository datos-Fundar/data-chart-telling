import { SERIES_KEY, processedPosition } from '$lib/layout/phases/transforms';
import { resolveTransforms } from '$lib/utils/transforms';
import { isGapValue } from '$lib/plots/utils/gaps';
import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { TextMarkerConfig } from '$lib/types/markers/common';
import type { Series } from '$lib/types/plots/data/common';
import type { ValuesStyle } from '$lib/types/layout/styles';
import type { AxisPlotState, ProcessedRow, ValueLabelsCtx } from '$lib/types/layout/phases';
import type { FontStyle } from '$lib/types/plots/styling';
import type { TextAnchor } from '$lib/types/plots/constants';

/**
 * The parts every plot kind's value-label `text` marker shares: each label
 * dims with its series, hovering one isolates its series when
 * `values.hoverIsolate` is on, and the rendered labels report how far they
 * overflow so the plot can grow its margin. `seriesOf` reads a label's row's
 * series; a plot without series leaves it out and gets the overflow only.
 */
export function valueLabelHooks(
	values: ValuesStyle,
	ctx: ValueLabelsCtx,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	seriesOf?: (d: any) => string
): Pick<TextMarkerConfig, 'fillOpacity' | 'onOverflow' | 'onPointerEnter' | 'onPointerLeave'> {
	const isolate = values.hoverIsolate && seriesOf;
	return {
		fillOpacity: seriesOf && ((d) => ctx.disabledFillFor?.(seriesOf(d))?.fillOpacity),
		onOverflow: ctx.onValueLabelOverflow,
		onPointerEnter: isolate ? (d) => ctx.onValueLabelHover?.(seriesOf(d)) : undefined,
		onPointerLeave: isolate ? () => ctx.onValueLabelHover?.(null) : undefined
	};
}

/**
 * A processed row's own value, read through its series' own `y` - what a
 * label shows, even where a transform moved the row (a stacked row's top is
 * the running total, not its own value).
 */
export function seriesValueOf<TData extends Record<string, unknown>>(state: {
	resolvedSeries?: Series<TData>[];
}): (d: ProcessedRow) => unknown {
	const bySeries = new Map(
		(state.resolvedSeries ?? []).map((s) => [s.name, resolveAccessor(s.y as never)])
	);
	return (d) => bySeries.get(String(d[SERIES_KEY]))?.(d as never);
}

/**
 * The author's own `textAnchor`, if any. `'outside'` is HoverMarker's
 * per-point anchor; a value label's own `anchor` already places it, so here
 * it counts as unset.
 */
export function ownTextAnchor(
	font: FontStyle | undefined
): Exclude<TextAnchor, 'outside'> | undefined {
	return font?.textAnchor === 'outside' ? undefined : font?.textAnchor;
}

/**
 * A series-over-`x` plot's (line, area) `styles.values` as one `'text'`
 * marker over the processed rows: each visible series' last row with a value
 * (`filter` + `selectLast`, per series), at its top (a stacked row's `y2`),
 * labelled with its own value by `format` and placed by `anchor`. Labels
 * that would overlap fan out into a shared column (`declutter`). Colored by
 * the segment the row falls in, dimmed with its series, and reported to the
 * plot so its margin grows to fit them.
 */
export function buildEndValueLabels<TData extends Record<string, unknown>>(
	state: AxisPlotState<TData, object>,
	ctx: ValueLabelsCtx
): TextMarkerConfig[] {
	const { values, processedData: processed } = state;
	if (!values?.show || !processed) return [];
	const font = values.fontStyle;
	const anchor = values.anchor ?? 'start';
	const format = values.format ?? ((v: number, name: string) => `${name} - ${v}`);
	const position = processedPosition(processed);
	const topOf = (d: ProcessedRow) => position.y(d);
	const nameOf = (d: ProcessedRow) => String(d[SERIES_KEY]);
	const valueOf = seriesValueOf(state);

	const colorOf = (d: ProcessedRow) => {
		const name = nameOf(d);
		const group = state.scopedGroups?.find((g) => g.name === name);
		const segment = group?.segments.find((seg) => seg.match(d as TData));
		return (
			segment?.color ?? group?.segments[0]?.color ?? group?.color ?? state.colorForSeries?.(name)
		);
	};

	const marker = resolveTransforms<TextMarkerConfig>(
		{
			type: 'text',
			data: processed.data,
			x: (processed.channels.x ?? position.x) as TextMarkerConfig['x'],
			y: (processed.channels.y2 ?? processed.channels.y ?? topOf) as TextMarkerConfig['y'],
			grouping: SERIES_KEY,
			transforms: [
				{
					type: 'filter',
					filter: (d: ProcessedRow) => !isGapValue(valueOf(d)) && !isGapValue(topOf(d))
				},
				{ type: 'selectLast' }
			],
			text: (d: ProcessedRow) => format(Number(valueOf(d)), nameOf(d)),
			styles: {
				...font,
				fontSize: font?.fontSize ?? 12,
				dx: font?.dx ?? (anchor === 'start' ? 6 : anchor === 'end' ? -6 : 0),
				dy: font?.dy ?? (anchor === 'outside' ? -8 : 0),
				textAnchor:
					ownTextAnchor(font) ?? (anchor === 'start' || anchor === 'end' ? anchor : 'middle'),
				lineAnchor: font?.lineAnchor ?? (anchor === 'outside' ? 'bottom' : 'middle')
			},
			fill: font?.fill ? undefined : colorOf,
			declutter: { connector: values.strokeStyle },
			...valueLabelHooks(values, ctx, nameOf)
		},
		processed.data
	);
	return marker.data?.length ? [marker] : [];
}
