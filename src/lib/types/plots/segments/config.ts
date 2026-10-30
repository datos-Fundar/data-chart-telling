import type { ChannelScalesConfig } from '$lib/types/layout/scales';
import type { AxisValue } from '$lib/types/layout/mapping';
import type { Series } from '$lib/types/plots/data/common';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { MarkLegend } from '$lib/types/layout/legend';
import type { FacetScoped } from '$lib/types/layout/facet';

/** A half-open interval on one axis. Both bounds are inclusive; omit either to leave that end open. */
export type Range = {
	from?: AxisValue;
	to?: AxisValue;
};

/**
 * A 2-D rectangular area on the plot, addressed by optional x and y intervals.
 * Omitting an interval leaves that axis unrestricted (matches all values).
 *
 * - For line/bar/pyramid plots only the `x` interval is used (the series' primary
 *   axis); `y` is evaluated but filters by the series' value axis.
 * - For heatmaps both `x` (column) and `y` (row) are used to address cells.
 */
export type Area = {
	x?: Range;
	y?: Range;
};

/**
 * One styled rule for a plot. A data point (or cell) is styled when it falls
 * inside **any** of the listed `areas`. With a `facet`, the rule exists only in
 * the facet panels it names. Omitting `areas` (or passing an empty
 * array) makes the segment a catch-all that matches every data point - useful
 * as a baseline style. `TStyle` is the per-mark shape ({@link LineSegmentStyle},
 * {@link BarSegmentStyle}, {@link CellSegmentStyle}, …).
 *
 * Catch-alls are evaluated last so that area-specific segments always take
 * priority, regardless of their position in the list. A catch-all placed first
 * therefore acts as a fallback baseline that area-specific segments override.
 */
export type Segment<TStyle> = FacetScoped & {
	areas?: Area[];
	scales?: ChannelScalesConfig;
	styles?: TStyle;
	/** Names the segment on its plot's automatic legend - see {@link MarkLegend}. */
	legend?: MarkLegend;
};

/** One contiguous, styled slice of a series' data - ready to draw as its own mark. */
export type VisualSegment<T extends Record<string, unknown>, TStyle = LineSegmentStyle> = {
	data: T[];
	scales?: ChannelScalesConfig;
	styles: TStyle;
};

/**
 * A series split into its styled visual segments. `S` is the full series
 * type Series<T> - its row type is read off `S['data']`
 * rather than taken as a separate parameter, since TypeScript can't reliably
 * infer a type parameter that only appears inside another parameter's
 * constraint.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type VisualGroup<S extends Series<any>, TStyle = LineSegmentStyle> = {
	series: S;
	visualSegments: VisualSegment<S['data'][number], TStyle>[];
};
