import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { IRIS, IRIS_LONG, type IrisRow } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Every series draws one box per category of its rows: the box spans the
// middle half of the values (25th to 75th percentile), the line across it is
// the median, the whiskers reach the farthest values within 1.5 times the
// box's height, and the dots are the values past them. String values on `x`
// stand the boxes upright; on `y` they lie sideways. Grouping by `color`
// draws one box per group, each in its own color.

const meta = {
	title: 'Plots/Distribution/BoxPlot/Series',
	component: BoxPlot,
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
			description: 'Data series to render.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		}
	},
	parameters: {
		docs: { source: { name: 'BoxPlot' } }
	}
} satisfies Meta<typeof BoxPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** One series, one box per species: the petal length of Fisher's irises, in centimeters. */
export const Default: Story = {
	args: {
		data: IRIS,
		x: 'species',
		y: 'petalLength'
	}
};

/** `color: 'species'` makes each species its own series, so every box takes its own color. */
export const Grouped: Story = {
	args: {
		data: IRIS,
		x: 'species',
		y: 'petalLength',
		color: 'species'
	}
};

/** The categories on `y` and the petal lengths on `x` lay the same boxes out sideways. */
export const Horizontal: Story = {
	args: {
		data: IRIS,
		x: 'petalLength',
		y: 'species',
		color: 'species'
	}
};

/** Pre-built `series`: setosa and the other two species, each series in its own color over its own categories. */
export const SeriesBased: Story = {
	args: {
		series: [
			{
				name: 'Setosa',
				x: 'species',
				y: 'petalLength',
				data: IRIS.filter((d) => d.species === 'setosa')
			},
			{
				name: 'Others',
				x: 'species',
				y: 'petalLength',
				data: IRIS.filter((d) => d.species !== 'setosa')
			}
		] satisfies Series<IrisRow>[]
	}
};

/** `facet: { by: 'metric' }` draws one panel per measurement on a shared scale, so their boxes compare side by side. */
export const FacetedByMetric: Story = {
	args: {
		height: 700,
		data: IRIS_LONG,
		x: 'species',
		y: 'value',
		color: 'species',
		facet: { by: 'metric', columns: 2, axes: 'outer' }
	}
};
