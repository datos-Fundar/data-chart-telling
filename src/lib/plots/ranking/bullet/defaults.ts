import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { RowNumbers } from '$lib/plots/utils/RowNumbers';
import type { ProcessedRow } from '$lib/types/phases';
import { buildBarDefaults, fitValueDomain } from '$lib/plots/ranking/bar/defaults';
import { buildMarks, buildReach } from '$lib/plots/ranking/bullet/markers';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { BulletPlotState, BulletPlotEnv } from '$lib/types/plots/ranking/bullet/state';

/**
 * BulletPlot on the shared pipeline: a BarPlot whose bars are drawn thinner
 * over `ranges` - bands that grade the value - with a tick at each `target`.
 * Its value axis fits them along with the bars.
 */
export function buildBulletDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	BulletPlotState<TData>,
	BulletPlotEnv
> {
	const bar = buildBarDefaults<TData>();
	return {
		...(bar as AxisPlotDefaults<BulletPlotState<TData>, BulletPlotEnv>),
		scales: {
			...bar.scales,
			defaults: (_state, env) => ({
				category: {
					paddingInner: env.cfg.bullet.paddingInner,
					paddingOuter: env.cfg.bullet.paddingOuter
				}
			}),
			fit: (state, env) => fitValueDomain(state, buildReach(state, env))
		},
		// Each bar's target and range bounds, for its tooltip, hover and value labels to read.
		context: (state) =>
			((row: ProcessedRow) => ({
				target: RowNumbers.of(state.target, row),
				ranges: (state.ranges ?? [])
					.map((range) => RowNumbers.of(range, row))
					.filter((bound): bound is number => bound !== undefined)
					.sort((a, b) => a - b)
			})) as (row: never) => object,
		styles: {
			...bar.styles,
			values: {
				...bar.styles?.values,
				parts: {
					placements: (state) => ValueLabels.besideBand(state, ['target', 'ranges']),
					default: ['value']
				}
			}
		},
		markers: { ...bar.markers!, marks: buildMarks }
	};
}
