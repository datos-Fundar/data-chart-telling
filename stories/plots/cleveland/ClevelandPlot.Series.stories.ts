import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ClevelandPlot from '$lib/plots/cleveland/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { AGE_SHARES, type AgeShareRow } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Every category is one dot for each series that has a value there, joined by a connector
// from the lowest to the highest. Here, the share of each age group in Buenos Aires City across
// four census years. String values on `x` stand the rows upright; on `y` they lie sideways.

const meta = {
	title: 'Plots/ClevelandPlot/Series',
	component: ClevelandPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		series: {
			description: 'Data series to render.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		}
	},
	parameters: {
		docs: { source: { name: 'ClevelandPlot' } }
	}
} satisfies Meta<typeof ClevelandPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** One dot per series in every category, each series in its own color. */
export const Default: Story = {
	args: {
		data: AGE_SHARES,
		x: 'ageGroup',
		y: 'share',
		grouping: 'year'
	}
};

/** The categories on `y` and the values on `x` lay the same rows out sideways. */
export const Horizontal: Story = {
	args: {
		data: AGE_SHARES,
		x: 'share',
		y: 'ageGroup',
		grouping: 'year'
	}
};

/** Pre-built `series`: only the first and last census, so each category joins two dots. */
export const SeriesBased: Story = {
	args: {
		series: [
			{ name: '1991', x: 'ageGroup', y: 'share', data: AGE_SHARES.filter((d) => d.year === 1991) },
			{ name: '2022', x: 'ageGroup', y: 'share', data: AGE_SHARES.filter((d) => d.year === 2022) }
		] satisfies Series<AgeShareRow>[]
	}
};

/** Series that follow one another read best on a sequential ramp: `scales.color.scheme` takes a named one, here `'blues'`, sampled across the series in order. `schemeRange` skips its near-white start. */
export const SequentialColors: Story = {
	args: {
		data: AGE_SHARES,
		x: 'ageGroup',
		y: 'share',
		grouping: 'year',
		scales: { color: { scheme: 'blues', schemeRange: [0.3, 1] } }
	}
};
