// ── Plots ───────────────────────────────────────────────────────────────────
// Low-level graphics: one specific mark family each, drawn into a given box.
export { default as BarPlot } from './plots/bar/Plot.svelte';
export { default as HeatmapPlot } from './plots/heatmap/Plot.svelte';
export { default as LinePlot } from './plots/line/Plot.svelte';
export { default as PyramidPlot } from './plots/pyramid/Plot.svelte';
export { default as ScatterPlot } from './plots/scatter/Plot.svelte';
export { default as GeoPlot } from './plots/geo/Plot.svelte';

// ── Charts ──────────────────────────────────────────────────────────────────
// High-level, plot-agnostic chrome plus ready-made chart kinds.
export { default as BaseChart } from './charts/BaseChart.svelte';
export { default as BarChart } from './charts/bar/Chart.svelte';
export { default as HeatmapChart } from './charts/heatmap/Chart.svelte';
export { default as LineChart } from './charts/line/Chart.svelte';
export { default as PyramidChart } from './charts/pyramid/Chart.svelte';
export { default as ScatterChart } from './charts/scatter/Chart.svelte';

// Interchangeable layout primitives (compose your own chart kinds with these).
export { default as ChartContainer } from './charts/container/ChartContainer.svelte';
export { default as BasePlotLayout } from './layout/plot/BasePlotLayout.svelte';
export { default as CoordinatesLayout } from './layout/coordinates/CoordinatesLayout.svelte';
export { default as TileLayer } from './layout/styles/TileLayer.svelte';

// Custom geo projections — usable as `scales.projection.type`.
export { argentinaBicontinental } from './layout/coordinates/projections/argentina';
export { default as Timeline } from './layout/timeline/Timeline.svelte';
export { default as TimelineLayout } from './layout/timeline/TimelineLayout.svelte';
export { default as FacetLayout } from './layout/facet/FacetLayout.svelte';
export { default as FacetIndicator } from './layout/facet/FacetIndicator.svelte';
export { default as LegendLayout } from './layout/legend/LegendLayout.svelte';
export { default as Tooltip } from './layout/tooltip/Tooltip.svelte';
export {
	getLegendInteraction,
	provideLegendInteraction,
	createLegendInteraction
} from './layout/legend/interaction.svelte';

// Markers
export { default as BarMarker } from './markers/BarMarker.svelte';
export { default as CellMarker } from './markers/CellMarker.svelte';
export { default as DeltaMarker } from './markers/DeltaMarker.svelte';
export { default as DotMarker } from './markers/DotMarker.svelte';
export { default as HoverMarker } from './markers/HoverMarker.svelte';
export { default as LineMarker } from './markers/LineMarker.svelte';
export { default as PeakMarker } from './markers/PeakMarker.svelte';
export { default as RuleMarker } from './markers/RuleMarker.svelte';
export { default as TextMarker } from './markers/TextMarker.svelte';

export {
	setConfiguration,
	getConfiguration,
	resetConfiguration,
	configToCssVars,
	cssVarsStyle,
	DEFAULT_CONFIG
} from './configuration/config.svelte';
export { THEMES } from './configuration/themes';
export type { ThemeName } from './configuration/themes';

// ── Utils ─────────────────────────────────────────────────────────────────────
export { groupBy, buildSeries } from './utils/grouping';
export {
	makeColorScale,
	normalize,
	resolveCssColor,
	paletteColor,
	contrastTextColor,
	contrastRatio
} from './utils/color';
export { estimateCategoricalAxisMargin } from './plots/utils/categoricalAxisMargin';
export { estimateLineValueLabelMargin } from './plots/line/valueLabelMargin';

// ── Types ─────────────────────────────────────────────────────────────────────
export type { AxisValue, AxisScale, AxisBasedScalesConfig } from './types/layout/scales';
export type { Accessor, Series, SeriesProps, DataProps } from './types/plots/data/common';
export type {
	BasePlotProps,
	StylesConfig,
	MarkersConfig,
	SegmentsConfig,
	ScalesConfig,
	MarginConfig,
	TooltipConfig,
	HoverConfig,
	PointMatchingStrategy
} from './types/plots/props';
export type {
	ValuesStyle,
	ColorsStyle,
	FrameStyle,
	FrameProp,
	BasePlotStylesConfig,
	AxisBasedStylesConfig,
	GapsAwarePlotStylesConfig,
	GeoStylesConfig,
	GeoTileLayerConfig
} from './types/layout/styles';
export type {
	GapsConfig,
	GapZonesConfig,
	GapZoneConfig,
	OpenGapZoneConfig
} from './types/plots/gaps';
export type {
	LineSegmentStyle,
	BarSegmentStyle,
	CellSegmentStyle,
	GeoSegmentStyle,
	ScatterSegmentStyle
} from './types/plots/segments/common';
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
	LineAnchor
} from './types/plots/constants';
export type { FontStyle, StrokeStyle, DotStyle, AreaStyle } from './types/plots/styling';
export type { AxisBasedMarkersConfig } from './types/markers/common';
export type {
	LineMarkersConfig,
	DeltaMarkerConfig,
	DeltaConfig,
	DeltaTarget
} from './types/markers/line';
export type { MarkerProps } from './types/markers/props';
export type { GeoFeature, GeoJsonInput, GeoDataProps, Topology } from './types/plots/data/geo';
export type { ScatterDataProps } from './types/plots/data/scatter';
export type {
	GeoProjectionName,
	GeoProjectionConfig,
	GeoCustomProjection,
	GeoCustomProjectionFactory,
	GeoScalesConfig,
	GeoZoomConfig,
	CoordinatesConfig
} from './types/layout/coordinates';
export type { GeoCameraTarget, GeoCameraConfig, GeoCameraTransition } from './types/plots/camera';
export type {
	GeoMarkersConfig,
	GeoInsetMarkerConfig,
	GeoInsetTooltipConfig,
	GeoInsetLocation,
	GeoInsetProjectionName,
	GeoInsetProjectionConfig
} from './types/markers/geo';
export type { ChartPlotContext, ChartPlotSnippet } from './types/charts/common';
export type { TimeValue, Orientation, TimelineConfig } from './types/layout/timeline';
export type {
	Responsive,
	FacetColumns,
	FacetMode,
	FacetNavLayout,
	FacetConfig,
	FacetIndicatorContext,
	FacetIndicatorSnippet,
	FacetNavDirection,
	FacetNavContext,
	FacetNavSnippet
} from './types/layout/facet';
export type {
	LegendSection,
	DiscreteLegendSection,
	ContinuousLegendSection,
	LegendItem,
	LegendDisabledStyle,
	LegendItemsLayout,
	LegendInteractiveStyle,
	DiscreteInteractiveConfig,
	ContinuousInteractiveConfig,
	LegendNavDirection,
	LegendNavContext,
	LegendNavSnippet,
	LegendInteractionStore,
	LegendPlotContext
} from './types/layout/legend';
export type {
	HoverStrategy,
	TooltipOptions,
	TooltipProp,
	TooltipAnchorX,
	TooltipAnchorY
} from './types/layout/tooltip';
export type { ChartConfig, ChartConfigInput, TextStyle } from './types/configuration/styling';
export type { ChartProps, GapsAwareChartProps } from './types/charts/props';
