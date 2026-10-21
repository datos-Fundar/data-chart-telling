import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import { HEIGHTS } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Hovering a density plot reads the curve at the pointer: the value along the
// estimated axis and its density. `tooltip` turns it on and sets its anchor and
// strategy, the same way it does for the other plots.

const meta = {
	title: 'Plots/Distribution/DensityPlot/Tooltip',
	component: DensityPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHTS,
		x: 'height'
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 500, step: 50 }
		},
		tooltip: {
			description: 'Tooltip runtime configuration.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'DensityPlot' } }
	}
} satisfies Meta<typeof DensityPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The value under the pointer and the curve's density there. */
const TOOLTIP = {
	sync: false,
	format: (row: Record<string, unknown>) =>
		`${Number(row.x).toFixed(1)}: ${Number(row.y).toFixed(3)}`
};

/** A tooltip along the curve: hover to read its density. */
export const Default: Story = {
	args: {
		tooltip: TOOLTIP
	}
};

/** Grouped, each group has its own curve. */
export const Grouped: Story = {
	args: {
		grouping: 'group',
		tooltip: TOOLTIP
	}
};
