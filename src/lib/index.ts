// ── Plots ───────────────────────────────────────────────────────────────────
// Low-level graphics: one specific mark family each, drawn into a given box.
export { default as LinePlot } from './plots/line/Plot.svelte';
export { default as BarPlot } from './plots/bar/Plot.svelte';
export { default as HeatmapPlot } from './plots/heatmap/Plot.svelte';

// ── Charts ──────────────────────────────────────────────────────────────────
// High-level, plot-agnostic chrome plus ready-made chart kinds.
export { default as Chart } from './charts/Chart.svelte';
export { default as LineChart } from './charts/line/Chart.svelte';
export { default as BarChart } from './charts/bar/Chart.svelte';
export { default as HeatmapChart } from './charts/heatmap/Chart.svelte';

// Interchangeable layout primitives (compose your own chart kinds with these).
export { default as ChartContainer } from './charts/container/ChartContainer.svelte';
export { default as PlotLayout } from './layout/plot/PlotLayout.svelte';
export { default as Timeline } from './layout/timeline/Timeline.svelte';
export { default as TimelineLayout } from './layout/timeline/TimelineLayout.svelte';
export { default as FacetLayout } from './layout/facet/FacetLayout.svelte';
export { default as LegendLayout } from './layout/legend/LegendLayout.svelte';
export { default as Tooltip } from './layout/tooltip/Tooltip.svelte';
export { default as HoverMarker } from './plots/markers/HoverMarker.svelte';

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
export { makeColorScale, normalize, resolveCssColor, paletteColor } from './utils/color';

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
  XValue,
  YValue,
  Accessor,
  AxisScale,
  Series,
  SeriesProps,
  DataProps
} from './types/plots/common';
export type {
  DeltaConfig,
} from './types/plots/delta';
export type { HeatmapSeries } from './types/plots/heatmap';
export type {
  SymbolType,
  LineStyle,
  StrokeStyle,
  DotStyle,
  FontStyle,
  LineSegmentStyle,
  BarSegmentStyle,
  RangeSegment,
  SegmentsMap,
} from './types/plots/styles';
export type { Marker, MarkerProps } from './types/plots/markers';
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
  TooltipSync,
  TooltipOptions,
  TooltipProp,
  TooltipRuntime,
} from './types/layout/tooltip';
export type { ChartConfig, ChartConfigInput, TextStyle } from './types/configuration/styling';
