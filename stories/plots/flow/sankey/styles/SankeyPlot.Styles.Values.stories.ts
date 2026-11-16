import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import { PENGUIN_COUNTS_BY_SEX } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A sankey's node labels: `styles.values` says where they sit and what they
// write, from what the plot knows of each node - its value, its share of its
// column, and its links with their own shares.

const meta = {
	title: 'Plots/Flow/SankeyPlot/Styles/Values',
	component: SankeyPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: PENGUIN_COUNTS_BY_SEX,
		columns: ['species', 'island', 'sex'],
		value: 'count'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		columns: { control: false },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'SankeyPlot' } }
	}
} satisfies Meta<typeof SankeyPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * By default each node is labelled with its name and the value through it, beside it toward the plot's middle:
 * `layout: 'path'` along its `'inner'` edge, `side: 'outside'`.
 */
export const Basic: Story = {};

/**
 * A node's label is its bar's, so it takes a bar's layouts. `edge: 'outer'` writes it on the side facing away
 * from the plot's middle: the first and last columns' sit past the plot's edges, which grow to fit them, and
 * leave the room beside those nodes to the links.
 */
export const Outer: Story = {
	args: { styles: { values: { layout: 'path', edge: 'outer' } } }
};

/** `layout: 'box'` writes each label in its node, its name over its value: here the nodes are wide enough. */
export const InsideWideNodes: Story = {
	args: {
		styles: {
			nodes: { width: 90 },
			values: { layout: 'box' }
		}
	}
};

/** `side: 'inside'` writes it in its node, against the edge facing the plot's middle. */
export const AgainstTheInnerEdge: Story = {
	args: {
		styles: {
			nodes: { width: 80 },
			values: { layout: 'path', edge: 'inner', side: 'inside' }
		}
	}
};

/** A `fontStyle.rotate` of `-90` writes it up the middle of its node, along it. */
export const Vertical: Story = {
	args: {
		styles: {
			nodes: { width: 40 },
			values: { layout: 'box', fontStyle: { rotate: -90 } }
		}
	}
};

/**
 * `color: 'series'` writes each label in its node's color: past the plot's edges here, off the links. The middle
 * column's still cross the links: a white stroke painted under the text (`paintOrder: 'stroke'`) keeps them apart.
 */
export const SeriesColor: Story = {
	args: {
		styles: {
			values: {
				layout: 'path',
				edge: 'outer',
				color: 'series',
				fontStyle: { fontWeight: 600, stroke: 'white', strokeWidth: 3, paintOrder: 'stroke' }
			}
		}
	}
};

/**
 * `styles.values.format` writes each node's value: its context has the links that reach it and the links that
 * leave it, so a label can say how many of each there are.
 */
export const LabelFormat: Story = {
	args: {
		styles: {
			values: {
				format: (context, number) =>
					`${number(context.value)} (${context.incoming.length} in, ${context.outgoing.length} out)`
			}
		}
	}
};

/**
 * `styles.values.format` writes each node's value: its context has its share of its column, so a label can say
 * how much of the colony each species, island or sex is.
 */
export const ColumnShares: Story = {
	args: {
		styles: {
			values: {
				format: (context, number) => `${number(context.value)} (${Math.round(context.share!)}%)`
			}
		}
	}
};

/**
 * A node's context has its links too, each with its share of the node it leaves (`sourceShare`) and of the node
 * it reaches (`targetShare`): here each species says where its penguins live, and each island who lives on it -
 * a third of the Adelies live on Torgersen, and they are all of its penguins.
 */
export const LinkShares: Story = {
	args: {
		styles: {
			values: {
				format: (context, number) => {
					const parts =
						context.column === 'species'
							? context.outgoing.map((link) => `${Math.round(link.sourceShare!)}% ${link.target}`)
							: context.column === 'island'
								? context.incoming.map((link) => `${Math.round(link.targetShare!)}% ${link.source}`)
								: [];
					return parts.length
						? `${number(context.value)}: ${parts.join(', ')}`
						: number(context.value);
				}
			}
		}
	}
};

/** `styles.values.show: false` leaves the nodes unlabelled. */
export const NoLabels: Story = {
	args: { styles: { values: { show: false } } }
};
