import { buildAxisFacetAxisValues } from '$lib/layout/shell/presentation';
import { buildScatterKind } from '$lib/plots/scatter/kind';
import type { AxisPipelineProps } from '$lib/layout/shell/presentation';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { PlotPresentation } from '$lib/types/plots/presentation';

/** ScatterPlot's defaults: hover the exact point. */
export function buildScatterPresentation<TData extends Record<string, unknown>>(
	props: AxisPipelineProps<TData>,
	cfg: PlotStylesConfig
): PlotPresentation<TData, AxisBasedScalesConfig<TData>> {
	return {
		hoverStrategy: 'punctual',
		facetAxisValues: buildAxisFacetAxisValues<TData>(buildScatterKind<TData>(), props, cfg)
	};
}
