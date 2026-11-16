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
			links: { fill: (link) => (link.column === 'species' ? 'source' : 'target') }
		}
	}
};

/** Or every link that reaches or leaves an island takes that island's color. */
export const LinksThroughAColumn: Story = {
	args: {
		styles: {
			links: { fill: (link) => (link.column === 'species' ? 'target' : 'source') }
		}
	}
};

/** A link's `fill` can be a color of its own, which every link takes. */
export const LinkColor: Story = {
	args: { styles: { links: { fill: '#94a3b8' } } }
};

// ── Gradients ─────────────────────────────────────────────────────────────────

/** `fill: 'gradient'`: each link runs from the color of the node it leaves to the color of the node it reaches. */
export const LinksGradient: Story = {
	args: { styles: { links: { fill: 'gradient' } } }
};

/**
 * A gradient of its own: a stop with no color takes the link's series' color, so each link fades out from the
 * node it leaves.
 */
export const LinksFading: Story = {
	args: {
		styles: { links: { fill: { gradient: [{ opacity: 1 }, { opacity: 0.15 }] }, fillOpacity: 0.8 } }
	}
};

/**
 * `span: 'plot'` measures a gradient across the whole plot, so a path through several columns keeps one gradient
 * from end to end.
 */
export const LinksAcrossThePlot: Story = {
	args: {
		styles: {
			links: { fill: { gradient: ['#0ea5e9', '#a855f7', '#f97316'], span: 'plot' } }
		}
	}
};

/** The function can return a gradient too: the links that leave a species run to the island they reach. */
export const LinksGradientByColumn: Story = {
	args: {
		styles: {
			links: { fill: (link) => (link.column === 'species' ? 'gradient' : 'source') }
		}
	}
};
