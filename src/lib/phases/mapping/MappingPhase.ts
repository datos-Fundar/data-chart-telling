import { resolveAccessor } from '$lib/utils/accessors';
import type { ResolvedChannels } from '$lib/types/layout/mapping';
import type {
	AxisPlotState,
	AxisPlotCtx,
	MappingStageOptions,
	PhaseStage
} from '$lib/types/phases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisState = AxisPlotState<any, any, any, any>;

/**
 * The "mapping" phase every axis-based plot shares: every channel resolved to
 * a row accessor. `x`/`y` (and `color`) read the first series' own, falling
 * back to the plot's props; `grouping` is the key the "data" phase split rows
 * by (its `seriesGrouping`); any other channel resolves only when
 * its prop is set, and a size channel given a number stays that literal size.
 * An unset `x`/`y` reads each row itself, with no `source`.
 */
export class MappingPhase<
	TState extends AnyAxisState,
	TCtx extends AxisPlotCtx
> implements PhaseStage<TState, TCtx> {
	readonly phase = 'mapping' as const;
	readonly #options: MappingStageOptions<TState, TCtx>;

	constructor(options: MappingStageOptions<TState, TCtx> = {}) {
		this.#options = options;
	}

	run = (state: TState, ctx: TCtx): TState => {
		const first = state.resolvedSeries?.[0];
		const identity = { accessor: (d: unknown) => d };
		const size = (value: unknown) =>
			typeof value === 'number' ? value : MappingPhase.#channel(value);

		const channels = {
			x: MappingPhase.#channel(first?.x ?? state.x) ?? identity,
			y: MappingPhase.#channel(first?.y ?? state.y) ?? identity,
			grouping: MappingPhase.#channel(state.seriesGrouping),
			color: MappingPhase.#channel(first?.color ?? state.color),
			opacity: MappingPhase.#channel(state.opacity),
			symbol: MappingPhase.#channel(state.symbol),
			r: size(state.r),
			length: size(state.length)
		} as ResolvedChannels<Record<string, unknown>>;

		const next = { ...state, channels } as TState;
		return this.#options.extend ? this.#options.extend(next, ctx) : next;
	};

	/** A channel prop resolved to a row accessor, keeping it as `source`, or left out when unset. */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	static #channel(accessor: any) {
		return accessor !== undefined
			? { accessor: resolveAccessor(accessor), source: accessor }
			: undefined;
	}
}
