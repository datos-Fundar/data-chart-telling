import { FLOW_ROW } from '$lib/plots/families/graph/arrangements/FlowArrangement';
import { SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { RowContext } from '$lib/phases/context/RowContext';
import { NumberFormat } from '$lib/utils/NumberFormat';
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

/**
 * The plot's own marks, links under nodes under labels. While the nodes are the series each node takes its
 * series' color, and each link the color of the node at `styles.links.fill`'s end; while the links are, each link
 * takes its own and the nodes a neutral fill. A series the legend dims dims its nodes and links.
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
		typeof linkFill === 'function' ? linkFill(row, context(row)) : linkFill;
	const endOf = (row: ProcessedRow): FlowEnd | undefined => {
		const fill = fillOf(row);
		return fill === 'source' || fill === 'target' ? (fill as FlowEnd) : undefined;
	};
	/** The series a link is drawn in: the label of its node at its end while the nodes are the series, else its own. */
	const linkSeries = (row: ProcessedRow) => {
		const end = endOf(row);
		return graph.end && end ? graph.labelOf(row[FLOW_ROW[end]]) : row[SERIES_KEY];
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
			fill: (row: ProcessedRow) =>
				dimmed(linkSeries(row))?.fill ?? (endOf(row) ? colorOf(linkSeries(row)) : fillOf(row)),
			fillOpacity: (row: ProcessedRow) =>
				dimmed(linkSeries(row))?.fillOpacity ?? linkStyle.fillOpacity ?? look.links.fillOpacity
		},
		legend: false
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
			}
		};
	});

	return [ribbon, ...bars, ...buildLabels(state, env, nodes), ...buildTitles(state, env)];
}

/**
 * A label beside each node: its name and the value through it. With `position: 'auto'` it sits on the side away
 * from the plot's edge - right of every column but the last, left of the last one; with `'outside'` the first
 * column's sit left of it and the last one's right, past the plot's edges, which grow to fit them.
 */
function buildLabels(state: State, env: SankeyPlotEnv, nodes: ProcessedRow[]): TextMarkerConfig[] {
	const values = state.values;
	if (values?.show === false || !nodes.length) return [];
	const look = env.cfg.sankey;
	const columns = (state.processedData?.options.columns as string[] | undefined) ?? [];
	const [first, last] = [columns[0], columns.at(-1)];
	const reach = nodeWidthOf(state, env) / 2 + look.labelGap;
	const outside = (stylesOf(state).values?.position ?? 'auto') === 'outside';
	/** Whether a node's label sits left of it: the last column's, or with `'outside'` the first column's. */
	const isLeft = (row: ProcessedRow) =>
		columns.length > 1 && row[FLOW_ROW.x] === (outside ? first : last);
	const number = NumberFormat.of(NumberFormat.displayOf(values), env.cfg);
	const graph = state.graph;
	const colorOf = (series: unknown) => state.colorForSeries!(String(series));
	const text = (row: ProcessedRow) => {
		const own = context(row);
		const value = values?.format ? values.format(own.value!, number, own) : number(own.value!);
		return `${own.name} ${value}`;
	};
	return [
		{
			type: 'text',
			data: nodes,
			x: FLOW_ROW.x as never,
			y: FLOW_ROW.y as never,
			text,
			dx: (row: ProcessedRow) => (isLeft(row) ? -reach : reach),
			textAnchor: (row: ProcessedRow) => (isLeft(row) ? 'end' : 'start'),
			lineAnchor: 'middle',
			...(outside ? { fitMargins: true } : {}),
			styles: {
				fontSize: look.fontSize,
				...(values?.color === 'series' && graph?.end
					? { fill: (row: ProcessedRow) => colorOf(row[SERIES_KEY]) }
					: values?.color
						? { fill: values.color }
						: {}),
				// A node the legend hides takes its label with it.
				...(graph?.end
					? {
							fillOpacity: (row: ProcessedRow) =>
								env.interaction?.fillFor(String(row[SERIES_KEY]))?.fillOpacity === 0 ? 0 : undefined
						}
					: {}),
				...values?.fontStyle
			}
		} as TextMarkerConfig
	];
}

/**
 * The name of each column over it, when the nodes stand in named columns: the first one starts at its left edge
 * and the last one ends at its right, so neither leaves the plot. The plot's top margin grows to fit them.
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
	return [
		{
			type: 'text',
			data: columns.map((column) => ({ column })),
			x: 'column',
			text: 'column',
			frameAnchor: 'top',
			lineAnchor: 'bottom',
			dy: -look.labelGap,
			dx: (row: { column: string }) => shift[sideOf(row.column)],
			textAnchor: (row: { column: string }) => sideOf(row.column),
			fitMargins: true,
			styles: { fontSize: look.fontSize, fontWeight: 'bold' }
		} as TextMarkerConfig
	];
}
