import { resolveTransforms } from '$lib/utils/transforms';
import { resolveAccessor } from '$lib/plots/utils/accessors';
import { buildGroupedSeries } from '$lib/plots/utils/segments';
import type { Series } from '$lib/types/plots/data/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type {
	ProcessedChannel,
	ProcessedChannelName,
	ProcessedData,
	ProcessedRow,
	TransformsStageOptions,
	TransformsStageState
} from '$lib/types/layout/phases';

/** The field each processed row carries its series name under — the transforms' `z`, so a stack or bin keeps series apart. */
export const SERIES_KEY = '__series';

const CHANNEL_NAMES: readonly ProcessedChannelName[] = ['x', 'y', 'x1', 'x2', 'y1', 'y2'];

/** Props of a transform's output that are neither a channel nor an option for the mark. */
const NOT_OPTIONS = new Set(['data', 'z', 'grouping', 'transforms', 'sort', 'filter']);

/**
 * One series accessor shared by every series as-is, so a field key keeps
 * feeding svelteplot's axis-title inference; a per-series function otherwise.
 */
function sharedChannel(series: Series[], key: 'x' | 'y'): ProcessedChannel {
	const first = series[0]?.[key];
	if (series.every((s) => s[key] === first)) return first as ProcessedChannel;
	const byName = new Map(series.map((s) => [s.name, resolveAccessor(s[key])]));
	return (row: ProcessedRow) => byName.get(row[SERIES_KEY] as string)?.(row as never);
}

/**
 * The "transforms" stage every axis-based plot shares: runs the plot-level
 * transforms once over every visible series' rows together, so a stack sees
 * every series and a bin keeps each series apart (both group by series), and
 * leaves the result in `state.processedData` for the plot's own marks.
 */
export function buildTransforms<TState extends TransformsStageState, TCtx = unknown>(
	options: TransformsStageOptions<TState, TCtx> = {}
): (state: TState, ctx: TCtx) => TState {
	return (state, ctx) => {
		const series = (state.resolvedSeries ?? []) as Series[];
		const data: ProcessedRow[] = series.flatMap((s) =>
			s.data.map((row) => ({ ...row, ...options.tagRow?.(row, s, state), [SERIES_KEY]: s.name }))
		);
		const x = sharedChannel(series, 'x');
		const sharedY = sharedChannel(series, 'y');
		const y = options.y ? options.y(sharedY, state) : sharedY;
		const transforms = options.transforms
			? options.transforms(state, ctx)
			: (state.transforms ?? []);

		if (!transforms.length) {
			const processedData: ProcessedData = { data, channels: { x, y }, options: {}, transforms };
			return { ...state, processedData };
		}

		const out = resolveTransforms({ data, x, y, grouping: SERIES_KEY, transforms }, data) as Record<
			string,
			unknown
		>;
		const channels: ProcessedData['channels'] = {};
		const markOptions: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(out)) {
			if ((CHANNEL_NAMES as readonly string[]).includes(key)) {
				channels[key as ProcessedChannelName] = value as ProcessedChannel;
			} else if (!NOT_OPTIONS.has(key)) {
				markOptions[key] = value;
			}
		}
		const processedData: ProcessedData = {
			data: out.data as ProcessedRow[],
			channels,
			options: markOptions,
			transforms
		};
		return { ...state, processedData };
	};
}

/**
 * The processed rows split back into one group per visible series, each cut
 * into its styled visual segments by `segments`, matched on the processed `x`.
 * Each series reads its rows as {@link processedSeries} does.
 */
export function buildProcessedGroups<TStyle>(
	state: TransformsStageState & { segments?: SegmentsConfig<TStyle> },
	connect = true
): VisualGroup<Series<ProcessedRow>, TStyle>[] {
	const { data } = state.processedData!;
	const series = (state.resolvedSeries ?? []).map((s) =>
		processedSeries(
			state,
			s,
			data.filter((row) => row[SERIES_KEY] === s.name)
		)
	);
	return buildGroupedSeries<Series<ProcessedRow>, TStyle>(series, state.segments, connect);
}

/**
 * The processed rows in their own order, split into runs of consecutive rows
 * from the same visible series, each cut into its styled visual segments like
 * {@link buildProcessedGroups}. Drawn in turn, the runs keep the rows' order
 * across series, so a transform that reorders rows (`sort`, `reverse`,
 * `shuffle`) decides which rows paint on top. Unreordered, each series is one run.
 */
export function buildProcessedRuns<TStyle>(
	state: TransformsStageState & { segments?: SegmentsConfig<TStyle> }
): VisualGroup<Series<ProcessedRow>, TStyle>[] {
	const byName = new Map((state.resolvedSeries ?? []).map((s) => [s.name, s]));
	const runs: Series<ProcessedRow>[] = [];
	for (const row of state.processedData!.data) {
		const source = byName.get(row[SERIES_KEY] as string);
		if (!source) continue;
		const last = runs.at(-1);
		if (last?.name === source.name) last.data.push(row);
		else runs.push(processedSeries(state, source, [row]));
	}
	return buildGroupedSeries<Series<ProcessedRow>, TStyle>(runs, state.segments, false);
}

/**
 * One series over some of its processed rows. With no transforms it keeps its
 * own `x`/`y`; otherwise it reads the transforms' channels (a stack's top, `y2`, as its `y`).
 */
function processedSeries(
	state: TransformsStageState,
	source: Series,
	data: ProcessedRow[]
): Series<ProcessedRow> {
	const { channels, transforms } = state.processedData!;
	return {
		name: source.name,
		x: (transforms.length ? (channels.x ?? channels.x1) : source.x) as Series<ProcessedRow>['x'],
		y: (transforms.length ? (channels.y ?? channels.y2) : source.y) as Series<ProcessedRow>['y'],
		data
	};
}

/** Where a processed row sits: its `x` (or the middle of `x1`–`x2`) and the top of its `y` (`y2`, or `y`). */
export function processedPosition(processed: ProcessedData): {
	x: (row: ProcessedRow) => unknown;
	y: (row: ProcessedRow) => unknown;
} {
	const { x, x1, x2, y, y2 } = processed.channels;
	const read = (channel: ProcessedChannel) =>
		resolveAccessor(channel as never) as (row: ProcessedRow) => unknown;
	const xOf =
		x !== undefined
			? read(x)
			: (row: ProcessedRow) => (Number(read(x1!)(row)) + Number(read(x2!)(row))) / 2;
	const yOf = read((y2 ?? y)!);
	return { x: xOf, y: yOf };
}
