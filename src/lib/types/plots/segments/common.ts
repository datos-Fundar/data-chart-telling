import type { StrokeStyle, DotStyle, AreaStyle } from '$lib/types/plots/styling';
import type { CurveName } from '$lib/types/layout/styles/curve';

/** Per-segment styling for a line: its curve, its stroke and/or its endpoint dots. */
export type LineSegmentStyle = {
	/** How the segment joins its points; `'step'` and its kin draw stairs. Falls back to `styles.curve`, then `'linear'`. */
	curve?: CurveName;
	stroke?: StrokeStyle;
	dots?: DotStyle;
};

/** Per-segment styling for a bar-shaped mark. Shared by `BarPlot` and `PyramidPlot`. */
export type BarSegmentStyle = AreaStyle;

/** Per-cell styling override for a heatmap cell. */
export type CellSegmentStyle = AreaStyle;

/** Per-segment styling for a scatter point cloud. */
export type ScatterSegmentStyle = DotStyle;

/** Per-feature styling override for `GeoPlot` - the geo analog of `CellSegmentStyle`. */
export type GeoSegmentStyle = {
	fill?: string;
	fillOpacity?: number;
	stroke?: string;
	strokeWidth?: number;
};
