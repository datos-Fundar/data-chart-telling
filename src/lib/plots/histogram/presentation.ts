import { buildAxisFacetAxisValues } from '$lib/layout/shell/presentation';
import { buildHistogramKind } from '$lib/plots/histogram/kind';
import type { AxisPipelineProps } from '$lib/layout/shell/presentation';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { PlotPresentation } from '$lib/types/plots/presentation';

/** HistogramPlot's defaults: hover along x; facets share a count axis from zero. */
export function buildHistogramPresentation<TData extends Record<string, unknown>>(
	props: AxisPipelineProps<TData>,
	cfg: PlotStylesConfig
): PlotPresentation<TData, AxisBasedScalesConfig<TData>> {
	return {
		hoverStrategy: 'x',
		facetAxisValues: buildAxisFacetAxisValues<TData>(buildHistogramKind<TData>(), props, cfg, {
			zero: () => ['y']
		})
	};
}
