import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ViolinPlot from '$lib/plots/distribution/violin/Plot.svelte';
import { IRIS } from '$datasets';

/** The iris flowers, split in two by the median petal length, for a second grouping. */
const FLOWERS = IRIS.map((flower) => ({
	...flower,
	petal: flower.petalLength > 4.35 ? 'long' : 'short'
}));

// ── Meta ──────────────────────────────────────────────────────────────────────
// A violin plot draws, for each category, the density estimate of its values
// mirrored around the middle of its band, with a box (quartiles, median and
// whiskers) inside. Give the category on `x` and the values on `y`, or swap
// them for horizontal violins. `grouping` (or `color`) splits each category
// into one violin per group, side by side.

const meta = {
	title: 'Plots/Distribution/ViolinPlot/Series',
	component: ViolinPlot,
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
			description: 'Data series to draw; each one gets its own violin per category.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		}
	},
	parameters: {
		docs: { source: { name: 'ViolinPlot' } }
	}
} satisfies Meta<typeof ViolinPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** One violin per species: the sepal length of its flowers. */
export const Default: Story = {};

/** The category on `y` and the values on `x` lay the violins out horizontally. */
export const Horizontal: Story = {
	args: {
		x: 'sepalLength',
		y: 'species'
	}
};

/** `grouping: 'petal'` draws a violin per petal size inside each species' band. A group with fewer than two values in a species draws none. */
export const Grouped: Story = {
	args: {
		grouping: 'petal'
	}
};
