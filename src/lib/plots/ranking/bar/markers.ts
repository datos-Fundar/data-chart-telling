import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { getConfiguration } from '$lib/configuration/config.svelte';
import { GAP_KIND, GAP_VALUE, SERIES_ID_KEY } from '$lib/phases/transforms/TransformsPhase';
import { seriesIdOf } from '$lib/utils/grouping';
import { resolveGapAreaStyle } from '$lib/plots/utils/gaps';
import { PlotAxes } from '$lib/phases/data/PlotAxes';

import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { BarMarkerConfig } from '$lib/types/markers/common';
import type { BarPlotState, BarPlotEnv } from '$lib/types/plots/ranking/bar/state';
import type { ProcessedRow } from '$lib/types/phases';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { BandSlice, HoverPoint } from '$lib/types/layout/hover';
import type { HoverConfig } from '$lib/types/plots/props';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';

const GAP_KINDS = ['start', 'middle', 'end'] as const;

type Row = Record<string, unknown>;

/**
 * Where a bar plot's bars sit, read off the state its phases leave: each
 * processed row's category and span along the value axis, whether the series
 * stack, and the slice of its category band each series takes when they sit
 * side by side. Slices are fractions of the band, so they hold at any width.
 */
export function buildBarGeometry<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>,
	seriesPadding: number
) {
	const valueAxis = PlotAxes.valueOf(state);
	const categoryAxis = PlotAxes.categoryOf(state);
	const baseline = PlotAxes.baselineOf(state);
	const { stacked, of: spanOf } = ProcessedPositions.span(
		state.processedData!,
		valueAxis as 'x' | 'y',
		baseline
	);
	const position = ProcessedPositions.of(state.processedData!, valueAxis as 'x' | 'y');
	const categoryOf = (row: ProcessedRow) => position[categoryAxis as 'x' | 'y'](row) as AxisValue;

	const names = [...new Set((state.groupedSeries ?? []).map((g) => g.series.name))];
	// A lone series, or a stack, fills its whole band: there's nothing to set side by side.
	const sideBySide = !stacked && names.length > 1;
	const gap = Math.max(0, Math.min(1, seriesPadding));
	/** A series' slice of the band, `undefined` while it takes the whole of it. */
	const sliceOf = (name: string): BandSlice | undefined => {
		if (!sideBySide) return undefined;
		const index = names.indexOf(name);
		const width = 1 / names.length;
		const margin = (gap * width) / 2;
		return {
			start: index * width + margin,
			end: (names.length - 1 - index) * width + margin
		};
	};
	return { stacked, baseline, spanOf, categoryOf, sliceOf };
}

/**
 * BarPlot's invisible `role: 'hitArea'` markers - one per hover candidate: a
 * band across the whole plot along the value axis (full height for vertical
 * bars, full width for horizontal ones), over its category, or its series'
 * slice of it. The pointer needn't be over the visible bar. They drive the
 * plot's hover when it is active.
 */
export function buildHitAreas<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	hover: HoverConfig<any>,
	env: BarPlotEnv
): BarMarkerConfig[] {
	const { categoryOf, sliceOf } = buildBarGeometry(state, env.cfg.bar.seriesPadding);
	const isHorizontal = state.axes?.isHorizontal ?? false;
	return (hover.points as HoverPoint<Row>[]).map(({ row, series }) => {
		const slice = series === undefined ? undefined : sliceOf(series);
		return {
			type: 'bar',
			role: 'hitArea',
			isHorizontal,
			data: [row],
			category: categoryOf(row as ProcessedRow),
			hover: hover.active && 'trigger',
			...(slice
				? isHorizontal
					? { insetTop: slice.start, insetBottom: slice.end }
					: { insetLeft: slice.start, insetRight: slice.end }
				: {})
		} as BarMarkerConfig;
	});
}

type CategoryChannel = BarMarkerConfig['x'];
type ValueChannel = BarMarkerConfig['x2'];

/**
 * BarPlot's "markers" phase: visible `role: 'segment'` bars - real data plus
 * gap fills - drawing the rows the "transforms" phase left, prepended onto
 * whatever the "statistics" phase already put in `state.markers`, and its
 * value labels on top of everything.
 */
