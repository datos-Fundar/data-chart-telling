import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { buildMarks } from '$lib/plots/distribution/density/markers';
import { RowContext } from '$lib/phases/context/RowContext';
import { TooltipState } from '$lib/layout/tooltip/TooltipState.svelte';
import { NumberFormat } from '$lib/utils/NumberFormat';
import { getConfiguration } from '$lib/configuration/config.svelte';
import type { AxisPlotDefaults, ProcessedRow } from '$lib/types/phases';
import type { MarkerTransform, DensityXTransform, DensityYTransform } from '$lib/types/transforms';
import type { AreaStyle } from '$lib/types/plots/styling';
import type { DensityPlotState, DensityPlotEnv } from '$lib/types/plots/distribution/density/state';

type Density = DensityXTransform | DensityYTransform;

/** A density is a small number: three decimals tell its points apart. */
const DENSITY_DECIMALS = 3;

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
	DensityPlotEnv
> {
	return {
		data: {
			segments: {
				color: (style: AreaStyle | undefined) => style?.fill,
				connect: false,
				base: { flat: 'area' }
			}
		},
		transforms: {
			// A curve is labelled at its peak.
			labels: { select: 'max' },
			transforms: (state) => mergeDensity(state.transforms ?? [], state.axes?.isHorizontal ?? false)
		},
		styles: {
			values: {
				layout: 'point',
				layouts: { point: { side: 'above' }, path: { side: 'above', offset: 'max' } },
				// The estimate tells a reader little: a label names the curve it is on, or a lone curve's peak position.
				formatFor: (state) => {
					const position = PlotAxes.other(PlotAxes.valueOf(state));
					return (state.resolvedSeries?.length ?? 0) > 1
						? (value, number, { series }) => series ?? number(value)
						: (_value, number, context) => number(Number(context[position]));
				}
			}
		},
		scales: { zero: ['value'] },
		markers: { marks: buildMarks },
		hover: {
			// A hovered point reads as its estimate, the value its context gives it - a small number, written with
			// three decimals unless the author asks otherwise.
			label: (state) => {
				const number = NumberFormat.of(
					NumberFormat.displayOf(state.values),
					getConfiguration(),
					DENSITY_DECIMALS
				);
				return ((row: ProcessedRow) => number(Number(RowContext.of(row).value))) as (
					row: never
				) => string;
			},
			// Its tooltip writes the estimate the same way.
			format: (state) =>
				TooltipState.default(
					state,
					NumberFormat.of(
						NumberFormat.displayOf(state.tooltip),
						getConfiguration(),
						DENSITY_DECIMALS
					)
				) as (row: never) => string
		}
	};
}
