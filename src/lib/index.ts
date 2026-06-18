// ── Plots ───────────────────────────────────────────────────────────────────
// Low-level graphics: one specific mark family each, drawn into a given box.
export { default as LinePlot } from './plots/line/Plot.svelte';
export { default as BarPlot } from './plots/bar/Plot.svelte';
export { default as HeatmapPlot } from './plots/heatmap/Plot.svelte';

// ── Charts ──────────────────────────────────────────────────────────────────
// High-level, plot-agnostic chrome plus ready-made chart kinds.
export { default as Chart } from './charts/Chart.svelte';
export { default as LineChart } from './charts/kinds/LineChart.svelte';
export { default as BarChart } from './charts/kinds/BarChart.svelte';
export { default as HeatmapChart } from './charts/kinds/HeatmapChart.svelte';

// Interchangeable layout primitives (compose your own chart kinds with these).
export { default as ChartContainer } from './charts/container/ChartContainer.svelte';
export { default as Timeline } from './charts/timeline/Timeline.svelte';
export { default as TimelineLayout } from './charts/timeline/TimelineLayout.svelte';
export { default as FacetGrid } from './charts/facet/FacetGrid.svelte';
export { default as Legend } from './charts/legend/Legend.svelte';
export { default as Tooltip } from './charts/tooltip/Tooltip.svelte';
export { default as HoverMarks } from './charts/tooltip/HoverMarks.svelte';

// ── Configuration ─────────────────────────────────────────────────────────────
// Global, reactive theming. Call `setConfiguration({...})` once at startup (or
// anytime) to restyle every chart on screen.
export {
  setConfiguration,
  getConfiguration,
  resetConfiguration,
  configToCssVars,
  cssVarsStyle,
  DEFAULT_CONFIG,
} from './charts/config.svelte';
export type { ChartConfig, ChartConfigInput, TextStyle } from './charts/config.svelte';

// ── Utils ─────────────────────────────────────────────────────────────────────
export { groupBy, uniqueValues, buildLineSeries, buildBarSeries } from './charts/utils/group';
export { DEFAULT_PALETTE, colorResolver, discreteLegendFromColors } from './charts/utils/legend';
export { makeColorScale, normalize, resolveCssColor } from './charts/utils/color';

// ── Types ─────────────────────────────────────────────────────────────────────
export type { XValue, YValue } from './types/plots/common';
export type { LineSeries, LineRangeSegment, SegmentsMap, LineSegmentStyle, DeltaConfig } from './types/plots/lines';
export type { BarSeries } from './types/plots/bars';
export type { HeatmapSeries } from './types/plots/heatmap';
export type { Marker } from './types/plots/markers';
export type {
  Accessor,
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
} from './types/charts/tooltip';
