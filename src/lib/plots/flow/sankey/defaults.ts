import { FLOW_ROW } from '$lib/plots/families/graph/arrangements/FlowArrangement';
import { FlowGraph, GRAPH_NODE } from '$lib/plots/families/graph/FlowGraph';
import { buildMarks, context, isNode, nodeWidthOf, stylesOf } from '$lib/plots/flow/sankey/markers';
import { buildGraphDefaults } from '$lib/plots/families/graph/defaults';
import { SERIES_ID_KEY, SERIES_KEY } from '$lib/phases/transforms/TransformsPhase';
import { Margins } from '$lib/layout/margins/Margins';
import { NumberFormat } from '$lib/utils/NumberFormat';
import { getConfiguration } from '$lib/configuration/config.svelte';
import type { AxisPlotDefaults, ProcessedRow, Transform } from '$lib/types/phases';
import type { AxisFit } from '$lib/types/phases/scales/phase';
import type { FlowArrangement } from '$lib/types/arrangements/flow';
import type { SankeyRowContext } from '$lib/types/plots/flow/sankey/props';
import type { SankeyPlotState, SankeyPlotEnv } from '$lib/types/plots/flow/sankey/state';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type State = SankeyPlotState<any>;

/** A part of a whole, from `0` to `100`; `0` of nothing. */
const shareOf = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);

/**
 * What a sankey knows of a node or a link, as the arrangement left it on its row: a node's share of its column,
 * and its links' own contexts; a link's share of what leaves its source and of what reaches its target.
 */
function contextOf(state: State): (row: ProcessedRow) => Omit<SankeyRowContext, 'series' | 'row'> {
	const graph = state.graph!;
	const nodes = (state.processedData?.data ?? []).filter(isNode);
	const valueOf = new Map(nodes.map((node) => [node[FLOW_ROW.node], Number(node[FLOW_ROW.value])]));
	const columnTotals = new Map<unknown, number>();
	for (const node of nodes) {
		const column = node[FLOW_ROW.x];
		columnTotals.set(column, (columnTotals.get(column) ?? 0) + Number(node[FLOW_ROW.value]));
	}
	const linkOf = (row: ProcessedRow): Omit<SankeyRowContext, 'series' | 'row'> => {
		const value = Number(row[FLOW_ROW.value]);
		const source = graph.labelOf(row[FLOW_ROW.source]);
		const target = graph.labelOf(row[FLOW_ROW.target]);
		return {
			kind: 'link',
			name: `${source} - ${target}`,
			source,
			target,
			column: String(row[FLOW_ROW.x1]),
			value,
			sourceShare: shareOf(value, valueOf.get(row[FLOW_ROW.source]) ?? 0),
			targetShare: shareOf(value, valueOf.get(row[FLOW_ROW.target]) ?? 0),
			start: {
				column: String(row[FLOW_ROW.x1]),
				y: (Number(row[FLOW_ROW.y1]) + Number(row[FLOW_ROW.y2])) / 2
			},
			end: {
				column: String(row[FLOW_ROW.x2]),
				y: (Number(row[FLOW_ROW.y3]) + Number(row[FLOW_ROW.y4])) / 2
			},
			incoming: [],
			outgoing: [],
			x: row[FLOW_ROW.x1],
			y: undefined
		};
	};
	const linksOf = (links: unknown) =>
		((links as ProcessedRow[] | undefined) ?? []).map(
			(link) => ({ ...linkOf(link), row: link }) as SankeyRowContext
		);
	return (row) => {
		if (!isNode(row)) return linkOf(row);
		const value = Number(row[FLOW_ROW.value]);
		const name = graph.labelOf(row[FLOW_ROW.node]);
		return {
			kind: 'node',
			name,
			source: name,
			target: name,
			column: String(row[FLOW_ROW.x]),
			value,
			share: shareOf(value, columnTotals.get(row[FLOW_ROW.x]) ?? 0),
			incoming: linksOf(row[FLOW_ROW.incoming]),
			outgoing: linksOf(row[FLOW_ROW.outgoing]),
			x: row[FLOW_ROW.x],
			y: undefined
		};
	};
}

/**
 * The plot's nodes and links: a `flow` arrangement of its links, with its nodes tagged with their series while
 * they are the series, its gap between nodes the px `styles.nodes.padding` as a share of the plot's height, and
 * the author's `styles.arrangement`. A node the legend omits takes every link it is an end of with it. The
 * author's own transforms run after it in order.
 */
function buildTransforms(state: State, env: SankeyPlotEnv): Transform[] {
	const graph = state.graph!;
	const look = env.cfg.sankey;
	const styles = stylesOf(state);
	const box = Margins.resolve({ ...env.cfg.margins, ...state.margins }).contentBox(
		state.width,
		state.height
	);
	const padding = styles.nodes?.padding ?? look.nodes.padding;
	const omitted =
		graph.end && state.removedSeries?.mode === 'omit'
			? new Set(state.removedSeries.series.map((series) => series.name))
			: undefined;
	const kept: Transform[] = omitted?.size
		? [
				{
					type: 'filter',
					filter: (link: Record<string, unknown>) =>
						!omitted.has(graph.labelOf(graph.source(link))) &&
						!omitted.has(graph.labelOf(graph.target(link)))
				}
			]
		: [];
	const nodes = graph.end
		? graph.nodes.map((node) => {
				const label = node[GRAPH_NODE.label];
				return { ...node, [SERIES_KEY]: label, [SERIES_ID_KEY]: label };
			})
		: graph.nodes;
	const flow = {
		type: 'flow',
		source: graph.source,
		target: graph.target,
		value: graph.value,
		nodes,
		id: GRAPH_NODE.id as never,
		column: graph.column as never,
		...(box.height > 0 ? { spacing: padding / box.height } : {}),
		...styles.arrangement
	} as FlowArrangement;
	return [...kept, flow, ...(state.transforms ?? [])];
}

