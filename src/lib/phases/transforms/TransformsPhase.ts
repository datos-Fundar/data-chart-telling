import { ValueLabels } from '$lib/layout/styles/ValueLabels';
import { Transforms } from '$lib/phases/transforms/Transforms';
import { ValueSelection } from '$lib/phases/transforms/ValueSelection';
import { ProcessedPositions } from '$lib/phases/transforms/ProcessedPositions';
import { seriesIdOf } from '$lib/utils/grouping';
import { PANEL_KEY } from '$lib/phases/facet/FacetPanels';
import { resolveAccessor } from '$lib/utils/accessors';
import { buildGroupedSeries } from '$lib/plots/utils/segments';
import { PlotAxes } from '$lib/phases/data/PlotAxes';
import type { Series } from '$lib/types/plots/data/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { VisualGroup } from '$lib/types/plots/segments/config';
import type {
	PhaseStage,
	ProcessedChannel,
	ProcessedChannelName,
	ProcessedData,
	ProcessedRow,
	TransformsStageOptions,
	TransformsStageState
} from '$lib/types/phases';

/** The field each processed row carries its series name under, for its color, legend and labels. */
export const SERIES_KEY = '__series';

/** The field each processed row carries its series id under - the transforms' `z`, so a stack or bin keeps series apart. */
export const SERIES_ID_KEY = '__seriesId';

/** The field a gap-filled row carries its interpolated value under, for the transforms to read. */
export const GAP_VALUE = '__gapValue';

/** The field a gap-filled row carries its gap kind under, so a processed copy of it keeps its fill style. */
export const GAP_KIND = '__gapKind';

const CHANNEL_NAMES: readonly ProcessedChannelName[] = ['x', 'y', 'x1', 'x2', 'y1', 'y2'];

/** Props of a transform's output that are neither a channel nor an option for the mark. */
const NOT_OPTIONS = new Set(['data', 'z', 'grouping', 'transforms', 'sort', 'filter']);

/**
 * The "transforms" phase every axis-based plot shares: runs the plot-level
 * transforms once over every visible series' rows together, so a stack sees
 * every series and a bin keeps each series apart (both group by series), and
 * leaves the result in `state.processedData` for the plot's own marks - and
 * in `state.processedGroups`, split back into the visual groups they draw. With
 * facet panels, the transforms run once per panel's rows, so a stack never
 * combines two panels, and every row they return keeps its panel. A gap that
 * `styles.gaps` fills is read at its interpolated value, so it takes its place
 * in a stack the way a real value would, and keeps its gap kind.
 */
export class TransformsPhase<
	TState extends TransformsStageState,
	TEnv = unknown
