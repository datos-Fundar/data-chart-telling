import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import { PENGUIN_COUNTS_BY_SEX } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// How a sankey places its nodes: `styles.arrangement` orders its columns, and
// the nodes within each.

const meta = {
	title: 'Plots/Flow/SankeyPlot/Styles/Arrangement',
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

/** By default (`order: 'auto'`) the nodes of each column move to where their links pull them, so fewer cross. */
export const Auto: Story = {};

/** `order: 'input'` keeps the nodes of each column in the order they come in: here, as the table lists them. */
export const InputOrder: Story = {
	args: { styles: { arrangement: { order: 'input' } } }
};

/** `columns` puts the columns in an order of its own: here the sexes first, the species last. */
export const Columns: Story = {
	args: { styles: { arrangement: { columns: ['sex', 'island', 'species'] } } }
};