export function buildMarks<TData extends Record<string, unknown>>(
	state: BarPlotState<TData>,
	env: BarPlotEnv
): AxisBasedMarkersConfig[] {
	const { gapFillMaps, colorForSeries, processedData } = state;
	const isHorizontal = state.axes?.isHorizontal ?? false;
	const [categoryAxis, valueAxis] = isHorizontal ? (['y', 'x'] as const) : (['x', 'y'] as const);
	const geometry = buildBarGeometry(state, env.cfg.bar.seriesPadding);
	const { channels } = processedData!;
	const gapDefaults = getConfiguration().bar.gap;

	// Forwarded raw when the transforms left a plain channel (a field key keeps
	// feeding svelteplot's axis-title inference), read through the geometry otherwise.
	const category = (channels[categoryAxis] ?? geometry.categoryOf) as CategoryChannel;
	const bottom = (row: ProcessedRow) => geometry.spanOf(row)?.[0] ?? geometry.baseline;
	const top = (row: ProcessedRow) => geometry.spanOf(row)?.[1] ?? geometry.baseline;
	// A gap-filled row reads its value through the processed value channel, which
	// falls back to the filled value; a real row through its own series' one,
	// which stays a field key whenever the plot has no transforms.
	const valueOf = (channel: unknown) =>
		(geometry.stacked || channel === undefined ? top : channel) as ValueChannel;
	const gapValue = valueOf(channels[valueAxis]);

	// What each bar writes about itself: its value, in the layout of `styles.values` - by default past its tip, or
	// in the middle of a stacked bar's segment.
	const labels =
		state.valueLabels?.show && state.valueLabels.writes('value') ? state.valueLabels : undefined;
	const labelFor = (name: string, slice: BandSlice | undefined) =>
		labels && {
			...labels.label(env, (d) => labels.text(d), {
				fill: 'currentColor',
				labelled: state.labelled,
				seriesColor: () => colorForSeries!(name)
			}),
			bandSlice: slice
		};

	function makeMarker(
		data: ProcessedRow[],
		slice: BandSlice | undefined,
		value: ValueChannel,
		styles: BarSegmentStyle,
		label?: BarMarkerConfig['label']
	): BarMarkerConfig | null {
		if (data.length === 0) return null;
		const from = (geometry.stacked ? bottom : geometry.baseline) as ValueChannel;
		const marker: BarMarkerConfig = {
			type: 'bar',
			role: 'segment',
			isHorizontal,
			data,
			styles,
			hover: 'style',
			...(label ? { label } : {}),
			...(isHorizontal
				? { y: category, x1: from, x2: value }
				: { x: category, y1: from, y2: value })
		};
		if (slice) {
			if (isHorizontal) {
				marker.styles = { ...marker.styles, insetTop: slice.start, insetBottom: slice.end };
			} else {
				marker.styles = { ...marker.styles, insetLeft: slice.start, insetRight: slice.end };
			}
		}
		return marker;
	}

	const isReal = (row: ProcessedRow) =>
		row[GAP_VALUE] === undefined && geometry.spanOf(row) !== undefined;

	const segmentMarkers: BarMarkerConfig[] = [];
	(state.processedGroups ?? []).forEach((group) => {
		const name = group.series.name;
		const slice = geometry.sliceOf(name);
		const defaultColor = colorForSeries!(name);
		const disabledFill = env.interaction?.fillFor(name);

		for (const seg of group.visualSegments) {
			const fill = disabledFill?.fill ?? seg.styles.fill ?? defaultColor;
			const styles: BarSegmentStyle = {
				// An outline asked for without a color is the fill's.
				...(seg.styles.strokeWidth !== undefined ? { stroke: fill } : {}),
				...seg.styles,
				fill,
				fillOpacity: disabledFill?.fillOpacity ?? seg.styles.fillOpacity ?? 1,
				// A dimmed series fades its outline with its fill.
				...(disabledFill?.fillOpacity !== undefined
					? { strokeOpacity: disabledFill.fillOpacity }
					: {})
			};
			const real = seg.data.filter(isReal);
			const value = valueOf(group.series[valueAxis]);
			const marker = makeMarker(real, slice, value, styles, labelFor(name, slice) as never);
			if (marker) segmentMarkers.push(marker);
		}

		const id = seriesIdOf(group.series);
		const fills = [...(gapFillMaps!.get(id)?.values() ?? [])];
		const seriesRows = processedData!.data.filter((row) => row[SERIES_ID_KEY] === id);
		for (const kind of GAP_KINDS) {
			const fill = fills.find((f) => f.kind === kind);
			if (!fill) continue;
			const base = resolveGapAreaStyle(fill.style, defaultColor, gapDefaults);
			const rows = seriesRows.filter(
				(row) => row[GAP_KIND] === kind && geometry.spanOf(row) !== undefined
			);
			const marker = makeMarker(rows, slice, gapValue, {
				...base,
				fill: disabledFill?.fill ?? base.fill,
				fillOpacity: disabledFill?.fillOpacity ?? base.fillOpacity
			});
			if (marker) segmentMarkers.push(marker);
		}
	});

	return segmentMarkers;
}
