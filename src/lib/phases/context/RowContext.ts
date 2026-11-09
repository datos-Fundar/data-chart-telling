import { SERIES_ID_KEY, SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import { resolveAccessor } from '$lib/utils/accessors';
import { seriesIdOf } from '$lib/utils/grouping';
import type { PlotRowContext } from '$lib/types/layout/context';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type { ProcessedData, ProcessedRow } from '$lib/types/phases';

/** Where a row's context is kept on it: under a symbol, which survives the copies svelteplot makes of a row. */
const KEY = Symbol('dct-row-context');

/** What the shared context is worked out from. */
type ContextSource = {
	processedData?: ProcessedData;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	resolvedSeries?: Series<any>[];
	axes?: PlotAxes;
};

/**
 * The context of the rows a plot draws ({@link PlotRowContext}): worked out once per row by the "context" phase,
 * kept on the row itself, and read back from it - or from any copy of it - with {@link of}.
 */
export class RowContext {
	/**
	 * What the plot knows of `row`: its series, where it sits, the value it shows and whatever its kind works out
	 * for it, with the row itself. A row no plot drew reads as its series alone.
	 */
	static of<TContext extends PlotRowContext = PlotRowContext>(row: unknown): TContext {
		if (row == null || typeof row !== 'object') return {} as TContext;
		const record = row as ProcessedRow;
		const own = record[KEY] as PlotRowContext | undefined;
		if (own) return { ...own, row } as TContext;
		const series = record[SERIES_KEY];
		return { ...(typeof series === 'string' ? { series } : {}), row } as TContext;
	}

	/** Keeps `context` on `row`, for {@link of} to read back. */
	static tag(row: ProcessedRow, context: PlotRowContext): void {
		row[KEY] = context;
	}

	/** Whether `row` carries a context already. */
	static has(row: unknown): boolean {
		return row != null && typeof row === 'object' && KEY in (row as object);
	}

	/** A reader of the rows of `state`: the context each carries, else the shared one, for a row no phase tagged. */
	static reader(state: ContextSource): (row: ProcessedRow) => PlotRowContext {
		let shared: ((row: ProcessedRow) => PlotRowContext) | undefined;
		return (row) => {
			if (RowContext.has(row)) return RowContext.of(row);
			shared ??= RowContext.shared(state);
			return { ...shared(row), row };
		};
	}

	/**
	 * The context every plot gives a processed row: its series; its `x` and `y` - each its series' own value
	 * (a stacked row's own, not the running total), else where the transforms put it (a density's estimate, a
	 * bin's centre); and its value on the plot's value axis, when that is a number.
	 */
	static shared(state: ContextSource): (row: ProcessedRow) => PlotRowContext {
		const processed = state.processedData;
		if (!processed) return () => ({});
		const valueAxis = PlotAxes.valueOf(state);
		const placed = ProcessedPositions.of(processed, valueAxis);
		const x = RowContext.#along(state, 'x', RowContext.#stacked(processed, 'x') ?? placed.x);
		const y = RowContext.#along(state, 'y', RowContext.#stacked(processed, 'y') ?? placed.y);
		return (row) => {
			const series = row[SERIES_KEY];
			const at = { x: x(row), y: y(row) };
			const raw = at[valueAxis as 'x' | 'y'];
			const value = raw instanceof Date || raw === null || raw === '' ? NaN : Number(raw);
			return {
				...(typeof series === 'string' ? { series } : {}),
				...at,
				...(Number.isFinite(value) ? { value } : {})
			};
		};
	}

	/** A stacked row's own value along `axis` - its span, not the running total - or `undefined` with no stack there. */
	static #stacked(
		processed: ProcessedData,
		axis: 'x' | 'y'
	): ((row: ProcessedRow) => number) | undefined {
		const from = processed.channels[`${axis}1`];
		const to = processed.channels[`${axis}2`];
		const stack = axis === 'x' ? 'stackX' : 'stackY';
		if (from === undefined || to === undefined) return undefined;
		if (!processed.transforms.some((t) => t.type === stack)) return undefined;
		const low = resolveAccessor(from as never) as (row: ProcessedRow) => unknown;
		const high = resolveAccessor(to as never) as (row: ProcessedRow) => unknown;
		return (row) => Number(high(row)) - Number(low(row));
	}

	/** A row's value along `axis`: its series' own channel, else `placed`. */
	static #along(
		state: ContextSource,
		axis: AxisChannelName,
		placed: (row: ProcessedRow) => unknown
	): (row: ProcessedRow) => unknown {
		const bySeries = new Map(
			(state.resolvedSeries ?? []).flatMap((s) => {
				const accessor = s[axis];
				return accessor === undefined ? [] : [[seriesIdOf(s), resolveAccessor(accessor as never)]];
			})
		);
		return (row) => {
			const own = bySeries.get(String(row[SERIES_ID_KEY])) as
				| ((row: ProcessedRow) => unknown)
				| undefined;
			const value = own?.(row);
			return value === undefined ? placed(row) : value;
		};
	}
}
