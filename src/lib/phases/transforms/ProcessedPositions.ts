import { resolveAccessor } from '$lib/utils/accessors';
import { isGapValue } from '$lib/plots/utils/gaps';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type { ProcessedChannel, ProcessedData, ProcessedRow } from '$lib/types/phases';

const POSITION_CHANNELS = {
	x: ['x', 'x1', 'x2'],
	y: ['y', 'y1', 'y2']
} as const;

/**
 * Where the "transforms" phase's processed rows sit, read off its output
 * (`state.processedData`) - by whichever channels the transforms left: a
 * row's own value, a stack's `1`-`2` span, a bin's edges. Every later phase
 * reads positions through it instead of telling those channels apart itself.
 */
export class ProcessedPositions {
	/**
	 * Where a processed row sits: the top of its value (`y2`, or `y` - `x2`/`x`
	 * when `valueAxis` is `x`) and, on the other axis, its own position (or the
	 * middle of its `1`-`2` span, a bin's centre).
	 */
	static of(
		processed: ProcessedData,
		valueAxis: 'x' | 'y' = 'y'
	): {
		x: (row: ProcessedRow) => unknown;
		y: (row: ProcessedRow) => unknown;
	} {
		const { channels } = processed;
		const read = (channel: ProcessedChannel) =>
			resolveAccessor(channel as never) as (row: ProcessedRow) => unknown;
		const along = (axis: 'x' | 'y') => {
			const own = channels[axis];
			const from = channels[`${axis}1`];
			const to = channels[`${axis}2`];
			if (axis === valueAxis) {
				const top = to ?? own;
				return top !== undefined ? read(top) : () => undefined;
			}
			if (own !== undefined) return read(own);
			if (from === undefined || to === undefined) return () => undefined;
			return (row: ProcessedRow) => (Number(read(from)(row)) + Number(read(to)(row))) / 2;
		};
		return { x: along('x'), y: along('y') };
	}

	/**
	 * A processed row's span along `valueAxis`: from its `1` channel (a stack's
	 * bottom) or, with none, from `baseline`, to its top. `undefined` when the
	 * row has no value there. `stacked` tells a stack from plain values.
	 */
	static span(
		processed: ProcessedData,
		valueAxis: 'x' | 'y',
		baseline = 0
	): { stacked: boolean; of: (row: ProcessedRow) => [number, number] | undefined } {
		const from = processed.channels[`${valueAxis}1`];
		const stacked = from !== undefined && processed.channels[`${valueAxis}2`] !== undefined;
		const top = ProcessedPositions.of(processed, valueAxis)[valueAxis];
		const bottom = stacked
			? (resolveAccessor(from as never) as (row: ProcessedRow) => unknown)
			: () => baseline;
		return {
			stacked,
			of: (row) => {
				const end = top(row);
				const start = bottom(row);
				if (isGapValue(end) || isGapValue(start)) return undefined;
				const span: [number, number] = [Number(start), Number(end)];
				return Number.isFinite(span[0]) && Number.isFinite(span[1]) ? span : undefined;
			}
		};
	}

	/** Every value the processed rows sit at on one axis, through each of its channels. */
	static values(processed: ProcessedData | undefined, axis: AxisChannelName): unknown[] {
		if (!processed) return [];
		return POSITION_CHANNELS[axis].flatMap((name) => {
			const channel = processed.channels[name];
			if (channel === undefined) return [];
			const read = resolveAccessor(channel as never) as (row: unknown) => unknown;
			return processed.data.map((row) => read(row as never));
		});
	}
}