/**
 * The columns as a band scale whose bands are the nodes' px width, the first at the left edge and the last at
 * the right, and the values on y from the top down: whatever the author's `scales` leave unset.
 */
function buildFit(state: State, env: SankeyPlotEnv): Partial<Record<'x' | 'y', AxisFit>> {
	const options = state.processedData?.options ?? {};
	const columns = (options.columns as string[] | undefined) ?? [];
	const height = Number(options.height);
	const box = Margins.resolve({ ...env.cfg.margins, ...state.margins }).contentBox(
		state.width,
		state.height
	);
	const width = Math.min(nodeWidthOf(state, env), box.width);
	const count = columns.length;
	const padding =
		count > 1 && box.width > width
			? { paddingInner: (box.width - width * count) / (box.width - width), paddingOuter: 0 }
			: { paddingInner: 0, paddingOuter: width > 0 ? (box.width / width - 1) / 2 : 0 };
	const author = state.scales;
	const own = <T extends object>(given: object | undefined, fit: T): T =>
		Object.fromEntries(
			Object.entries(fit).filter(([key]) => (given as Record<string, unknown>)?.[key] === undefined)
		) as T;
	return {
		x: {
			...own(author.x, { type: 'band', domain: columns, ...padding }),
			fitted: true
		} as AxisFit,
		y: {
			...own(author.y, { domain: [0, Number.isFinite(height) && height > 0 ? height : 1] }),
			fitted: true
		} as AxisFit
	};
}

/**
 * The plot's rows as its graph's links, as its timeline and facet sliced them: its own links, or the ones its
 * table's `columns` make, kept apart by every field the plot reads off them - its `color`, `opacity` and
 * `grouping`, and its facet's. `color` comes back as what it reads off a link, and `grouping` is spent on the
 * links, so neither splits the rows any further.
 */
function prepare(state: State): State {
	const facet = state.facet as { by?: unknown; rows?: unknown; cols?: unknown } | undefined;
	const graph = FlowGraph.of(
		(state.data ?? []) as Record<string, unknown>[],
		{
			from: state.from,
			to: state.to,
			value: state.value,
			nodes: state.nodes,
			columns: state.columns,
			reads: [state.color, state.opacity, state.grouping, facet?.by, facet?.rows, facet?.cols]
		},
		state.color as never
	);
	return { ...state, data: graph.links, color: graph.color, grouping: undefined, graph } as State;
}

/**
 * SankeyPlot, a graph kind: its rows are its links, laid out with their nodes by a `flow` arrangement in named
 * columns on x and in their own units on y. Its series are what `color` names: the nodes' labels, or a value of
 * the links'. The nodes are `bar` markers, the links one `ribbon` marker, and each node is labelled beside it.
 */
export function buildSankeyDefaults<TLink extends Record<string, unknown>>(): AxisPlotDefaults<
	SankeyPlotState<TLink>,
	SankeyPlotEnv
> {
	return buildGraphDefaults<SankeyPlotState<TLink>, SankeyPlotEnv>({
		seed: ({ from, to, nodes, columns }) => ({ from, to, nodes, columns }) as never,
		data: {
			prepare: prepare as never,
			discreteAxes: 0,
			segments: { color: (style) => style?.fill, connect: false, base: { flat: 'area' } },
			// While the nodes are the series, every label is one, in the nodes' order. A label no link is drawn in
			// holds its node rows instead, so the legend lists it; the arrangement takes them for no link.
			orderSeries: (series, state) => {
				const graph = state.graph;
				if (!graph?.end) return series;
				const byName = new Map(series.map((s) => [s.name, s]));
				return graph.labels.map(
					(label) =>
						byName.get(label) ?? {
							name: label,
							data: graph.nodes.filter((node) => node[GRAPH_NODE.label] === label)
						}
				);
			}
		},
		transforms: { transforms: buildTransforms },
		context: (state) => contextOf(state) as (row: never) => object,
		scales: {
			defaults: () => ({ y: { reverse: true } }),
			fit: buildFit
		},
		markers: { marks: buildMarks },
		hover: {
			shape: (_state, row) =>
				isNode(row)
					? {
							type: 'bar',
							role: 'segment',
							x: FLOW_ROW.x,
							y1: FLOW_ROW.y1,
							y2: FLOW_ROW.y2
						}
					: {
							type: 'ribbon',
							x1: FLOW_ROW.x1,
							x2: FLOW_ROW.x2,
							y1: FLOW_ROW.y1,
							y2: FLOW_ROW.y2,
							y3: FLOW_ROW.y3,
							y4: FLOW_ROW.y4
						},
			format: (state) => {
				const number = NumberFormat.of(NumberFormat.displayOf(state.values), getConfiguration());
				return ((row: ProcessedRow) => {
					const own = context(row);
					return `${own.name}: ${number(own.value!)}`;
				}) as (row: never) => string;
			},
			label: () => ((row: ProcessedRow) => context(row).name) as (row: never) => string
		}
	});
}
