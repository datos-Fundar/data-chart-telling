import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import { HEIGHTS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The estimate is a `densityX` (or `densityY`) transform. One given in
// `transforms` is merged over the default, so its `kernel`, `bandwidth` and
// the rest win.

const meta = {
	title: 'Plots/Distribution/DensityPlot/Estimate',
	component: DensityPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHTS,
		x: 'height',
		grouping: 'group'
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
		transforms: { control: false }
	},
	parameters: {
		docs: { source: { name: 'DensityPlot' } }
	}
} satisfies Meta<typeof DensityPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Silverman's rule picks the bandwidth from the data when none is given. */
export const Default: Story = {};

/** A small `bandwidth` follows the data closely, leaving a bump per cluster. */
export const NarrowBandwidth: Story = {
	args: {
		transforms: [{ type: 'densityX', bandwidth: 1 }]
	}
};

/** A large `bandwidth` smooths the groups into single broad hills. */
export const WideBandwidth: Story = {
	args: {
		transforms: [{ type: 'densityX', bandwidth: 8 }]
	}
};

/** `kernel` picks the shape each row spreads into. */
export const Kernel: Story = {
	args: {
		transforms: [{ type: 'densityX', kernel: 'gaussian' }]
	}
};

/** `trim` keeps each curve within its data's own extent, instead of letting it fade out past it. */
export const Trimmed: Story = {
	args: {
		transforms: [{ type: 'densityX', trim: true }]
	}
};
