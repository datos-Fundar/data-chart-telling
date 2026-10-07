import { resolveAccessor } from '$lib/plots/utils/accessors';
import { SERIES_KEY, buildProcessedGroups } from '$lib/layout/phases/transforms';
import { ownTextAnchor, valueLabelHooks } from '$lib/plots/utils/valueLabels';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { isGapValue, resolveGapAreaStyle } from '$lib/plots/utils/gaps';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { BarMarkerConfig, TextMarkerConfig } from '$lib/types/markers/common';
import type { ProcessedRow } from '$lib/types/layout/phases';
import type { DiscreteGapFill } from '$lib/plots/utils/gaps';
import type {
	PyramidPlotState,
	PyramidPlotCtx,
	PyramidSeries
} from '$lib/types/plots/pyramid/state';
import type { AxisValue } from '$lib/types/layout/mapping';

const GAP_KINDS = ['start', 'middle', 'end'] as const;

/** A gap-fill row tagged with its resolved signed value as a plain field — see the note on `taggedData` below. */
type GapFillRow<TData> = TData & { __gapValue: number };

function signFor<TData extends Record<string, unknown>>(
	s: PyramidSeries<TData>,
	magnitude: number
): number {
	return s.side === 'left' ? -magnitude : magnitude;
}

/**
 * PyramidPlot's `styles.values` as one `'text'` marker per series, over the
 * same processed rows its bars draw (gap rows never get a label), mirrored to
 * its own side of the shared zero baseline. `anchor` places each label along
 * its bar: past its end (`'outside'`/`'start'`), at the baseline (`'end'`),
 * or centred (`'middle'`).
 */
export function buildValueLabelMarkers<TData extends Record<string, unknown>>(
	state: PyramidPlotState<TData>,
	ctx: PyramidPlotCtx
): TextMarkerConfig[] {
	const { values, processedData } = state;
	if (!values?.show || !processedData) return [];
	const font = values.fontStyle;
	const anchor = values.anchor ?? 'outside';
	const format = values.format ?? ((v: number) => `${v}`);
	const hooks = valueLabelHooks(values, ctx, (d: ProcessedRow) => String(d[SERIES_KEY]));

	return buildProcessedGroups<BarSegmentStyle>(state, false).flatMap(
		({ series }): TextMarkerConfig[] => {
			const side = state.resolvedSeries!.find((s) => s.name === series.name)!.side;
			const isLeft = side === 'left';
			const getMagnitude = resolveAccessor(series.y);
			const magnitude = (d: ProcessedRow) => Math.abs(Number(getMagnitude(d)));
			const signed = (d: ProcessedRow) => (isLeft ? -magnitude(d) : magnitude(d));
			const data = processedData.data.filter(
				(d) => d[SERIES_KEY] === series.name && !isGapValue(getMagnitude(d))
			);
			if (data.length === 0) return [];
			const outward = isLeft ? -1 : 1;
			return [
				{
					type: 'text',
					data,
					x:
						anchor === 'middle'
							? (d: ProcessedRow) => signed(d) / 2
							: anchor === 'end'
								? 0
								: signed,
					y: series.x as TextMarkerConfig['y'],
					text: (d: ProcessedRow) => format(magnitude(d), series.name),
					styles: {
						...font,
						fill: font?.fill ?? ctx.cfg.axis.color,
						fontSize: font?.fontSize ?? 12,
						dx: font?.dx ?? (anchor === 'middle' ? 0 : outward * (anchor === 'end' ? 4 : 6)),
						dy: font?.dy ?? 0,
						textAnchor:
							ownTextAnchor(font) ?? (anchor === 'middle' ? 'middle' : isLeft ? 'end' : 'start'),
						lineAnchor: font?.lineAnchor ?? 'middle'
					},
					...hooks
				}
			];
		}
	);
}

