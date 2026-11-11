import type { BoxLabelConfig } from '$lib/types/markers/labels/box';
import { TREEMAP_ROW } from '$lib/phases/transforms/methods/TreemapTransform';
import { HoverDefaults } from '$lib/layout/hover/HoverDefaults';
import { RowContext } from '$lib/phases/context/RowContext';
import { NumberFormat } from '$lib/utils/NumberFormat';
import { Grouping } from '$lib/utils/grouping';
import { getConfiguration } from '$lib/configuration/config.svelte';
import type { AxisPlotDefaults, ProcessedRow } from '$lib/types/phases';
import type { AxisBasedMarkersConfig, RectMarkerConfig } from '$lib/types/markers/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { MarkerTransform } from '$lib/types/transforms';
import type { TreemapTransform } from '$lib/types/transforms/treemap';
import type { GroupingAccessor } from '$lib/types/layout/mapping';
import type { TreemapRowContext } from '$lib/types/plots/part-of-a-whole/treemap/props';
import type {
	TreemapPlotState,
	TreemapPlotEnv
} from '$lib/types/plots/part-of-a-whole/treemap/state';

/** A share is written with one decimal unless the author or the configuration's `numbers.decimals` says otherwise. */
const SHARE_DECIMALS = 1;

/** The width over the height of the box the tiles are shaped for, before the plot's own is known. */
const DEFAULT_ASPECT = 1.6;

/**
 * What a treemap writes for a tile's share: `suffix` is a percent sign unless the author asks for something
 * else, since a tile is a part of a whole.
 */
function shareDisplay(values: TreemapPlotState<never>['values']) {
	return { ...NumberFormat.displayOf(values), suffix: values?.suffix ?? '%' };
}

/**
 * What a treemap knows of a tile, as the transform left it on its row: its name, path, summed value and share
 * (from `0` to `100`). The tiles sit in a unit square, so they have no `x` or `y` to read.
 */
function tileOf(row: ProcessedRow): Omit<TreemapRowContext, 'series' | 'row'> {
	return {
		name: String(row[TREEMAP_ROW.name] ?? ''),
		path: (row[TREEMAP_ROW.path] as string[] | undefined) ?? [],
		value: Number(row[TREEMAP_ROW.value]),
		share: Number(row[TREEMAP_ROW.share]) * 100,
		x: undefined,
		y: undefined
	};
}

/** A tile's context, as the "context" phase left it on its row. */
const contextOf = (row: ProcessedRow) => RowContext.of<TreemapRowContext>(row);

/**
 * The plot's tiles: a `treemap` of its `value`, nested by the levels of its `grouping` (its `color` when unset,
 * as every plot groups by it then) and shaped for its box,
 * with the options of the author's own `treemap` transforms over it (`tile`...), and their other transforms
 * after it in order.
 */
function buildTransforms<TData extends Record<string, unknown>>(
	state: TreemapPlotState<TData>
): MarkerTransform[] {
	const own = state.transforms ?? [];
	const base = {
		type: 'treemap',
		value: state.value,
		levels: Grouping.levels(state.grouping ?? (state.color as GroupingAccessor<TData>), state.data),
		aspect: state.width && state.height ? state.width / state.height : DEFAULT_ASPECT
	} as TreemapTransform;
	const treemap = own
		.filter((t): t is TreemapTransform => t.type === 'treemap')
		.reduce<TreemapTransform>((merged, t) => ({ ...merged, ...t }), base);
	return [treemap, ...own.filter((t) => t.type !== 'treemap')];
}

/** The edges of the tiles, as the processed rows carry them. */
function edgesOf<TData extends Record<string, unknown>>(state: TreemapPlotState<TData>) {
	const { x1, x2, y1, y2 } = state.processedData!.channels;
	return { x1, x2, y1, y2 } as unknown as Pick<RectMarkerConfig, 'x1' | 'x2' | 'y1' | 'y2'>;
}

/**
 * The keys of the segments a tile has below its series: its path down to each deeper level
 * (`'Tertiary.Finance'`), outermost first, so the more specific wins. The series' own are in its style already.
 */
function pathKeysOf<TData extends Record<string, unknown>>(
	state: TreemapPlotState<TData>,
	row: ProcessedRow
): string[] {
	const { path } = contextOf(row);
	return path
		.slice(1)
		.map((_, i) => path.slice(0, i + 2).join(Grouping.SEPARATOR))
		.filter((key) => state.segments?.[key]);
}

/**
 * The tiles as `rect` markers, each with a `label`: the name of the tile over its share, fitted to it. A series'
 * tiles take its style - its color, under `styles.area` and the segments keyed by it (and `default`) - and the
 * segments keyed by a tile's path restyle it, so the tiles split into one marker per style. The legend's dimming
 * goes over all of them, and the hover marker's `active` and `others` over the tiles it reaches.
 */
