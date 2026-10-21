import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { HEIGHTS, type HeightRow } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A density plot smooths the rows of each series on `x` into a kernel density
// estimate - or on `y`, when that's the only channel given, for a horizontal curve.
// Flat `data` is one curve; `grouping` (or `color`) splits it into one curve per
// group, drawn in each group's color. A pre-built `series` array does the same
// without grouping.

const meta = {
	title: 'Plots/Distribution/DensityPlot/Series',
	component: DensityPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400
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
		series: {
			description: 'Data series to estimate; each one gets its own curve.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		},
		transforms: {
			description:
				'svelteplot transforms run on every curve. A `densityX` here is merged over the default one, its own props winning.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'DensityPlot' } }
	}
} satisfies Meta<typeof DensityPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Flat rows, one curve: every height smoothed. */
export const Default: Story = {
	args: {
		data: HEIGHTS,
		x: 'height'
	}
};

/** Only `y`, no `x`: the plot estimates along `y` (a `densityY`) and draws a horizontal curve. */
export const Horizontal: Story = {
	args: {
		data: HEIGHTS,
		y: 'height'
	}
};

/** `grouping: 'group'` splits the rows into one curve per group. */
export const Grouped: Story = {
	args: {
		data: HEIGHTS,
		x: 'height',
		grouping: 'group'
	}
};

/** A pre-built `series` array: each series is estimated on its own, the same result as `grouping`. */
export const SeriesBased: Story = {
	args: {
		series: [
			{
				name: 'Female',
				x: 'height',
				y: 'height',
				data: HEIGHTS.filter((d: HeightRow) => d.group === 'female')
			},
			{
				name: 'Male',
				x: 'height',
				y: 'height',
				data: HEIGHTS.filter((d: HeightRow) => d.group === 'male')
			}
		] satisfies Series<HeightRow>[]
	}
};
