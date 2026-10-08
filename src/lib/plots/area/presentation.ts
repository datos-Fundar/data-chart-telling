import { buildAxisFacetAxisValues, buildAxisInterpolation } from '$lib/layout/shell/presentation';
import { buildAreaKind } from '$lib/plots/area/kind';
import type { AxisPipelineProps } from '$lib/layout/shell/presentation';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { PlotPresentation } from '$lib/types/plots/presentation';

/** AreaPlot's defaults: same as a line - hover along x, cumulative timeline tweening `y` per series. */
export function buildAreaPresentation<TData extends Record<string, unknown>>(
	props: AxisPipelineProps<TData>,
	cfg: PlotStylesConfig
): PlotPresentation<TData, AxisBasedScalesConfig<TData>> {
	const kind = buildAreaKind<TData>();
	return {
		hoverStrategy: 'x',
		timeline: {
			filterMode: 'upTo',
			interpolation: buildAxisInterpolation(kind, props, cfg, { value: 'y', key: ['grouping'] })
		},
		facetAxisValues: buildAxisFacetAxisValues<TData>(kind, props, cfg, { zero: () => ['y'] })
	};
}
