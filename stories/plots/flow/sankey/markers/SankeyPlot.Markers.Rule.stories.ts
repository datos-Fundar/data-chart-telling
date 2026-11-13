import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SankeyPlot from '$lib/plots/flow/sankey/Plot.svelte';
import { PENGUIN_COUNTS_BY_SEX } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A sankey's columns are the categories of its x axis, so an author's marker
// can stand on one by name.

const meta = {
	title: 'Plots/Flow/SankeyPlot/Markers/Rule',
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
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'SankeyPlot' } }
	}
} satisfies Meta<typeof SankeyPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** A dashed `rule` through the middle of the island column. */
export const OnAColumn: Story = {
	args: {
		markers: [
			{
				type: 'rule',
				axis: 'x',
				value: 'island',
				styles: { stroke: '#1f2937', strokeDasharray: '6 4', strokeWidth: 1 }
			}
		]
	}
};
