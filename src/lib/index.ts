// ── Plots ───────────────────────────────────────────────────────────────────
// One mark family each, with optional chrome (title, legend, caption),
// timeline and facets around it.
export { default as AreaPlot } from './plots/evolution/area/Plot.svelte';
export { default as BarPlot } from './plots/ranking/bar/Plot.svelte';
export { default as BoxPlot } from './plots/distribution/box/Plot.svelte';
export { default as BulletPlot } from './plots/ranking/bullet/Plot.svelte';
export { default as ClevelandPlot } from './plots/ranking/cleveland/Plot.svelte';
export { default as DensityPlot } from './plots/distribution/density/Plot.svelte';
export { default as DumbbellPlot } from './plots/ranking/dumbbell/Plot.svelte';
export { default as ForestPlot } from './plots/ranking/forest/Plot.svelte';
export { default as GeoPlot } from './plots/map/geo/Plot.svelte';
export { default as HeatmapPlot } from './plots/correlation/heatmap/Plot.svelte';
export { default as HistogramPlot } from './plots/distribution/histogram/Plot.svelte';
export { default as LinePlot } from './plots/evolution/line/Plot.svelte';
export { default as LollipopPlot } from './plots/ranking/lollipop/Plot.svelte';
export { default as PyramidPlot } from './plots/distribution/pyramid/Plot.svelte';
export { default as ScatterPlot } from './plots/correlation/scatter/Plot.svelte';
export { default as SlopePlot } from './plots/evolution/slope/Plot.svelte';
export { default as SparklinePlot } from './plots/evolution/sparkline/Plot.svelte';
export { default as ViolinPlot } from './plots/distribution/violin/Plot.svelte';

// ── Composition ─────────────────────────────────────────────────────────────
// Separate plots combined into one figure, with chrome of its own.
export { default as PlotComposer } from './layout/composer/PlotComposer.svelte';
export { default as GridCell } from './layout/grid/GridCell.svelte';

// The generic plot, to build your own plot kind: wrap it with your kind's core and defaults.
export { default as Plot } from './layout/plot/Plot.svelte';
export { default as BasePlotLayout } from './layout/base/BasePlotLayout.svelte';
export { usePlot, useFigure } from './layout/plot/usePlot';
export type {
	PublicPlotContext,
	PublicFigureContext,
	PublicHover,
	PublicPlotHover,
	PublicLegend,
	PublicTimeline
} from './layout/plot/PublicPlotContext';

// Custom geo projections - usable as `scales.projection.type`.
export { argentinaBicontinental } from './layout/coordinates/projections/argentina';

export {
	setConfiguration,
	getConfiguration,
	resetConfiguration,
	configToCssVars,
	cssVarsStyle,
	DEFAULT_CONFIG
} from './configuration/config.svelte';
export { THEMES } from './configuration/themes';
export { SYSTEM_FONT } from './configuration/fonts';
export type { ThemeName } from './configuration/themes';

// ── Utils ─────────────────────────────────────────────────────────────────────
export { groupBy, buildSeries } from './utils/grouping';
export {
	makeColorScale,
	resolveColorScale,
	normalize,
	resolveCssColor,
	paletteColor,
	contrastTextColor,
	contrastRatio
} from './utils/color';
export { Margins } from './layout/margins/Margins';
export { resolveOpacityScale } from './utils/OpacityScale';
export { resolveSymbolScale } from './utils/SymbolScale';
export { Statistics } from './phases/statistics/Statistics';

// ── Types ─────────────────────────────────────────────────────────────────────
export type {
	AxisValue,
	ChannelValue,
	ChannelName,
	AxisChannelName,
	IndependentChannelName,
	SizeChannelName,
	ChannelAccessors
} from './types/layout/mapping';
export type { AxisScale, AxisBasedScalesConfig, ChannelScalesConfig } from './types/layout/scales';
export type { Accessor, Series, SeriesProps, DataProps } from './types/plots/data/common';
export type {
	BasePlotProps,
	PlotCoreProps,
	PlotChromeProps,
	FigureBoxProps,
	SegmentsConfig,
	ScalesConfig,
	MarginConfig,
	TooltipConfig,
	HoverConfig
} from './types/plots/props';
export type {
	AxisBasedStylesConfig,
	ConnectorBasedStylesConfig,
	BulletStylesConfig,
	GapsAwarePlotStylesConfig,
	CurveAwarePlotStylesConfig,
	GeoStylesConfig,
	GeoTileLayerConfig
} from './types/layout/styles';
export type { GapsConfig } from './types/plots/gaps';
export type {
	LineSegmentStyle,
	BarSegmentStyle,
	CellSegmentStyle,
	GeoSegmentStyle,
	ScatterSegmentStyle
} from './types/plots/segments/common';
export type { Range, Area, Segment } from './types/plots/segments/config';
export type { SymbolType } from './types/plots/constants';
export type { FontStyle, StrokeStyle, DotStyle, AreaStyle } from './types/plots/styling';
export type { AxisBasedMarkersConfig, BrushSelection } from './types/markers/common';
export type { StatisticConfig } from './types/layout/statistics';
export type * from './types/transforms';
export type { GeoFeature, GeoJsonInput, GeoDataProps, Topology } from './types/plots/data/geo';
export type {
	GeoCustomProjection,
	GeoCustomProjectionFactory,
	GeoScalesConfig,
	CoordinatesConfig
} from './types/layout/coordinates';
export type { GeoCameraConfig } from './types/plots/camera';
export type { GeoMarkersConfig } from './types/markers/geo';
export type { SharedAxisValues } from './types/phases';
export type {
	TimelineConfig,
	TimelineType,
	TimelineCallbacks,
	PlayerConfig,
	PlayerControl
} from './types/layout/timeline';
export type {
	ComposerLayout,
	ComposerTags,
	ComposerTimelineConfig,
	ComposerHoverConfig
} from './types/layout/composer';
export type {
	GridPlacement,
	GridInset,
	GridCellContext,
	GridCellSnippet
} from './types/layout/grid';
export type {
	Responsive,
	FacetConfig,
	FacetCellContext,
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
	LegendNavDirection,
	LegendNavContext,
	LegendNavSnippet,
	LegendEntry,
	LegendMark,
	LegendRange
} from './types/layout/legend';
export type { HoverStrategy, HoverPoint, HoverDisplayPoint } from './types/layout/hover';
export type {
	PlotStylesConfig,
	PlotStylesConfigInput,
	PaletteInput,
	DividerLineStyle,
	TextStyle
} from './types/configuration/styling';
