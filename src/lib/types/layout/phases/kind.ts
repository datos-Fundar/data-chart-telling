import type { DataStageOptions } from './data';
import type { MappingStageOptions } from './mapping';
import type { TransformsStageOptions, TransformsStageState } from './transforms';
import type { StatisticsStageOptions, StatisticsStageState } from './statistics';
import type { ScalesStageOptions } from './scales';

/**
 * What one axis-based plot kind adds to the shared pipeline: options for each
 * shared stage, and its own "markers" phase, the one every kind writes itself.
 */
export type AxisPlotKind<TState extends TransformsStageState & StatisticsStageState, TCtx> = {
	data?: DataStageOptions<TState, TCtx>;
	mapping?: MappingStageOptions<TState, TCtx>;
	transforms?: TransformsStageOptions<TState, TCtx>;
	statistics?: StatisticsStageOptions<TState>;
	scales?: ScalesStageOptions<TState, TCtx>;
	markers: (state: TState, ctx: TCtx) => TState;
};
