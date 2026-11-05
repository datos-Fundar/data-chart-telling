import { TREEMAP_ROW } from '$lib/phases/transforms/methods/TreemapTransform';
import { NumberFormat } from '$lib/utils/NumberFormat';
import { getConfiguration } from '$lib/configuration/config.svelte';
import type { AxisPlotDefaults, ProcessedRow } from '$lib/types/phases';
import type { AxisBasedMarkersConfig, RectMarkerConfig } from '$lib/types/markers/common';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type {
	TreemapPlotState,
	TreemapPlotCtx
} from '$lib/types/plots/part-of-a-whole/treemap/state';
import type { TreemapTooltipTile } from '$lib/types/plots/part-of-a-whole/treemap/props';

/** A share is written with one decimal unless the author or the configuration's `numbers.decimals` says otherwise. */
const SHARE_DECIMALS = 1;

/** A named line style, as an SVG dash pattern; `'solid'` is none. */
const DASHES: Record<string, string | undefined> = {
	solid: undefined,
	dashed: '6 4',
	dotted: '2 3'
};

/**
 * What a treemap writes for a tile's share: `suffix` is a percent sign unless the author asks for something
 * else, since a tile is a part of a whole.
 */
function shareDisplay(values: TreemapPlotState<never>['values']) {
	return { ...NumberFormat.displayOf(values), suffix: values?.suffix ?? '%' };
}

/** What the transform left on a row about its tile. */
function tileOf(row: ProcessedRow): TreemapTooltipTile {
	return {
		name: String(row[TREEMAP_ROW.name] ?? ''),
		path: (row[TREEMAP_ROW.path] as string[] | undefined) ?? [],
		value: Number(row[TREEMAP_ROW.value]),
		// The transform's share is from `0` to `1`; a tile's is a percentage.
		share: Number(row[TREEMAP_ROW.share]) * 100
	};
}

/** The edges of the tiles, as the processed rows carry them. */
function edgesOf<TData extends Record<string, unknown>>(state: TreemapPlotState<TData>) {
	const { x1, x2, y1, y2 } = state.processedData!.channels;
	return { x1, x2, y1, y2 } as unknown as Pick<RectMarkerConfig, 'x1' | 'x2' | 'y1' | 'y2'>;
}

/**
 * The tiles as one `rect` marker per series (the outermost level), each with a `label`: the name of the tile over its
 * share, fitted to it. A tile's style is its series' - the series' color, under `styles.area`, with the segments
 * keyed by the series (and `default`) - and then the segments keyed by the path of the tile, `'Tertiary.Finance'`,
 * the more specific winning. The legend's dimming goes over all of them.
 */
