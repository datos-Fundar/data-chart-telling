import { FLOW_ROW } from '$lib/plots/families/graph/arrangements/FlowArrangement';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { RowContext } from '$lib/phases/context/RowContext';
import type { ProcessedRow } from '$lib/types/phases';
import type {
	AxisBasedMarkersConfig,
	BarMarkerConfig,
	RibbonMarkerConfig,
	TextMarkerConfig
} from '$lib/types/markers/common';
import type { SankeyStylesConfig } from '$lib/types/layout/styles/sankey';
import type { SankeyRowContext } from '$lib/types/plots/flow/sankey/props';
import type { SankeyPlotState, SankeyPlotEnv } from '$lib/types/plots/flow/sankey/state';
import type { FlowEnd } from '$lib/types/plots/families/graph';
import type { Paint } from '$lib/types/plots/styling';
import { Gradient } from '$lib/markers/utils/Gradient';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type State = SankeyPlotState<any>;

/** The plot's `styles`, as a sankey reads them. */
export const stylesOf = (state: State) => (state.styles ?? {}) as SankeyStylesConfig;

/** Whether a row the arrangement produced is a node, not a link. */
export const isNode = (row: ProcessedRow) => row[FLOW_ROW.kind] === 'node';

/** What the plot knows of a node or a link, as the "context" phase left it on its row. */
export const context = (row: ProcessedRow) => RowContext.of<SankeyRowContext>(row);

/** A node's width in px. */
export const nodeWidthOf = (state: State, env: SankeyPlotEnv) =>
	stylesOf(state).nodes?.width ?? env.cfg.sankey.nodes.width;

/** The line height of a column's name, as a multiple of its font size. */
const TITLE_LINE_HEIGHT = 1.2;

/** The room at the top of the plot the columns' names take, in px: none while the columns have no names. */
export const titleRoomOf = (state: State, env: SankeyPlotEnv) =>
	state.graph?.column === undefined
		? 0
		: env.cfg.sankey.fontSize * TITLE_LINE_HEIGHT + env.cfg.sankey.labelGap;

/**
 * The plot's own marks: links under nodes, each node with its label, and the columns' names. While the nodes are
 * the series each node takes its series' color, and each link the color of the node at `styles.links.fill`'s end,
 * or a gradient from its source's to its target's; while the links are, each link takes its own and the nodes a
 * neutral fill. A series the legend dims dims its
 * nodes and links.
 */
