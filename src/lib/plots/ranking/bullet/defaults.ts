import { buildBarDefaults, fitValueDomain } from '$lib/plots/ranking/bar/defaults';
import { buildMarks, buildReach } from '$lib/plots/ranking/bullet/markers';
import type { AxisPlotDefaults } from '$lib/types/phases';
import type { BulletPlotState, BulletPlotCtx } from '$lib/types/plots/ranking/bullet/state';

/**
 * BulletPlot on the shared pipeline: a BarPlot whose bars are drawn thinner
 * over `ranges` - bands that grade the value - with a tick at each `target`.
 * Its value axis fits them along with the bars.
 */
export function buildBulletDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	BulletPlotState<TData>,
	BulletPlotCtx
> {
	const bar = buildBarDefaults<TData>();
	return {
		...(bar as AxisPlotDefaults<BulletPlotState<TData>, BulletPlotCtx>),
		scales: {
			...bar.scales,
			defaults: (_state, ctx) => ({
				category: {
					paddingInner: ctx.cfg.bullet.paddingInner,
					paddingOuter: ctx.cfg.bullet.paddingOuter
				}
			}),
			fit: (state, ctx) => fitValueDomain(state, buildReach(state, ctx))
		},
		markers: { ...bar.markers!, marks: buildMarks }
	};
}
