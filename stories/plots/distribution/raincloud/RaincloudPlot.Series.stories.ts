import type { Meta, StoryObj } from '@storybook/svelte-vite';
import RaincloudPlot from '$lib/plots/distribution/raincloud/Plot.svelte';
import { IRIS } from '$datasets';

/** The iris flowers, split in two by the median petal length, for a second grouping. */
const FLOWERS = IRIS.map((flower) => ({
	...flower,
	petal: flower.petalLength > 4.35 ? 'long' : 'short'
}));

// ── Meta ──────────────────────────────────────────────────────────────────────
// A raincloud plot draws, for each category, half the density estimate of its
// values (the cloud), every value as a dot scattered beside it (the rain) and a
// box between them. Give the category on `x` and the values on `y`, or swap
// them for horizontal rainclouds. `grouping` (or `color`) splits each
// category into one raincloud per group, side by side.

const meta = {
	title: 'Plots/Distribution/RaincloudPlot/Series',
	component: RaincloudPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: FLOWERS,
		x: 'species',
		y: 'sepalLength'
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
			description: 'Data series to draw; each one gets its own raincloud per category.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		}
	},
	parameters: {
		docs: { source: { name: 'RaincloudPlot' } }
	}
} satisfies Meta<typeof RaincloudPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** One raincloud per species: the sepal length of its flowers. */
export const Default: Story = {};

/** The category on `y` and the values on `x` lay the rainclouds out horizontally, the cloud above the rain. */
export const Horizontal: Story = {
	args: {
		x: 'sepalLength',
		y: 'species'
	}
};

/** `grouping: 'petal'` draws a raincloud per petal size inside each species' band. A group with fewer than two values in a species draws no cloud. */
export const Grouped: Story = {
	args: {
		grouping: 'petal'
	}
};
