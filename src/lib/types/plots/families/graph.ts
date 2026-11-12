import type {
	AxisPlotDefaults,
	HoverStageOptions,
	ProcessedRow,
	StatisticsStageState,
	TransformsStageState
} from '$lib/types/phases';
import type { AxesPlotProps, AxesPlotCoreProps } from '$lib/types/plots/families/axes';
import type { TooltipContext } from '$lib/types/layout/tooltip';

/** The hover of a graph kind: found through each row's own shape, which it restyles. */
type GraphHoverOptions<TState, TEnv> = Pick<
	HoverStageOptions<TState, TEnv>,
	'format' | 'label' | 'rows'
> & {
	/** The marker a row is drawn as, over that row alone and unstyled: what the pointer finds it by. */
	shape: (state: TState, row: ProcessedRow) => { type: string } & Record<string, unknown>;
};

/**
 * What a graph kind adds to the shared pipeline: positions come from its own layout transform, on axes it
 * hides unless the author shows them.
 */
export type GraphPlotKind<TState extends TransformsStageState & StatisticsStageState, TEnv> = Omit<
	AxisPlotDefaults<TState, TEnv>,
	'hover'
> & {
	hover: GraphHoverOptions<TState, TEnv>;
};

/** A graph kind's public props: its data contract, laid out over hidden axes, so it takes every axes marker. */
export type GraphPlotProps<
	TDataContract,
	TRow extends Record<string, unknown>,
	TStyles extends object,
	TSegmentStyle extends object,
	TTooltipContext extends TooltipContext = TooltipContext
> = AxesPlotProps<TDataContract, TRow, TStyles, TSegmentStyle, TTooltipContext>;

/** What a graph kind's core draws from. */
export type GraphPlotCoreProps<
	TDataContract,
	TRow extends Record<string, unknown>,
	TStyles extends object,
	TSegmentStyle extends object
> = AxesPlotCoreProps<TDataContract, TRow, TStyles, TSegmentStyle>;
