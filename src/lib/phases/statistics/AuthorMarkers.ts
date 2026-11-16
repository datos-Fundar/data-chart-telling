import { MarkerKinds } from '$lib/markers/MarkerKinds';
import { Transforms } from '$lib/phases/transforms/Transforms';
import { MarkerGrouping } from '$lib/phases/statistics/MarkerGrouping';
import { SERIES_ID_KEY, SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { RowContext } from '$lib/phases/context/RowContext';
import type { ProcessedData } from '$lib/types/phases';
import type { ScopedMarkerGroup } from '$lib/types/layout/geometry';

type Row = Record<string, unknown>;

/** The props of a marker that read its rows: each a value, or a function of the row. */
const ROW_PROPS = [
	'x',
	'y',
	'x1',
	'x2',
	'y1',
	'y2',
	'y3',
	'y4',
	'value',
	'text',
	'r',
	'opacity',
	'color',
	'symbol',
	'length',
	'rotate',
	'grouping',
	'dx',
	'dy',
	'textAnchor',
	'lineAnchor',
	'title',
	'href'
] as const;

type RowFunction = (row: unknown, context: unknown) => unknown;

/** Kinds that handle `scope: 'segment'` themselves, at render time. */
const RENDER_SCOPED_KINDS = new Set(['component', 'hover']);

/** The plot's own author markers, made ready for the rest of the pipeline. */
export class AuthorMarkers {
	/**
	 * Prepares a plot's own author markers for the rest of its pipeline: inherits
	 * the plot's grouping and default color first (a transform's `z` defaults to
	 * the grouping), splits a segment-scoped marker into one marker per segment of
	 * its series, then runs each marker's own transforms over its rows - its
	 * segment's or series' rows when it's scoped to one, the plot's rows otherwise.
	 */
	static prepare<T extends { type: string; component?: unknown; props?: unknown }>(
		markers: T[],
		plot: {
			grouping?: unknown;
			color?: unknown;
			defaultColor?: string;
			flat: Row[];
			resolvedSeries?: { name: string; data: Row[] }[];
			scopedGroups?: ScopedMarkerGroup<Row>[];
		}
	): T[] {
		return MarkerGrouping.inheritPlotGrouping(markers, plot).flatMap((marker) => {
			const scope = (marker as { series?: unknown }).series;
			const seriesRows =
				typeof scope === 'string'
					? plot.resolvedSeries?.find((s) => s.name === scope)?.data
					: undefined;
			const rows = seriesRows ?? plot.flat;
			return AuthorMarkers.#splitBySegment(marker, rows, plot.scopedGroups).map((own) =>
				Transforms.resolve(own, rows)
			);
		});
	}

	/**
	 * `marker` with every function of its rows - its channels, its `styles` and its transforms' `filter` - given what
	 * the plot knows of each row besides the row itself: `(row, context)`, the row's place among the marker's in
	 * `context.index`.
	 */
	static withContext<T extends object>(marker: T): T {
		const own = marker as T & {
			styles?: Record<string, unknown>;
			transforms?: { filter?: unknown }[];
		};
		const read = (fn: unknown) =>
			typeof fn === 'function'
				? (row: unknown, index?: number) =>
						(fn as RowFunction)(
							row,
							index === undefined ? RowContext.of(row) : RowContext.at(row, index)
						)
				: fn;
		const next: Record<string, unknown> = { ...own };
		for (const key of ROW_PROPS) {
			if (typeof next[key] === 'function') next[key] = read(next[key]);
		}
		if (own.styles) {
			next.styles = Object.fromEntries(
				Object.entries(own.styles).map(([key, value]) => [key, read(value)])
			);
		}
		if (own.transforms) {
			next.transforms = own.transforms.map((transform) =>
				typeof transform.filter === 'function'
					? { ...transform, filter: read(transform.filter) }
					: transform
			);
		}
		return next as T;
	}

	/**
	 * One marker per segment of a `scope: 'segment'` marker's series, each over
	 * that segment's rows and in its color. Any other marker is kept whole.
	 */
	static #splitBySegment<T extends { type: string }>(
		marker: T,
		rows: Row[],
		scopedGroups: ScopedMarkerGroup<Row>[] = []
	): T[] {
		const own = marker as T & { series?: unknown; scope?: unknown; data?: Row[] };
		if (own.scope !== 'segment' || RENDER_SCOPED_KINDS.has(own.type)) return [marker];
		const group = scopedGroups.find((g) => g.name === own.series);
		if (!group || group.segments.length === 0) return [marker];
		return group.segments
			.map((seg) => ({ seg, data: (own.data ?? rows).filter((row) => seg.match(row)) }))
			.filter(({ data }) => data.length > 0)
			.map(({ seg, data }) => MarkerGrouping.withSeriesColor({ ...own, data }, seg.color) as T);
	}

	/** Whether a marker's kind draws the plot's rows when it sets no `data`. */
	static #drawsRows(type: string): boolean {
		return MarkerKinds.of(type)?.drawsRows ?? false;
	}

	/**
	 * A marker that draws the plot's rows (it sets no `data`) draws them as the
	 * plot does, after the plot's own transforms: it starts from the plot's
	 * processed rows - its series' rows when scoped to one - and takes the
	 * processed channels for any position it leaves unset. A position it sets
	 * itself reads that field of the processed rows (every source field is kept).
	 * Its `grouping` defaults to the plot's series, so it splits, and its own
	 * transforms run, per series. A plot without transforms draws its rows as
	 * they are, so its markers are left as is, as is a kind that draws no rows.
	 */
	static withProcessedRows<T extends { type: string }>(marker: T, processed?: ProcessedData): T {
		const own = marker as T & {
			data?: unknown;
			series?: unknown;
			grouping?: unknown;
		} & Record<string, unknown>;
		if (
			own.data !== undefined ||
			!AuthorMarkers.#drawsRows(own.type) ||
			!processed?.transforms.length
		) {
			return marker;
		}
		const rows =
			typeof own.series === 'string'
				? processed.data.filter((row) => row[SERIES_KEY] === own.series)
				: processed.data;
		const channels = Object.fromEntries(
			Object.entries(processed.channels).filter(([key]) => own[key] === undefined)
		);
		return { ...own, ...channels, data: rows, grouping: own.grouping ?? SERIES_ID_KEY } as T;
	}
}