> implements PhaseStage<TState, TEnv> {
	readonly phase = 'transforms' as const;
	readonly #options: TransformsStageOptions<TState, TEnv>;
	readonly #connect: boolean;

	/** `connect`: whether a series' visual segments bridge into each other, as the kind's "data" phase splits them. */
	constructor(options: TransformsStageOptions<TState, TEnv> = {}, connect = true) {
		this.#options = options;
		this.#connect = connect;
	}

	run = (state: TState, env: TEnv): TState => {
		const options = this.#options;
		const visible = (state.resolvedSeries ?? []) as Series[];
		// An omitted part of a whole is laid out with the rest, so they keep their places; it is dropped after.
		const removed = state.removedSeries;
		const kept =
			options.keepsOmitted && removed?.mode === 'omit' ? (removed.series as Series[]) : [];
		const series = [...visible, ...kept];
		const omittedIds = new Set(kept.map(seriesIdOf));
		// A gap `styles.gaps` fills carries its filled value and kind, and reads at that value.
		const fillsOf = (s: Series) => state.gapFillMaps?.get(seriesIdOf(s));
		const data: ProcessedRow[] = series.flatMap((s) =>
			s.data.map((row) => ({
				...row,
				...TransformsPhase.#fillTags(fillsOf(s)?.get(row)),
				[SERIES_KEY]: s.name,
				[SERIES_ID_KEY]: seriesIdOf(s),
				...(s.panel !== undefined ? { [PANEL_KEY]: s.panel } : {})
			}))
		);
		const valueAxis = PlotAxes.valueOf(state);
		const shared = {
			x: TransformsPhase.#sharedChannel(series, 'x'),
			y: TransformsPhase.#sharedChannel(series, 'y')
		};
		const own = shared[valueAxis];
		const filled = [...(state.gapFillMaps?.values() ?? [])].some((fills) => fills.size > 0);
		if (filled && own !== undefined) {
			const read = resolveAccessor(own as never) as (row: ProcessedRow) => unknown;
			shared[valueAxis] = (row: ProcessedRow) => row[GAP_VALUE] ?? read(row);
		}
		const transforms = options.transforms
			? options.transforms(state, env)
			: (state.transforms ?? []);
		const rescaled = TransformsPhase.#rescaled(state, transforms, shared, valueAxis);
		if (rescaled) shared[valueAxis] = rescaled;
		const { x, y } = shared;

		if (!transforms.length) {
			const channels = Object.fromEntries(
				Object.entries({ x, y }).filter(([, channel]) => channel !== undefined)
			) as ProcessedData['channels'];
			const processedData: ProcessedData = {
				data: data.filter((row) => !omittedIds.has(row[SERIES_ID_KEY] as string)),
				channels,
				options: {},
				transforms
			};
			return this.#withGroups({ ...state, processedData });
		}

		const out = TransformsPhase.#runByPanel(data, (rows) =>
			Transforms.resolve({ data: rows, x, y, grouping: SERIES_ID_KEY, transforms }, rows)
		);
		const channels: ProcessedData['channels'] = {};
		const markOptions: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(out)) {
			if ((CHANNEL_NAMES as readonly string[]).includes(key)) {
				channels[key as ProcessedChannelName] = value as ProcessedChannel;
			} else if (!NOT_OPTIONS.has(key)) {
				markOptions[key] = value;
			}
		}
		// An aggregating transform (bin, group) keeps only its `z`, the series id: put the name back.
		const nameById = new Map(series.map((s) => [seriesIdOf(s), s.name]));
		const rows = (out.data as ProcessedRow[]).filter(
			(row) => !omittedIds.has(row[SERIES_ID_KEY] as string)
		);
		for (const row of rows) {
			if (row[SERIES_KEY] === undefined && row[SERIES_ID_KEY] !== undefined) {
				row[SERIES_KEY] = nameById.get(row[SERIES_ID_KEY] as string);
			}
		}
		const processedData: ProcessedData = {
			data: rows,
			channels,
			options: markOptions,
			transforms
		};
		return this.#withGroups({ ...state, processedData });
	};

	/**
	 * `state` with its processed rows split into the visual groups the kind's marks
	 * draw (`processedGroups`), and the rows its value labels are written for
	 * (`labelled`).
	 */
	#withGroups(state: TState): TState {
		const processedGroups =
			this.#options.groups === 'runs'
				? TransformsPhase.#buildRuns(state)
				: TransformsPhase.#buildGroups(state, this.#connect);
		return { ...state, processedGroups, ...this.#labelled(state) };
	}

	/**
	 * The rows `styles.values` writes labels for, picked per facet panel - a
	 * panel's own last row, not the last of every panel - by the author's
	 * `select` and `series`, over the plot's own default. Left out while the
	 * labels are off, or when the plot picks no rows.
	 */
	#labelled(state: TState): Pick<TransformsStageState, 'labelled' | 'labelSelects'> {
		const options = this.#options.labels;
		const values = state.values;
		if (!options || !ValueLabels.shows(values, options.show)) return {};
		const processed = state.processedData!;
		const measure = options.measure?.(state);
		const valueAxis = measure ? 'y' : (PlotAxes.valueOf(state) as 'x' | 'y');
		const select = values?.select ?? options.select;
		const selections = ValueSelection.transforms(select, values?.series, valueAxis);
		const position = ProcessedPositions.of(processed, valueAxis);
		const skip = options.skip?.(state);
		const channels = {
			x: position.x,
			y: measure ?? position.y,
			group:
				options.group === 'category'
					? position[PlotAxes.categoryOf(state) as 'x' | 'y']
					: SERIES_ID_KEY
		};
		const panels = new Map<unknown, ProcessedRow[]>();
		for (const row of processed.data) {
			if (skip?.(row)) continue;
			const bucket = panels.get(row[PANEL_KEY]);
			if (bucket) bucket.push(row);
			else panels.set(row[PANEL_KEY], [row]);
		}
		const labelled = new Set(
			[...panels.values()].flatMap((rows) => ValueSelection.pick(rows, selections, channels))
		);
		return {
			labelled: processed.data.filter((row) => labelled.has(row)),
			labelSelects: ValueSelection.selectors(select)
		};
	}

	/**
	 * The value channel of a stack whose legend rescales some of its series: each visible row's value scaled by
	 * how much of its category's total (in its facet panel) those series took, so the visible parts make the
	 * whole the category had. `undefined` for a plot that stacks nothing on its value axis, or rescales nothing.
	 */
	static #rescaled(
		state: TransformsStageState,
		transforms: { type: string }[],
		shared: Partial<Record<'x' | 'y', ProcessedChannel>>,
		valueAxis: 'x' | 'y'
	): ((row: ProcessedRow) => unknown) | undefined {
		const removed = state.removedSeries;
		const rescaled = removed?.mode === 'rescale' ? (removed.series as Series[]) : [];
		const stack = valueAxis === 'y' ? 'stackY' : 'stackX';
		const own = shared[valueAxis];
		const category = shared[valueAxis === 'y' ? 'x' : 'y'];
		if (!rescaled.length || own === undefined || category === undefined) return undefined;
		if (!transforms.some((t) => t.type === stack)) return undefined;
		const value = resolveAccessor(own as never) as (row: ProcessedRow) => unknown;
		const categoryOf = resolveAccessor(category as never) as (row: ProcessedRow) => unknown;
		const keyOf = (row: ProcessedRow, panel: unknown) => JSON.stringify([panel, categoryOf(row)]);
		const totals = (series: Series[]) => {
			const sums = new Map<string, number>();
			for (const s of series) {
				for (const row of s.data as ProcessedRow[]) {
					const amount = Number(value(row));
					if (!Number.isFinite(amount)) continue;
					const key = keyOf(row, s.panel);
					sums.set(key, (sums.get(key) ?? 0) + amount);
				}
			}
			return sums;
		};
		const visible = (state.resolvedSeries ?? []) as Series[];
		const shown = totals(visible);
		const whole = totals([...visible, ...rescaled]);
		return (row) => {
			const amount = Number(value(row));
			const key = keyOf(row, row[PANEL_KEY]);
			const part = shown.get(key) ?? 0;
			return part === 0 ? amount : (amount * (whole.get(key) ?? part)) / part;
		};
	}

	/** What a gap-filled row carries: its interpolated value and the kind of zone that filled it. */
	static #fillTags(fill: { value: number; kind: string } | undefined): ProcessedRow {
		return fill ? { [GAP_VALUE]: fill.value, [GAP_KIND]: fill.kind } : {};
	}

	/**
	 * The processed rows split back into one group per visible series, each cut
	 * into its styled visual segments by `segments`, matched on the processed `x`.
	 * Each series reads its rows through its value axis: a stack's top, a bin's start.
	 */
	static #buildGroups<TStyle>(
		state: TransformsStageState & { segments?: SegmentsConfig<TStyle> },
		connect: boolean
	): VisualGroup<Series<ProcessedRow>, TStyle>[] {
		const { data } = state.processedData!;
		const series = (state.resolvedSeries ?? []).map((s) =>
			TransformsPhase.#processedSeries(
				state,
				s,
				data.filter((row) => row[SERIES_ID_KEY] === seriesIdOf(s))
			)
		);
		return buildGroupedSeries<Series<ProcessedRow>, TStyle>(
			series,
			state.segments,
			connect,
			state.segmentBase
		);
	}

	/**
	 * The processed rows in their own order, split into runs of consecutive rows
	 * from the same visible series, each cut into its styled visual segments like
	 * {@link TransformsPhase.#buildGroups}. Drawn in turn, the runs keep the rows' order
	 * across series, so a transform that reorders rows (`sort`, `reverse`,
	 * `shuffle`) decides which rows paint on top. Unreordered, each series is one run.
	 */
	static #buildRuns<TStyle>(
		state: TransformsStageState & { segments?: SegmentsConfig<TStyle> }
	): VisualGroup<Series<ProcessedRow>, TStyle>[] {
		const byId = new Map((state.resolvedSeries ?? []).map((s) => [seriesIdOf(s), s]));
		const runs: Series<ProcessedRow>[] = [];
		for (const row of state.processedData!.data) {
			const source = byId.get(row[SERIES_ID_KEY] as string);
			if (!source) continue;
			const last = runs.at(-1);
			if (last && seriesIdOf(last) === seriesIdOf(source)) last.data.push(row);
			else runs.push(TransformsPhase.#processedSeries(state, source, [row]));
		}
		return buildGroupedSeries<Series<ProcessedRow>, TStyle>(
			runs,
			state.segments,
			false,
			state.segmentBase
		);
	}

	/**
	 * One series accessor shared by every series as-is, so a field key keeps
	 * feeding svelteplot's axis-title inference; a per-series function otherwise.
	 * `undefined` when no series sets the channel.
	 */
	static #sharedChannel(series: Series[], key: 'x' | 'y'): ProcessedChannel | undefined {
		const first = series[0]?.[key];
		if (series.every((s) => s[key] === first)) return first as ProcessedChannel | undefined;
		const byId = new Map(
			series.map((s) => [seriesIdOf(s), s[key] === undefined ? undefined : resolveAccessor(s[key])])
		);
		return (row: ProcessedRow) => byId.get(row[SERIES_ID_KEY] as string)?.(row as never);
	}

	/**
	 * Runs `run` over each facet panel's rows (or over every row, without
	 * panels) and joins the results: the rows in panel order, each tagged with its
	 * panel, and the channels and options of the first run - the transforms set
	 * the same ones for every panel.
	 */
	static #runByPanel(
		data: ProcessedRow[],
		run: (rows: ProcessedRow[]) => unknown
	): Record<string, unknown> {
		const panels = new Map<unknown, ProcessedRow[]>();
		for (const row of data) {
			const bucket = panels.get(row[PANEL_KEY]);
			if (bucket) bucket.push(row);
			else panels.set(row[PANEL_KEY], [row]);
		}
		if (panels.size === 0 || (panels.size === 1 && panels.has(undefined))) {
			return run(data) as Record<string, unknown>;
		}
		let first: Record<string, unknown> | undefined;
		const rows: ProcessedRow[] = [];
		for (const [panel, panelRows] of panels) {
			const out = run(panelRows) as Record<string, unknown>;
			first ??= out;
			for (const row of out.data as ProcessedRow[]) {
				if (panel !== undefined && row[PANEL_KEY] === undefined) row[PANEL_KEY] = panel;
				rows.push(row);
			}
		}
		return { ...first, data: rows };
	}

	/**
	 * One series over some of its processed rows. With no transforms it keeps its
	 * own `x`/`y`; otherwise it reads the transforms' channels - on the value axis
	 * a stack's top (`y2` as its `y`, or `x2` as its `x` on a horizontal plot), on
	 * the other a bin's start.
	 */
	static #processedSeries(
		state: TransformsStageState,
		source: Series,
		data: ProcessedRow[]
	): Series<ProcessedRow> {
		const { channels, transforms } = state.processedData!;
		const valueAxis = PlotAxes.valueOf(state);
		const read = (axis: 'x' | 'y') =>
			(transforms.length
				? (channels[axis] ??
					channels[`${axis}${axis === valueAxis ? 2 : 1}` as ProcessedChannelName])
				: source[axis]) as Series<ProcessedRow>['x'];
		return {
			name: source.name,
			...(source.id !== undefined ? { id: source.id } : {}),
			...(source.panel !== undefined ? { panel: source.panel } : {}),
			x: read('x'),
			y: read('y'),
			data
		};
	}
}
