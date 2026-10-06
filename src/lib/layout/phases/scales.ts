import { resolveAccessor } from '$lib/plots/utils/accessors';
import { markerAxisValues } from '$lib/utils/markerAxisValues';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type {
	AxisPlotState,
	AxisPlotCtx,
	ProcessedData,
	ScalesStageOptions
} from '$lib/types/layout/phases';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAxisState = AxisPlotState<any, any, any, any>;

const POSITION_CHANNELS = {
	x: ['x', 'x1', 'x2'],
	y: ['y', 'y1', 'y2']
} as const;

/** Every value the plot's own processed rows sit at on one axis. */
function processedValues(processed: ProcessedData | undefined, axis: AxisChannelName): unknown[] {
	if (!processed) return [];
	return POSITION_CHANNELS[axis].flatMap((name) => {
		const channel = processed.channels[name];
		if (channel === undefined) return [];
		const read = resolveAccessor(channel as never) as (row: unknown) => unknown;
		return processed.data.map((row) => read(row as never));
	});
}

/** The values as finite numbers, or `undefined` when any isn't a number (a band or date axis). */
function numeric(values: unknown[]): number[] | undefined {
	const present = values.filter((v) => v != null && v !== '');
	if (!present.every((v) => typeof v === 'number')) return undefined;
	return (present as number[]).filter(Number.isFinite);
}

/**
 * The "scales" stage every axis-based plot shares unless it resolves its own:
 * grows an unpinned numeric axis to cover what svelteplot's own domain doesn't
 * read — the marks derived from the plot (a density curve's tails, a
 * regression band, an author marker with its own rows), and the ranges the
 * transforms gave the plot's own rows (a bin's edges, a stack's top). An axis
 * with neither, a pinned domain, or a non-numeric axis is left alone.
 */
export function buildScales<TState extends AnyAxisState, TCtx extends AxisPlotCtx>(
	options: ScalesStageOptions<TState, TCtx> = {}
): (state: TState, ctx: TCtx) => TState {
	if (options.override) return options.override;
	return (state) => {
		const { scales, processedData, markers = [] } = state;
		const next = { ...scales };
		for (const axis of ['x', 'y'] as const) {
			if (scales[axis]?.domain) continue;
			const derived = markerAxisValues(markers, axis);
			const ranged = POSITION_CHANNELS[axis]
				.slice(1)
				.some((name) => processedData?.channels[name] !== undefined);
			if (!derived.length && !ranged) continue;
			const own = numeric(processedValues(processedData, axis));
			if (!own) continue;
			const values = [...own, ...derived, ...(options.zero?.includes(axis) ? [0] : [])];
			next[axis] = {
				...scales[axis],
				domain: [Math.min(...values), Math.max(...values)],
				nice: scales[axis]?.nice ?? true
			};
		}
		return { ...state, scales: next };
	};
}
