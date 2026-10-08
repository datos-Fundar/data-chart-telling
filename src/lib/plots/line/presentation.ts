import { buildAxisFacetAxisValues, buildAxisInterpolation } from '$lib/layout/shell/presentation';
import { buildLineKind } from '$lib/plots/line/kind';
import type { AxisPipelineProps } from '$lib/layout/shell/presentation';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { PlotPresentation } from '$lib/types/plots/presentation';

/** LinePlot's defaults: hover along x; a timeline reveals the line cumulatively, tweening `y` per series. */
export function buildLinePresentation<TData extends Record<string, unknown>>(
	props: AxisPipelineProps<TData>,
	cfg: PlotStylesConfig
): PlotPresentation<TData, AxisBasedScalesConfig<TData>> {
	const kind = buildLineKind<TData>();
	return {
		hoverStrategy: 'x',
		timeline: {
			filterMode: 'upTo',
			interpolation: buildAxisInterpolation(kind, props, cfg, { value: 'y', key: ['grouping'] })
		},
		facetAxisValues: buildAxisFacetAxisValues<TData>(kind, props, cfg)
	};
}
