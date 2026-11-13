import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import { PENGUIN_COUNTS_BY_SEX } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A sankey of the penguins of Palmer Station: how many of each species live on
// each island, and how many of those are female or male. Its `data` is a graph
// of links, or a table and the `columns` the plot makes one of.

const meta = {
	title: 'Plots/Flow/SankeyPlot/Series',
	component: SankeyPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		columns: { control: false },
		color: { control: false }
	},
	parameters: {
		docs: { source: { name: 'SankeyPlot' } }
	}
} satisfies Meta<typeof SankeyPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The penguins as bare links, summed by hand: one from each species to each island it lives on, and one from
 * each island to each sex, as many penguins as each carries.
 */
const LINKS = (() => {
	const sums = new Map<string, { source: string; target: string; value: number }>();
	const add = (source: string, target: string, value: number) => {
		const key = `${source}>${target}`;
		const link = sums.get(key) ?? sums.set(key, { source, target, value: 0 }).get(key)!;
		link.value += value;
	};
	for (const row of PENGUIN_COUNTS_BY_SEX) {
		add(row.species, row.island, row.count);
		add(row.island, row.sex, row.count);
	}
	return [...sums.values()];
})();

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The simplest graph: links alone, each naming the nodes it joins by id and how many penguins it carries. Every
 * id is a node, labelled by it, and without a `column` each node stands in the column of its depth - how many
 * links lead to it from a node nothing flows into. The nodes are the series: each takes a color, and each link
 * the color of the node it leaves.
 */
export const LinksOnly: Story = {
	args: { data: LINKS }
};

/**
 * A table and its `columns`, left to right: a node per value of each, standing in the column it comes from, which
 * is written over it, and a link between the values of each two neighbouring columns that share rows, as thick
 * as their summed `value`.
 */
export const Columns: Story = {
	args: { data: PENGUIN_COUNTS_BY_SEX, columns: ['species', 'island', 'sex'], value: 'count' }
};

/**
 * `grouping` keeps the links of each of its values apart, in the color of the nodes all the same: each species
 * reaches each island in two links, its females' and its males', told apart here by a white edge.
 */
export const Grouping: Story = {
	args: {
		data: PENGUIN_COUNTS_BY_SEX,
		columns: ['species', 'island'],
		value: 'count',
		grouping: 'sex',
		styles: { links: { stroke: 'white', strokeWidth: 1 } }
	}
};

/** `color: 'target'` makes the series the nodes the links reach, and `styles.links.fill: 'target'` colors each link by it. */
export const TargetColor: Story = {
	args: {
		data: PENGUIN_COUNTS_BY_SEX,
		columns: ['species', 'island', 'sex'],
		value: 'count',
		color: 'target',
		styles: { links: { fill: 'target' } }
	}
};

/**
 * `color` naming a field of the table makes the links the series: its links stay apart by it, so here each sex
 * is a link of its own between a species and an island, in its own color across the plot, and the nodes are
 * drawn in a neutral gray.
 */
export const LinkColor: Story = {
	args: {
		data: PENGUIN_COUNTS_BY_SEX,
		columns: ['species', 'island'],
		value: 'count',
		color: 'sex'
	}
};

/**
 * `opacity` fades each link by a field of its own: here how many penguins it carries, its summed `count`, which
 * the legend shows.
 */
export const Opacity: Story = {
	args: {
		data: PENGUIN_COUNTS_BY_SEX,
		columns: ['species', 'island'],
		value: 'count',
		color: 'sex',
		opacity: 'count'
	}
};
