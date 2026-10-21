import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import { HEIGHTS } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The domains of a density plot come from what its curves draw: `x` covers the
// estimate's points, and `y` runs from zero up to the highest density. Pinning
// a domain keeps it as written, and anything outside it is clipped.

const meta = {
	title: 'Plots/Distribution/DensityPlot/Scales',
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
		scales: {
			description: 'Axis scales; a pinned `domain` replaces the one the curves derive.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'DensityPlot' } }
	}
} satisfies Meta<typeof DensityPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Both domains derived: `x` covers the estimate's points, `y` runs from zero to the highest density. */
export const Derived: Story = {};

/** A pinned `x` domain: the part of the curves outside 140 to 170 is clipped rather than widening the axis. */
export const PinnedX: Story = {
	args: {
		scales: { x: { domain: [140, 170], label: 'Height (cm)' } }
	}
};

/** A pinned `y` domain, plus a label. */
export const PinnedY: Story = {
	args: {
		scales: { y: { domain: [0, 0.1], label: 'Density' } }
	}
};
