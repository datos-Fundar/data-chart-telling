import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import type { AxisPlotState, AxisPlotEnv } from '$lib/types/phases';
import type { FlowGraph } from '$lib/plots/families/graph/FlowGraph';
import type { Accessor } from '$lib/types/layout/mapping';
import type { GraphNodes } from '$lib/types/plots/data/graph';

/** SankeyPlot's pipeline state: the shared axis-based state over its links, with the graph they belong to. */
export type SankeyPlotState<TLink extends Record<string, unknown>> = AxisPlotState<
	TLink,
	BarSegmentStyle
> & {
	/** How a link names the node it leaves and the node it reaches, and the nodes when given. */
	from?: Accessor<TLink, unknown>;
	to?: Accessor<TLink, unknown>;
	nodes?: GraphNodes;
	/** A table's columns, when the rows are a table's and not the links themselves. */
	columns?: string[];
	/** "data" phase output: the graph the rows make. */
	graph?: FlowGraph;
};

/** The environment every SankeyPlot phase reads from, alongside the growing state. */
export type SankeyPlotEnv = AxisPlotEnv;
