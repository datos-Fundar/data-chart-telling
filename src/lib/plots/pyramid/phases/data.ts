import { buildSeries } from '$lib/utils/grouping';
import { resolveSeriesColorFor } from '$lib/plots/utils/legendDisabled';
import { buildGroupedSeries, buildScopedMarkerGroups } from '$lib/plots/utils/segments';
import { resolveGapsForSeries, resolveDiscreteGapFills } from '$lib/plots/utils/gaps';
import type { Series } from '$lib/types/plots/data/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type {
	PyramidPlotState,
	PyramidPlotCtx,
	PyramidSeries
} from '$lib/types/plots/pyramid/state';

/** PyramidPlot's "data" phase: side-assigned (left/right) series, segment-grouped, and gap fills. */
export function buildData<TData extends Record<string, unknown>>(
	state: PyramidPlotState<TData>,
	ctx: PyramidPlotCtx
): PyramidPlotState<TData> {
	const { series, data, x, y, grouping, color, segments, gaps, scales } = state;

	// Series.x/.y hold the category/magnitude accessors respectively — swapped
	// from the top-level x (magnitude)/y (category) prop names, since every
	// other read site (scales, markers, mapping) treats them that way. A lone
	// `color` accessor assigns sides *and* colors them (the common case) —
	// `grouping` splits sides by a different field when given explicitly.
	const base: Series<TData>[] = series ?? buildSeries(data!, y!, x!, grouping ?? color);

	// Sort series names alphabetically; even index → left, odd → right.
	// scales.grouping.reverse flips the assignment so the second name goes left.
	const sortedNames = [...base.map((s) => s.name)].sort((a, b) => a.localeCompare(b));
	const groupingReversed = scales.grouping?.reverse ?? false;
	const resolvedSeries = base.map((s) => {
		const idx = sortedNames.indexOf(s.name);
		const side = (idx % 2 === 0) !== groupingReversed ? 'left' : 'right';
		return { ...s, side } as PyramidSeries<TData>;
	});

	// Default color is per-series-name (same mechanism Bar/Scatter/Line use) —
	// `scales.color` overrides it with a real ramp/categorical scheme; a
	// `segments` entry keyed by series name overrides a single series' fill
	// on top of that (already supported by `buildScopedMarkerGroups` below).
	const sortedSeries = [...resolvedSeries].sort((a, b) => a.name.localeCompare(b.name));
	const colorForSeries = resolveSeriesColorFor(sortedSeries, scales.color, ctx.cfg.palette);

	// connect: false — bars are discrete; there's no visual gap between
	// adjacent categories to bridge (see buildGroupedSeries's own doc).
	const groupedSeries = buildGroupedSeries<PyramidSeries<TData>, BarSegmentStyle>(
		resolvedSeries,
		segments,
		false
	);

	// Fills leading/internal/trailing missing-data holes with an
	// interpolated, distinctly-styled bar, resolved per series like
	// `segments` — see `GapsAwarePlotStylesConfig` (`types/layout/styles.ts`).
	const gapFillMaps = new Map(
		resolvedSeries.map((s) => [
			s.name,
			resolveDiscreteGapFills(s, resolveGapsForSeries(gaps, s.name))
		])
	);

	const scopedGroups = buildScopedMarkerGroups<TData, PyramidSeries<TData>, BarSegmentStyle>({
		groupedSeries,
		segments,
		colorFor: (s) => colorForSeries(s.name),
		segmentColorFor: (style, defaultColor) => style?.fill ?? defaultColor
	});

	return { ...state, resolvedSeries, groupedSeries, gapFillMaps, scopedGroups, colorForSeries };
}
