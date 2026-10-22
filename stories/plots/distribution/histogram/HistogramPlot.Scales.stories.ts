import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import { HEIGHTS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The domains of a histogram come from what its bins draw: `x` covers every bin
// edge, and `y` runs from zero up to the tallest bin. Pinning a domain keeps it
// as written, and anything outside it is clipped.

const meta = {
	title: 'Plots/Distribution/HistogramPlot/Scales',
	component: HistogramPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHTS,
		x: 'height',
		grouping: 'group',
		transforms: [{ type: 'binX', thresholds: 10 }]
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
			description: 'Axis scales; a pinned `domain` replaces the one the bins derive.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'HistogramPlot' } }
	}
} satisfies Meta<typeof HistogramPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Both domains derived: `x` covers the bins' edges, `y` runs from zero to the tallest bin. */
export const Derived: Story = {};

/** A pinned `x` domain: the bins outside 145 to 175 are clipped rather than widening the axis. */
export const PinnedX: Story = {
	args: {
		scales: { x: { domain: [145, 175], label: 'Height (cm)' } }
	}
};

/** A pinned `y` domain, plus a label: the count axis stays at 0 to 40 whatever the bins are. */
export const PinnedY: Story = {
	args: {
		scales: { y: { domain: [0, 40], label: 'Rows per bin' } }
	}
};
