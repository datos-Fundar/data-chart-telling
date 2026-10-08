import type { StrokeStyle, DotStyle, AreaStyle } from '$lib/types/plots/styling';

/** Per-segment styling for a line: its stroke and/or its endpoint dots. */
export type LineSegmentStyle = {
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