function buildMarks<TData extends Record<string, unknown>>(
	state: TreemapPlotState<TData>,
	ctx: TreemapPlotCtx
): AxisBasedMarkersConfig[] {
	if (!state.processedData?.data.length) return [];
	const look = ctx.cfg.treemap;
	const edges = edgesOf(state);
	const labels = state.valueLabels?.show ? state.valueLabels : undefined;
	const number = NumberFormat.of(shareDisplay(state.values), ctx.cfg, SHARE_DECIMALS);
	const shareText = (row: ProcessedRow, series: string) => {
		const { share } = tileOf(row);
		return state.values?.format ? state.values.format(share, series, row, number) : number(share);
	};

	/** The label of a series' tiles: the name over the share, fitted - or the share alone where the name does not fit. */
	const labelOf = (labels: NonNullable<typeof state.valueLabels>, series: string) => {
		const shape = labels.shapeLabel(
			ctx,
			(row) => `${tileOf(row).name}
${shareText(row, series)}`,
			{ fill: look.labelColor, fontSize: look.fontSize }
		);
		return {
			...shape,
			styles: { lineHeight: look.lineHeight, ...shape.styles },
			fit: { padding: look.padding, fallback: (row: ProcessedRow) => shareText(row, series) }
		};
	};

	return (state.processedGroups ?? []).flatMap((group) => {
		const series = group.series.name;
		const dimmed = ctx.interaction?.fillFor(series);
		const color = state.colorForSeries!(series);
		return group.visualSegments.map((segment): RectMarkerConfig => {
			/** A tile's style: the series', under the segments keyed by the path down to the tile. */
			const cache = new Map<string, BarSegmentStyle>();
			const styleOf = (row: ProcessedRow): BarSegmentStyle => {
				const path = tileOf(row).path;
				const key = path.join('.');
				let style = cache.get(key);
				if (!style) {
					// `'A.B'`, `'A.B.C'`: the first level is the series, whose segments are already in the style.
					const deeper = path.slice(1).map((_, i) => path.slice(0, i + 2).join('.'));
					style = Object.assign(
						{},
						segment.styles,
						...deeper.flatMap((deepKey) =>
							(state.segments?.[deepKey] ?? []).map((own) => own.styles ?? {})
						)
					) as BarSegmentStyle;
					cache.set(key, style);
				}
				return style;
			};
			/**
			 * A style no tile sets is left to svelteplot's own: a function of the row that gives `undefined` for a
			 * tile draws none of them.
			 */
			const used = (field: keyof BarSegmentStyle) =>
				segment.styles[field] !== undefined ||
				Object.values(state.segments ?? {}).some((own) =>
					own.some((one) => one.styles?.[field] !== undefined)
				);
			const dash = (row: ProcessedRow) => {
				const own = styleOf(row).strokeDasharray as string | undefined;
				return own === undefined ? 'none' : (DASHES[own] ?? own);
			};
			return {
				type: 'rect',
				data: segment.data,
				...edges,
				styles: {
					fill: (row: ProcessedRow) => dimmed?.fill ?? styleOf(row).fill ?? color,
					fillOpacity: (row: ProcessedRow) => dimmed?.fillOpacity ?? styleOf(row).fillOpacity ?? 1,
					stroke: (row: ProcessedRow) => styleOf(row).stroke ?? look.stroke,
					strokeWidth: (row: ProcessedRow) => styleOf(row).strokeWidth ?? look.strokeWidth,
					...(used('strokeOpacity')
						? { strokeOpacity: (row: ProcessedRow) => styleOf(row).strokeOpacity ?? 1 }
						: {}),
					...(used('strokeDasharray') ? { strokeDasharray: dash } : {}),
					...(used('borderRadius')
						? { borderRadius: (row: ProcessedRow) => styleOf(row).borderRadius ?? 0 }
						: {})
				},
				label: labels && labelOf(labels, series)
			} as unknown as RectMarkerConfig;
		});
	});
}

/**
 * TreemapPlot on the shared pipeline: its rows are the tiles of the `treemap` transform, laid out in a unit square
 * the plot's two continuous axes span (hidden). The tiles are `rect` markers, labelled by their own `label`.
 * Colors and the legend come from the outermost grouping level. Hovering a tile is hovering its row: an invisible
 * `rect` over each one drives the plot's hover, and its tooltip names the tile and gives its share.
 */
export function buildTreemapDefaults<TData extends Record<string, unknown>>(): AxisPlotDefaults<
	TreemapPlotState<TData>,
	TreemapPlotCtx
> {
	return {
		data: {
			discreteAxes: 0,
			segments: { color: (style) => style?.fill, connect: false, base: { flat: 'area' } }
		},
		scales: {
			defaults: () => ({
				x: { axisDisplay: 'none', grid: false },
				y: { axisDisplay: 'none', grid: false, reverse: true }
			}),
			fit: () => ({ x: { domain: [0, 1], fitted: true }, y: { domain: [0, 1], fitted: true } })
		},
		styles: { values: { show: true } },
		markers: { marks: buildMarks },
		hover: {
			strategy: 'punctual',
			// A tile is hovered through its own hit area, not through whichever point the pointer is nearest.
			pointMatching: 'contains',
			hitAreas: (state, hover) =>
				(hover.points as { row: ProcessedRow }[]).map(
					({ row }) =>
						({
							type: 'rect',
							data: [row],
							...edgesOf(state),
							styles: { fill: 'transparent' },
							hover: hover.active
						}) as unknown as RectMarkerConfig
				),
			format: (state) => {
				const number = NumberFormat.of(
					shareDisplay(state.values),
					getConfiguration(),
					SHARE_DECIMALS
				);
				return ((row: ProcessedRow) => {
					const tile = tileOf(row);
					return `${tile.name}: ${number(tile.share)}`;
				}) as (row: never) => string;
			},
			label: () => ((row: ProcessedRow) => tileOf(row).name) as (row: never) => string,
			context: () => ((row: ProcessedRow) => tileOf(row)) as (row: never) => unknown
		}
	};
}
