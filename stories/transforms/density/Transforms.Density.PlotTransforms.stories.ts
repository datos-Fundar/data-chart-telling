import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/area/Plot.svelte';
import { MEASUREMENTS } from '../../data/measurements';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A plot's own `transforms` run over every series' rows before the plot draws
// them, so a `densityX` there turns an `AreaPlot` into a density plot: one curve
// per series, each estimated from its own rows. The plot's `y` is replaced by
// the density, so any field will do. The `density` statistic is the same
// transform, drawn as an extra marker over a plot's own marks instead.

const meta = {
	title: 'Transforms/Density/Plot transforms',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: MEASUREMENTS,
		x: 'value',
		y: 'value',
		scales: { y: { label: 'Density' } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		transforms: { control: false }
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single series: the plot draws the estimate of every row's `value`. */
export const SingleSeries: Story = {
	args: {
		transforms: [{ type: 'densityX' }]
	}
};

/** `color` splits the rows into series, and the transform estimates each one on its own, with its own legend entry. */
export const PerSeries: Story = {
	args: {
		color: 'group',
		transforms: [{ type: 'densityX', bandwidth: 2.5 }]
	}
};

/** Followed by a `stackY`, the series' curves stack: the top edge is the density of both groups together. */
export const Stacked: Story = {
	args: {
		color: 'group',
		transforms: [{ type: 'densityX', bandwidth: 2.5 }, { type: 'stackY' }]
	}
};
