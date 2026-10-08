import { buildAxisInterpolation, buildAxisSliceScales } from '$lib/layout/shell/presentation';
import { buildPyramidKind } from '$lib/plots/pyramid/kind';
import type { AxisPipelineProps } from '$lib/layout/shell/presentation';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { PlotPresentation } from '$lib/types/plots/presentation';

/**
 * PyramidPlot's defaults: hover along `y`, every slice on the axes its
 * "scales" phase sets over every row, per-bar timeline tweens. A pyramid's
 * series read its `x` as their `y`, so the tween is of the magnitude, keyed
 * by category and side.
 */
export function buildPyramidPresentation<TData extends Record<string, unknown>>(
	props: AxisPipelineProps<TData>,
	cfg: PlotStylesConfig
): PlotPresentation<TData, AxisBasedScalesConfig<TData>> {
	const kind = buildPyramidKind<TData>();
	const interpolation = buildAxisInterpolation(kind, props, cfg, {
		value: 'y',
		key: ['x', 'grouping']
	});
	return {
		hoverStrategy: 'y',
		timeline: interpolation ? { interpolation } : undefined,
		sliceScales: buildAxisSliceScales(kind, props, cfg, ['x', 'y'])
	};
}
