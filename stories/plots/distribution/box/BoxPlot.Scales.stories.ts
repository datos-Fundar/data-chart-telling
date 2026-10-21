import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { BUENOS_AIRES_TRIPS } from '../../../data/commute-times';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The value axis fits the values without reaching for zero, and the category
// axis lays the boxes out in bands, in the order the data gives them unless a
// `domain` orders them.

const meta = {
	title: 'Plots/Distribution/BoxPlot/Scales',
	component: BoxPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: BUENOS_AIRES_TRIPS,
		x: 'mode',
		y: 'minutes',
		color: 'mode'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		scales: {
			description: 'Per-axis scale configuration.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'BoxPlot' } }
	}
} satisfies Meta<typeof BoxPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Axis labels replace the field names. */
export const Labels: Story = {
	args: {
		scales: {
			x: { label: 'Mode of transport' },
			y: { label: 'One-way trip (minutes)' }
		} satisfies AxisBasedScalesConfig
	}
};

/** A `domain` on the category axis orders the boxes: here from the slowest to the fastest mode. */
export const CategoryOrder: Story = {
	args: {
		scales: {
			x: { domain: ['Walk', 'Bike', 'Car', 'Bus', 'Train'] }
		} satisfies AxisBasedScalesConfig
	}
};

/** A pinned `y` domain from zero shows each box against the full trip length. */
export const FromZero: Story = {
	args: {
		scales: {
			y: { domain: [0, 160] }
		} satisfies AxisBasedScalesConfig
	}
};

/** `paddingInner` widens or narrows the boxes: the gap between neighbouring bands, as a fraction of each. */
export const BoxWidth: Story = {
	args: {
		scales: {
			x: { paddingInner: 0.1 }
		} satisfies AxisBasedScalesConfig
	}
};
