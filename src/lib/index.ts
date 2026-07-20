// ── Plots ───────────────────────────────────────────────────────────────────
// Low-level graphics: one specific mark family each, drawn into a given box.
export { default as BarPlot } from './plots/bar/Plot.svelte';
export { default as HeatmapPlot } from './plots/heatmap/Plot.svelte';
export { default as LinePlot } from './plots/line/Plot.svelte';
export { default as PyramidPlot } from './plots/pyramid/Plot.svelte';
export { default as GeoPlot } from './plots/geo/Plot.svelte';

// ── Charts ──────────────────────────────────────────────────────────────────
// High-level, plot-agnostic chrome plus ready-made chart kinds.
export { default as BaseChart } from './charts/BaseChart.svelte';
export { default as BarChart } from './charts/bar/Chart.svelte';
export { default as HeatmapChart } from './charts/heatmap/Chart.svelte';
export { default as LineChart } from './charts/line/Chart.svelte';
export { default as PyramidChart } from './charts/pyramid/Chart.svelte';

// Interchangeable layout primitives (compose your own chart kinds with these).
export { default as ChartContainer } from './charts/container/ChartContainer.svelte';
export { default as BasePlotLayout } from './layout/plot/BasePlotLayout.svelte';
export { default as GeoLayout } from './layout/geo/GeoLayout.svelte';
export { default as TileLayer } from './plots/geo/TileLayer.svelte';

// Custom geo projections — usable as `scales.projection.type`.
export { argentinaBicontinental } from './plots/geo/projections/argentina';
export { default as Timeline } from './layout/timeline/Timeline.svelte';
export { default as TimelineLayout } from './layout/timeline/TimelineLayout.svelte';
export { default as FacetLayout } from './layout/facet/FacetLayout.svelte';
export { default as LegendLayout } from './layout/legend/LegendLayout.svelte';
export { default as Tooltip } from './layout/tooltip/Tooltip.svelte';

// Markers
export { default as DeltaMarker } from './markers/DeltaMarker.svelte';
export { default as DotMarker } from './markers/DotMarker.svelte';
export { default as HoverMarker } from './markers/HoverMarker.svelte';
export { default as PeakMarker } from './markers/PeakMarker.svelte';
export { default as TextMarker } from './markers/TextMarker.svelte';

export {
  setConfiguration,
  getConfiguration,
  resetConfiguration,
  configToCssVars,
  cssVarsStyle,
  DEFAULT_CONFIG,
} from './configuration/config.svelte';
export { THEMES } from './configuration/themes';
export type { ThemeName } from './configuration/themes';

// ── Utils ─────────────────────────────────────────────────────────────────────
export { groupBy, buildSeries } from './utils/grouping';
export {
  makeColorScale,
  normalize,
  resolveCssColor,
  paletteColor
} from './utils/color';

// ── Types ─────────────────────────────────────────────────────────────────────
export type { AxisValue, AxisScale } from './types/plots/axis';
export type { Accessor, Series, SeriesProps, DataProps } from './types/plots/data/common';
export type {
  BasePlotProps,
  StylesConfig,
  MarkersConfig,
  SegmentsConfig,
  AxisBasedScalesConfig,
  GeoScalesConfig,
  ScalesConfig,
  MarginConfig,
  TooltipConfig,
} from './types/plots/props';
export type {
  DeltaConfig,
} from './types/plots/delta';
export type {
  ValuesStyle,
  ColorsStyle,
  BasePlotStyles,
} from './types/plots/styles/common';
export type { LineSegmentStyle, BarSegmentStyle, CellSegmentStyle, GeoSegmentStyle } from './types/plots/segments/common';
export type { Range, Area, Segment } from './types/plots/segments/config';
export type {
  ValueAnchor,
  SymbolType,
  LineStyle,
  LineCap,
  LineJoin,
  FontWeight,
  FontStyleKeyword,
  TextAnchor,
  LineAnchor,
} from './types/plots/constants';
export type { FontStyle, StrokeStyle, DotStyle } from './types/plots/styling';
export type { Marker } from './types/markers/common';
export type { MarkerProps } from './types/markers/props';
export type { GeoFeature, GeoJsonInput, GeoDataProps, Topology } from './types/plots/data/geo';
export type {
  GeoProjectionName,
  GeoProjectionConfig,
  GeoCustomProjection,
  GeoCustomProjectionFactory,
} from './types/plots/scales/geo';
export type { GeoStyles, GeoTileLayerConfig, GeoZoomConfig } from './types/plots/styles/geo';
export type {
  GeoMarker,
  GeoInsetMarker,
  GeoInsetLocation,
  GeoInsetProjectionName,
  GeoInsetProjectionConfig,
} from './types/markers/geo';
export type {
  TimeValue,
  Orientation,
  FacetColumns,
  FacetConfig,
  TimelineConfig,
  ChartPlotContext,
  ChartPlotSnippet,
} from './types/charts/common';
export type {
  LegendSection,
  DiscreteLegendSection,
  ContinuousLegendSection,
  LegendItem,
} from './types/charts/legend';
export type {
  HoverStrategy,
  TooltipOptions,
  TooltipProp,
} from './types/layout/tooltip';
export type { ChartConfig, ChartConfigInput, TextStyle } from './types/configuration/styling';
export type { ChartProps } from './types/charts/props';
