import type { BarPlotState, BarPlotCtx } from '$lib/types/plots/ranking/bar/state';

/** BulletPlot's pipeline state: a bar plot's, which already carries the `target` and `ranges` it measures against. */
export type BulletPlotState<TData extends Record<string, unknown>> = BarPlotState<TData>;

/** The environment every BulletPlot phase reads from. */
export type BulletPlotCtx = BarPlotCtx;