function buildMarks<TData extends Record<string, unknown>>(
	state: TreemapPlotState<TData>,
	env: TreemapPlotEnv
): AxisBasedMarkersConfig[] {
	if (!state.processedData?.data.length) return [];
	const look = env.cfg.treemap;
	const edges = edgesOf(state);
	const labels = state.valueLabels?.show ? state.valueLabels : undefined;
	const number = NumberFormat.of(shareDisplay(state.values), env.cfg, SHARE_DECIMALS);
	const shareText = (row: ProcessedRow) => {
		const context = contextOf(row);
		return state.values?.format
			? state.values.format(context.share, number, context)
			: number(context.share);
	};

	/** The label of a series' tiles: the name over the share, fitted - or the share alone where the name does not fit. */
	const labelOf = (labels: NonNullable<typeof state.valueLabels>) => {
		const shape = labels.label(
			env,
			(row) => `${contextOf(row).name}
${shareText(row)}`,
			{ fontSize: look.fontSize }
		) as BoxLabelConfig;
		return {
			...shape,
			styles: { lineHeight: look.lineHeight, ...shape.styles },
			fit: { padding: look.padding, fallback: (row: ProcessedRow) => shareText(row) }
		};
	};

	return (state.processedGroups ?? []).flatMap((group) => {
		const series = group.series.name;
		const dimmed = env.interaction?.fillFor(series);
		const seriesColor = state.colorForSeries!(series);
		/** A tile's color: its series', or a tone of it by its path while `scales.color.depth` asks for one. */
		const colorOf = (row: ProcessedRow) =>
			state.colorForPath ? state.colorForPath(contextOf(row).path) : seriesColor;
		return group.visualSegments.flatMap((segment) => {
			const styled = new Map<string, { keys: string[]; color: string; rows: ProcessedRow[] }>();
			for (const row of segment.data as ProcessedRow[]) {
				const keys = pathKeysOf(state, row);
				const color = colorOf(row);
				const id = JSON.stringify([keys, color]);
				const bucket = styled.get(id) ?? styled.set(id, { keys, color, rows: [] }).get(id)!;
				bucket.rows.push(row);
			}
			return [...styled.values()].map(({ keys, color, rows }): RectMarkerConfig => {
				const style: BarSegmentStyle = Object.assign(
					{},
					segment.styles,
					...keys.flatMap((key) => state.segments![key].map((own) => own.styles ?? {}))
				);
				return {
					type: 'rect',
					data: rows,
					...edges,
					styles: {
						...style,
						fill: dimmed?.fill ?? style.fill ?? color,
						fillOpacity: dimmed?.fillOpacity ?? style.fillOpacity,
						stroke: style.stroke ?? look.stroke,
						strokeWidth: style.strokeWidth ?? look.strokeWidth
					},
					label: labels && labelOf(labels),
					hover: 'style'
				} as RectMarkerConfig;
			});
		});
	});
}

/**
 * TreemapPlot on the shared pipeline: its rows are the tiles of the `treemap` transform, laid out in a unit square
 * the plot's two continuous axes span (hidden). Its series are the outermost level of its `grouping`, which colors
 * the tiles and fills the legend. The tiles are `rect` markers, labelled by their own `label`. Hovering a tile is
 * hovering its row: an invisible `rect` over each one drives the plot's hover, and its tooltip names the tile and
 * gives its share.
 */
export function buildTreemapDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	TreemapPlotState<TData>,
	TreemapPlotEnv
> {
	return {
		data: {
			discreteAxes: 0,
			nested: true,
			segments: { color: (style) => style?.fill, connect: false, base: { flat: 'area' } }
		},
		// An omitted sector keeps its tiles' room, and every other tile its share; a rescaled one does not.
		transforms: { transforms: buildTransforms, keepsOmitted: true },
		// A tile's name, path, value and share, for its label, its tooltip and its hover.
		context: () => tileOf as (row: never) => object,
		scales: {
			defaults: () => ({
				x: { axisDisplay: 'none', grid: false },
				y: { axisDisplay: 'none', grid: false, reverse: true }
			}),
			fit: () => ({ x: { domain: [0, 1], fitted: true }, y: { domain: [0, 1], fitted: true } })
		},
		styles: { values: { show: true, layout: 'box' } },
		markers: { marks: buildMarks },
		hover: {
			strategy: 'punctual',
			// A tile is hovered through its own hit area, not through whichever point the pointer is nearest.
			pointMatching: 'contains',
			// A tile has no axes for a crosshair, and writes its own label: its hover only restyles the tiles.
			marker: (_state, env) => HoverDefaults.shapes(env.cfg),
			hitAreas: (state, hover) =>
				(hover.points as { row: ProcessedRow }[]).map(
					({ row }) =>
						({
							type: 'rect',
							data: [row],
							...edgesOf(state),
							styles: { fill: 'transparent' },
							hover: hover.active && 'trigger'
						}) as RectMarkerConfig
				),
			format: (state) => {
				const number = NumberFormat.of(
					shareDisplay(state.values),
					getConfiguration(),
					SHARE_DECIMALS
				);
				return ((row: ProcessedRow) => {
					const tile = contextOf(row);
					return `${tile.name}: ${number(tile.share)}`;
				}) as (row: never) => string;
			},
			label: () => ((row: ProcessedRow) => contextOf(row).name) as (row: never) => string
		}
	};
}