/**
 * PyramidPlot's "markers" phase: one `role: 'segment'` bar per visual
 * segment, always horizontal (category on y, signed magnitude on x) and with
 * no insets — prepended onto whatever the "statistics" phase already put in
 * `state.markers`. Emits no `role: 'hitArea'` markers — PyramidPlot's hover
 * matches nearest points rather than hit-testing category bands.
 */
export function buildMarkers<TData extends Record<string, unknown>>(
	state: PyramidPlotState<TData>,
	ctx: PyramidPlotCtx
): PyramidPlotState<TData> {
	const { groupedSeries, gapFillMaps } = state;
	const gapDefaults = getConfiguration().pyramid.gap;
	// The real bars draw the rows the "transforms" phase left, read through its channels.
	const processedGroups = new Map(
		buildProcessedGroups<BarSegmentStyle>(state, false).map((g) => [g.series.name, g])
	);

	const markers: BarMarkerConfig[] = [];
	for (const group of groupedSeries!) {
		// Forwarded raw (a field key or function, whatever `series.x` is)
		// rather than pre-resolved into a closure — svelteplot's own
		// `resolve()` already handles a field-key string per row, and only a
		// literal string (not a function) lets its axis-title auto-inference
		// see the field name. `keyof TData` is always a real string key in
		// practice, just not provably so to TypeScript here.
		const category = group.series.x as string | ((d: TData) => AxisValue);
		const defaultColor = state.colorForSeries!(group.series.name);
		const disabledFill = ctx.disabledFillFor?.(group.series.name);
		const processed = processedGroups.get(group.series.name);
		const processedCategory = processed?.series.x as string | ((d: TData) => AxisValue);
		const getMagnitude = resolveAccessor((processed?.series.y ?? group.series.y) as keyof TData);
		const signed = (d: TData) => signFor(group.series, Math.abs(Number(getMagnitude(d))));

		for (const seg of processed?.visualSegments ?? []) {
			const realData = (seg.data as TData[]).filter((d) => !isGapValue(getMagnitude(d)));
			if (realData.length === 0) continue;
			markers.push({
				type: 'bar',
				role: 'segment',
				isHorizontal: true,
				data: realData,
				y: processedCategory,
				x1: 0,
				x2: signed,
				styles: {
					fill: disabledFill?.fill ?? seg.styles.fill ?? defaultColor,
					fillOpacity: disabledFill?.fillOpacity ?? seg.styles.fillOpacity ?? 1
				}
			});
		}

		const fillMap =
			gapFillMaps!.get(group.series.name) ?? new Map<TData, DiscreteGapFill<BarSegmentStyle>>();
		for (const kind of GAP_KINDS) {
			const filledRows = group.series.data.filter((d) => fillMap.get(d)?.kind === kind);
			if (filledRows.length === 0) continue;
			const base = resolveGapAreaStyle(
				fillMap.get(filledRows[0])!.style,
				defaultColor,
				gapDefaults
			);
			// svelteplot shallow-clones each row before invoking a mark's own
			// geometry accessors, so a `fillMap.get(d)` lookup inside `x2` would
			// see a clone, not the original key — tag the resolved value onto the
			// row as a plain field instead, which survives that clone.
			const taggedData: GapFillRow<TData>[] = filledRows.map((d) => ({
				...d,
				__gapValue: signFor(group.series, Math.abs(fillMap.get(d)!.value))
			}));
			markers.push({
				type: 'bar',
				role: 'segment',
				isHorizontal: true,
				data: taggedData,
				y: category,
				x1: 0,
				x2: (d: TData) => (d as GapFillRow<TData>).__gapValue,
				styles: {
					...base,
					fill: disabledFill?.fill ?? base.fill,
					fillOpacity: disabledFill?.fillOpacity ?? base.fillOpacity
				}
			});
		}
	}

	return {
		...state,
		markers: [...markers, ...(state.markers ?? []), ...buildValueLabelMarkers(state, ctx)]
	};
}
