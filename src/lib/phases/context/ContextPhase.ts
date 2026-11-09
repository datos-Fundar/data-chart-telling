import { RowContext } from '$lib/phases/context/RowContext';
import type { ContextStageOptions } from '$lib/types/phases/context/phase';
import type { PhaseStage, ProcessedData, ProcessedRow } from '$lib/types/phases';
import type { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { Series } from '$lib/types/plots/data/common';

/** What the "context" phase reads. */
type ContextStageState = {
	processedData?: ProcessedData;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	resolvedSeries?: Series<any>[];
	axes?: PlotAxes;
};

/**
 * The "context" phase every axis-based plot shares: right after the transforms, it works out once what the plot
 * knows of each processed row - the shared {@link RowContext}, with what the kind adds - and keeps it on the row,
 * for the tooltip, the hover, the value labels and the author's own markers to read.
 */
export class ContextPhase<TState extends ContextStageState, TEnv = unknown> implements PhaseStage<
	TState,
	TEnv
> {
	readonly phase = 'context' as const;
	readonly #kind: ContextStageOptions<TState, TEnv> | undefined;

	constructor(kind?: ContextStageOptions<TState, TEnv>) {
		this.#kind = kind;
	}

	run = (state: TState, env: TEnv): TState => {
		const rows = state.processedData?.data;
		if (!rows?.length) return state;
		const shared = RowContext.shared(state);
		const own = this.#kind?.(state, env) as ((row: ProcessedRow) => object | undefined) | undefined;
		for (const row of rows) RowContext.tag(row, { ...shared(row), ...own?.(row) });
		return state;
	};
}
