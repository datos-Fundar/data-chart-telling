import { resolveAccessor } from '$lib/plots/utils/accessors';
import { SERIES_KEY } from '$lib/layout/phases/transforms';
import type { AxisChannelName } from '$lib/types/layout/mapping';
import type { ProcessedChannel, ProcessedData, ProcessedRow } from '$lib/types/layout/phases';

/** A plain-text value: dates as locale dates, everything else stringified. */
export function formatValue(value: unknown): string {
	return value instanceof Date ? value.toLocaleDateString() : String(value);
}

const STACKS: Record<AxisChannelName, string> = { x: 'stackX', y: 'stackY' };

/**
 * How one axis reads on a processed row: its own channel, else the range the
 * transforms gave it - a stack's own share (`2 − 1`), any other span as `1-2`.
 */
function axisText(processed: ProcessedData, axis: AxisChannelName): (row: ProcessedRow) => string {
	const { channels, transforms } = processed;
	const read = (channel: ProcessedChannel) =>
		resolveAccessor(channel as never) as (row: ProcessedRow) => unknown;
	const point = channels[axis];
	if (point !== undefined) {
		const value = read(point);
		return (row) => formatValue(value(row));
	}
	const low = channels[`${axis}1`];
	const high = channels[`${axis}2`];
	if (low === undefined || high === undefined) return () => '';
	const from = read(low);
	const to = read(high);
	if (transforms.some((t) => t.type === STACKS[axis])) {
		return (row) => formatValue(Number(to(row)) - Number(from(row)));
	}
	return (row) => `${formatValue(from(row))}-${formatValue(to(row))}`;
}

/**
 * The default tooltip for an axis plot's processed rows: `x: y` as the
 * transforms left them, under the row's series when the plot groups its rows
 * (unless `series` is `false`).
 */
export function buildChannelTooltipFormat(
	state: { processedData?: ProcessedData; channels?: { grouping?: unknown } },
	options: { series?: boolean; separator?: string } = {}
): (row: ProcessedRow) => string {
	const processed = state.processedData;
	if (!processed) return () => '';
	const x = axisText(processed, 'x');
	const y = axisText(processed, 'y');
	const separator = options.separator ?? ': ';
	const series = (options.series ?? true) && state.channels?.grouping !== undefined;
	return (row) => `${series ? `${String(row[SERIES_KEY])}\n` : ''}${x(row)}${separator}${y(row)}`;
}
