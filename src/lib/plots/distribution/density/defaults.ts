import { buildMarks } from '$lib/plots/distribution/density/markers';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { MarkerTransform, DensityXTransform, DensityYTransform } from '$lib/types/transforms';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { DensityPlotState, DensityPlotCtx } from '$lib/types/plots/distribution/density/state';

type Density = DensityXTransform | DensityYTransform;

/**
 * The plot's own density along its axis merged over the default one, the
 * author's props winning, and every other transform kept after it in order. A
 * density plot estimates once, so several entries fold into one.
 */
function mergeDensity(own: MarkerTransform[], horizontal: boolean) {
	const base: Density = { type: horizontal ? 'densityY' : 'densityX' };
	const densities = own.filter((t): t is Density => t.type === base.type);
	const others = own.filter((t) => t.type !== base.type);
	const density = densities.reduce<Density>((merged, t) => ({ ...merged, ...t }) as Density, base);
	return [density, ...others];
}

/**
 * DensityPlot on the shared pipeline: series read one position channel - `x`,
 * or `y` for a horizontal curve - estimated by the plot's transforms merged
 * over the default density of that axis, drawn from a zero baseline as an area
 * or a line, and its own markers. Its plot defaults to: hover along the estimated axis.
 */
export function buildDensityDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	DensityPlotState<TData>,
	DensityPlotCtx
> {
	return {
		data: { segments: { color: (style: AreaStyle | undefined) => style?.fill, connect: false } },
		transforms: {
			transforms: (state) => mergeDensity(state.transforms ?? [], state.axes?.isHorizontal ?? false)
		},
		scales: { zero: ['value'] },
		markers: { marks: buildMarks }
	};
}
