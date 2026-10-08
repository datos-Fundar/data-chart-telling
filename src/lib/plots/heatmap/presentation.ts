import { buildAxisFacetAxisValues, buildAxisSliceScales } from '$lib/layout/shell/presentation';
import { buildHeatmapKind } from '$lib/plots/heatmap/kind';
import type { AxisPipelineProps } from '$lib/layout/shell/presentation';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { PlotPresentation } from '$lib/types/plots/presentation';

/**
 * HeatmapPlot's defaults: hover one cell. Its color domain is the one its
 * "scales" phase sets over every row, so cells stay comparable across
 * timeline steps and facets.
 */
export function buildHeatmapPresentation<TData extends Record<string, unknown>>(
	props: AxisPipelineProps<TData>,
	cfg: PlotStylesConfig
): PlotPresentation<TData, AxisBasedScalesConfig<TData>> {
	const kind = buildHeatmapKind<TData>();
	return {
		hoverStrategy: 'punctual',
		sliceScales: buildAxisSliceScales(kind, props, cfg, ['color']),
		facetAxisValues: buildAxisFacetAxisValues<TData>(kind, props, cfg, { band: () => ['x', 'y'] })
	};
}
