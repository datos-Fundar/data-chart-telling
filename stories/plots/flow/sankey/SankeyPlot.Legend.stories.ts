import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import { PENGUIN_COUNTS_BY_SEX } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A sankey's legend lists what `color` names: the nodes' labels by default,
// or a value of the links'. Turning an entry off takes what it names out.

const meta = {
	title: 'Plots/Flow/SankeyPlot/Legend',
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
		legend: { control: false }
	},
	parameters: {
		docs: { source: { name: 'SankeyPlot' } }
	}
} satisfies Meta<typeof SankeyPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Click a node's label to turn it off. By default it dims, with the links it colors. */
export const InteractiveDim: Story = {
	args: { legend: { series: { interactive: { enabled: true } } } }
};

/**
 * `disabled: { mode: 'omit' }` takes a node out, with every link it is an end of, and places the rest again:
 * turn Dream off and the Chinstraps, who live only there, go with it.
 */
export const InteractiveOmit: Story = {
	args: { legend: { series: { interactive: { enabled: true, disabled: { mode: 'omit' } } } } }
};

/** `disabled: { mode: 'hide' }` makes a node and the links it colors transparent, its label included, in place. */
export const InteractiveHide: Story = {
	args: { legend: { series: { interactive: { enabled: true, disabled: { mode: 'hide' } } } } }
};

/** While the links are the series, turning a value off with `'omit'` takes its links alone: the nodes shrink. */
export const LinkSeriesOmit: Story = {
	args: {
		columns: ['species', 'island'],
		color: 'sex',
		legend: { series: { interactive: { enabled: true, disabled: { mode: 'omit' } } } }
	}
};
