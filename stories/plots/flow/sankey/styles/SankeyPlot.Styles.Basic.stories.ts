import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import { PENGUIN_COUNTS_BY_SEX } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// How a sankey's nodes and links look: `styles.nodes` and `styles.links`. A
// node's width and the room between nodes are in px, whatever the plot's size.

const meta = {
	title: 'Plots/Flow/SankeyPlot/Styles/Basic',
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

/** `styles.nodes`: wider nodes with more room between them, and an outline. */
export const Nodes: Story = {
	args: { styles: { nodes: { width: 28, padding: 32, stroke: '#1f2937', strokeWidth: 1 } } }
};

/** `styles.links`: each link in the color of the node it reaches, more opaque, with straighter edges. */
export const Links: Story = {
	args: { styles: { links: { fill: 'target', fillOpacity: 0.7, curvature: 0.3 } } }
};

/**
 * A link's `fill` can be a function of the link and its context, so each column's links take a different end:
 * the links that leave a species take its color, and the ones that leave an island the color of the sex they reach.
 */
export const LinksByColumn: Story = {
	args: {
		styles: {
			links: { fill: (link, context) => (context.column === 'species' ? 'source' : 'target') }
		}
	}
};

/** Or every link that reaches or leaves an island takes that island's color. */
export const LinksThroughAColumn: Story = {
	args: {
		styles: {
			links: { fill: (link, context) => (context.column === 'species' ? 'target' : 'source') }
		}
	}
};

/** A link's `fill` can be a color of its own, which every link takes. */
export const LinkColor: Story = {
	args: { styles: { links: { fill: '#94a3b8' } } }
};
