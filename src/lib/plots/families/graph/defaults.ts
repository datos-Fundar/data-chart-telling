import { HoverDefaults } from '$lib/layout/hover/HoverDefaults';
import type { AxisPlotDefaults, AxisPlotEnv, AxisPlotState, ProcessedRow } from '$lib/types/phases';
import type { GraphPlotKind } from '$lib/types/plots/families/graph';

/** The axes a graph kind lays out over, hidden until the author shows them. */
const HIDDEN_AXES = {
	x: { axisDisplay: 'none', grid: false },
	y: { axisDisplay: 'none', grid: false }
} as const;

/**
 * A graph kind on the shared pipeline: its positions are its layout transform's, on hidden cartesian axes, and its
 * hover matches the shape under the pointer, which it restyles without a crosshair.
 */
export function buildGraphDefaults<
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TState extends AxisPlotState<any, any, any, any>,
	TEnv extends AxisPlotEnv
>(kind: GraphPlotKind<TState, TEnv>): AxisPlotDefaults<TState, TEnv> {
	const { hover, scales } = kind;
	const { shape, ...rest } = hover;
	return {
		...kind,
		scales: {
			...scales,
			defaults: (state, env) => {
				const own = scales?.defaults?.(state, env) ?? {};
				return {
					...own,
					x: { ...HIDDEN_AXES.x, ...own.x },
					y: { ...HIDDEN_AXES.y, ...own.y }
				};
			}
		},
		hover: {
			...rest,
			strategy: 'punctual',
			pointMatching: 'contains',
			marker: (_state, env) => HoverDefaults.shapes(env.cfg),
			hitAreas: (state, config) =>
				(config.points as { row: ProcessedRow }[]).map(({ row }) => ({
					...shape(state, row),
					data: [row],
					styles: { fill: 'transparent' },
					hover: config.active && 'trigger'
				}))
		}
	};
}
