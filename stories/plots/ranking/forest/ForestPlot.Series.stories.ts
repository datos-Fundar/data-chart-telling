import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ForestPlot from '$lib/plots/ranking/forest/Plot.svelte';
import { INFLATION_RANGES } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A forest plot draws, per row, a dot - an estimate - on a stem spanning its interval.
// Each row gives its interval as `lower` and `upper` fields, or as an `error` that
// reaches that far either side of its value. Here: the mean monthly inflation of each
// region and year, and its lowest and highest month. Categories on `y` lie sideways, the
// usual way of a forest plot; on `x` they stand upright.

const meta = {
	title: 'Plots/Ranking/ForestPlot/Series',
	component: ForestPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 480,
		data: INFLATION_RANGES,
		x: 'mean',
		y: 'period',
		lower: 'min',
		upper: 'max',
		color: 'region'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } }
	},
	parameters: {
		docs: { source: { name: 'ForestPlot' } }
	}
} satisfies Meta<typeof ForestPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** One row per region and year, colored by region: the mean on a stem from its lowest month to its highest. */
export const Default: Story = {
	args: {}
};

/** The categories on `x` and the values on `y` stand the same rows upright. */
export const Upright: Story = {
	args: {
		x: 'period',
		y: 'mean',
		height: 420
	}
};

/** An `error` field reaches that far either side of the value, instead of `lower` and `upper`: here the larger distance to the lowest or highest month. */
export const FromError: Story = {
	args: {
		data: INFLATION_RANGES.map((row) => ({
			...row,
			error: Math.max(row.mean - row.min, row.max - row.mean)
		})),
		lower: undefined,
		upper: undefined,
		error: 'error'
	}
};