export function buildMarks(state: State, env: SankeyPlotEnv): AxisBasedMarkersConfig[] {
	const rows = state.processedData?.data ?? [];
	if (!rows.length) return [];
	const graph = state.graph!;
	const look = env.cfg.sankey;
	const styles = stylesOf(state);
	const nodes = rows.filter(isNode);
	const links = rows.filter((row) => !isNode(row));
	const colorOf = (series: unknown) => state.colorForSeries!(String(series));
	const dimmed = (series: unknown) => env.interaction?.fillFor(String(series));

	const { fill: linkFill = 'source', curvature, ...linkStyle } = styles.links ?? {};
	/** What a link's fill names: an end whose node colors it, or a color of its own. */
	const fillOf = (row: ProcessedRow) =>
		typeof linkFill === 'function' ? linkFill(context(row)) : linkFill;
	/** The end whose node colors a link: its source's for a gradient, which starts in it. */
	const endOf = (row: ProcessedRow): FlowEnd | undefined => {
		const fill = fillOf(row);
		if (fill === 'gradient' || Gradient.is(fill)) return 'source';
		return fill === 'source' || fill === 'target' ? (fill as FlowEnd) : undefined;
	};
	/** The series of a link's node at `end` while the nodes are the series, else the link's own. */
	const seriesAt = (row: ProcessedRow, end: FlowEnd | undefined) =>
		graph.end && end ? graph.labelOf(row[FLOW_ROW[end]]) : row[SERIES_KEY];
	/** The series a link is drawn in: the label of its node at its end while the nodes are the series, else its own. */
	const linkSeries = (row: ProcessedRow) => seriesAt(row, endOf(row));
	/**
	 * What a link is painted with: its node's color at its end, a gradient between its two nodes' colors (its own
	 * color while the links are the series), a gradient of the author's with its series' color where a stop has
	 * none, or a color of its own.
	 */
	const paintOf = (row: ProcessedRow): Paint | undefined => {
		const fill = fillOf(row);
		if (fill === 'gradient')
			return graph.end
				? { gradient: [colorOf(seriesAt(row, 'source')), colorOf(seriesAt(row, 'target'))] }
				: colorOf(linkSeries(row));
		if (Gradient.is(fill)) return Gradient.tint(fill, colorOf(linkSeries(row)));
		return endOf(row) ? colorOf(linkSeries(row)) : (fill as string | undefined);
	};
	const ribbon: RibbonMarkerConfig = {
		type: 'ribbon',
		data: links,
		x1: FLOW_ROW.x1 as never,
		x2: FLOW_ROW.x2 as never,
		y1: FLOW_ROW.y1 as never,
		y2: FLOW_ROW.y2 as never,
		y3: FLOW_ROW.y3 as never,
		y4: FLOW_ROW.y4 as never,
		curvature: curvature ?? look.links.curvature,
		...(state.opacity !== undefined ? { opacity: state.opacity as never } : {}),
		styles: {
			...linkStyle,
			fill: (row: ProcessedRow) => dimmed(linkSeries(row))?.fill ?? paintOf(row)!,
			fillOpacity: (row: ProcessedRow) =>
				dimmed(linkSeries(row))?.fillOpacity ?? linkStyle.fillOpacity ?? look.links.fillOpacity
		},
		legend: false,
		hover: 'style'
	};

	/** The nodes split by series while they are the series, so each bar takes one color. */
	const groups = new Map<unknown, ProcessedRow[]>();
	for (const row of nodes) {
		const key = graph.end ? row[SERIES_KEY] : undefined;
		const group = groups.get(key) ?? groups.set(key, []).get(key)!;
		group.push(row);
	}
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const { width, padding, ...nodeStyle } = styles.nodes ?? {};
	const label = labelOf(state, env);
	const bars = [...groups].map(([series, data]): BarMarkerConfig => {
		const dim = graph.end ? dimmed(series) : undefined;
		return {
			type: 'bar',
			role: 'segment',
			data,
			x: FLOW_ROW.x as never,
			y1: FLOW_ROW.y1 as never,
			y2: FLOW_ROW.y2 as never,
			styles: {
				...nodeStyle,
				fill: dim?.fill ?? nodeStyle.fill ?? (graph.end ? colorOf(series) : look.nodes.fill),
				fillOpacity: dim?.fillOpacity ?? nodeStyle.fillOpacity ?? 1
			},
			...(label ? { label } : {})
		};
	});

	return [ribbon, ...bars, ...buildTitles(state, env)];
}

/**
 * A node's label, its bar's: its name and the value through it, side by side - over each other in its box.
 * While the nodes are the series, `color: 'series'` writes each in its node's color.
 */
function labelOf(state: State, env: SankeyPlotEnv): BarMarkerConfig['label'] {
	const labels = state.valueLabels?.show ? state.valueLabels : undefined;
	if (!labels) return undefined;
	const between = labels.layout === 'box' ? '\n' : ' ';
	const graph = state.graph;
	return labels.label(env, (row) => `${context(row).name}${between}${labels.text(row)}`, {
		fontSize: env.cfg.sankey.fontSize,
		...(graph?.end
			? { seriesColor: (row: ProcessedRow) => state.colorForSeries!(String(row[SERIES_KEY])) }
			: {})
	});
}

/**
 * The name of each column over it, when the nodes stand in named columns, in the room the y scale keeps for them
 * above its values: the first one starts at its left edge and the last one ends at its right, so neither leaves
 * the plot.
 */
function buildTitles(state: State, env: SankeyPlotEnv): TextMarkerConfig[] {
	const columns = (state.processedData?.options.columns as string[] | undefined) ?? [];
	if (state.graph?.column === undefined || !columns.length) return [];
	const look = env.cfg.sankey;
	const half = nodeWidthOf(state, env) / 2;
	const first = columns[0];
	const last = columns.at(-1);
	const sideOf = (column: string) =>
		columns.length === 1
			? 'middle'
			: column === first
				? 'start'
				: column === last
					? 'end'
					: 'middle';
	const shift = { start: -half, middle: 0, end: half } as const;
	const room = Number(state.scales.y?.domain?.[0] ?? 0);
	return [
		{
			type: 'text',
			data: columns.map((column) => ({ column })),
			x: 'column',
			y: () => room / 2,
			text: 'column',
			lineAnchor: 'middle',
			dy: -look.labelGap / 2,
			dx: (row: { column: string }) => shift[sideOf(row.column)],
			textAnchor: (row: { column: string }) => sideOf(row.column),
			styles: { fontSize: look.fontSize, fontWeight: 'bold' }
		} as TextMarkerConfig
	];
}
