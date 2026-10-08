import { resolveAccessor } from '$lib/plots/utils/accessors';
import type { ResolvedChannels } from '$lib/types/layout/mapping';
import type { AxisPlotState, AxisPlotCtx, MappingStageOptions } from '$lib/types/layout/phases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisState = AxisPlotState<any, any, any, any>;

/** A channel prop resolved to a row accessor, keeping it as `source`, or left out when unset. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function channel(accessor: any) {
	return accessor !== undefined ? { accessor: resolveAccessor(accessor), source: accessor } : undefined;
}

/**
 * The "mapping" stage every axis-based plot shares: every channel resolved to
 * a row accessor. `x`/`y` (and `color`) read the first series' own, falling
 * back to the plot's props; any other channel resolves only when its prop is
 * set, and a size channel given a number stays that literal size. An unset
 * `x`/`y` reads each row itself, with no `source`.
 */
export function buildMapping<TState extends AnyAxisState, TCtx extends AxisPlotCtx>(
	options: MappingStageOptions<TState, TCtx> = {}
): (state: TState, ctx: TCtx) => TState {
	return (state, ctx) => {
		const first = state.resolvedSeries?.[0];
		const identity = { accessor: (d: unknown) => d };
		const grouping = options.grouping ? options.grouping(state) : (state.grouping ?? state.color);
		const size = (value: unknown) => (typeof value === 'number' ? value : channel(value));

		const channels = {
			x: channel(first?.x ?? state.x) ?? identity,
			y: channel(first?.y ?? state.y) ?? identity,
			grouping: channel(grouping),
			color: channel(first?.color ?? state.color),
			opacity: channel(state.opacity),
			symbol: channel(state.symbol),
			r: size(state.r),
			length: size(state.length)
		} as ResolvedChannels<Record<string, unknown>>;

		const next = { ...state, channels } as TState;
		return options.extend ? options.extend(next, ctx) : next;
	};
}
