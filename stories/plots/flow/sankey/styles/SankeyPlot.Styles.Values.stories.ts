import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import { PENGUIN_COUNTS_BY_SEX } from '$datasets';
import type { SankeyRowContext } from '$lib/types/plots/flow/sankey/props';

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

/** By default each node is labelled with its name and the value through it, beside it toward the plot's middle. */
export const Basic: Story = {};

/**
 * `position: 'outside'` writes the first and last columns' labels past the plot's edges, which grow to fit them,
 * so the room beside those nodes is left to the links.
 */
export const Outside: Story = {
	args: { styles: { values: { position: 'outside' } } }
};

/**
 * `styles.values.format` writes each node's value: its context has the links that reach it and the links that
 * leave it, so a label can say how many of each there are.
 */
export const LabelFormat: Story = {
	args: {
		styles: {
			values: {
				format: (value, number, context) => {
					const { incoming, outgoing } = context as SankeyRowContext;
					return `${number(value)} (${incoming.length} in, ${outgoing.length} out)`;
				}
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
				format: (value, number, context) =>
					`${number(value)} (${Math.round((context as SankeyRowContext).share!)}%)`
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
				format: (value, number, context) => {
					const { column, incoming, outgoing } = context as SankeyRowContext;
					const parts =
						column === 'species'
							? outgoing.map((link) => `${Math.round(link.sourceShare!)}% ${link.target}`)
							: column === 'island'
								? incoming.map((link) => `${Math.round(link.targetShare!)}% ${link.source}`)
								: [];
					return parts.length ? `${number(value)}: ${parts.join(', ')}` : number(value);
				}
			}
		}
	}
};

/** `styles.values.show: false` leaves the nodes unlabelled. */
export const NoLabels: Story = {
	args: { styles: { values: { show: false } } }
};
