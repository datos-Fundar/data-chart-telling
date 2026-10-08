import { buildAxisFacetAxisValues, buildAxisInterpolation } from '$lib/layout/shell/presentation';
import { buildBarKind, categoricalAxisOf } from '$lib/plots/bar/kind';
import type { AxisPipelineProps } from '$lib/layout/shell/presentation';
import type { PlotStylesConfig } from '$lib/types/configuration/styling';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import type { PlotPresentation } from '$lib/types/plots/presentation';

/** BarPlot's defaults: hover along the category axis, timeline tweens of `y` matched per category and group; facets share a band category axis and a value axis from zero. */
export function buildBarPresentation<TData extends Record<string, unknown>>(
	props: AxisPipelineProps<TData> & { scales?: AxisBasedScalesConfig<TData> },
	cfg: PlotStylesConfig
): PlotPresentation<TData, AxisBasedScalesConfig<TData>> {
	const kind = buildBarKind<TData>();
	const interpolation = buildAxisInterpolation(kind, props, cfg, {
		value: 'y',
		key: ['x', 'grouping']
	});
	return {
		hoverStrategy: categoricalAxisOf(props.scales as AxisBasedScalesConfig<never> | undefined),
		timeline: interpolation ? { interpolation } : undefined,
		facetAxisValues: buildAxisFacetAxisValues<TData>(kind, props, cfg, {
			band: (state) => [state.categoricalAxis ?? 'x'],
			zero: (state) => [state.categoricalAxis === 'y' ? 'x' : 'y']
		})
	};
}
