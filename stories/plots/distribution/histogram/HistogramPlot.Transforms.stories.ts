import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HistogramPlot from '$lib/plots/distribution/histogram/Plot.svelte';
import { COUNTRIES_AT_2007, HEIGHTS, type CountryYearRow, type HeightRow } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Every histogram runs a default `binX` that counts its rows. A `binX` in
// `transforms` is merged over that default: the props it sets win, and the rest
// of the default still applies. So a plot can change the bins without restating
// the count. Any other transform in `transforms` runs after the bin.

const TOTAL_POPULATION = COUNTRIES_AT_2007.reduce((sum, d) => sum + d.population, 0);

/** The rows' share of the whole population, in percent. */
const populationShare = (rows: CountryYearRow[]) =>
	(rows.reduce((sum, d) => sum + d.population, 0) / TOTAL_POPULATION) * 100;

const meta = {
	title: 'Plots/Distribution/HistogramPlot/Transforms',
	component: HistogramPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHTS,
		x: 'height'
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
		transforms: {
			description:
				'The plot’s own transforms. A `binX` here is merged over the default `{ type: "binX", y: "count" }`, its props winning.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'HistogramPlot' } }
	}
} satisfies Meta<typeof HistogramPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No `transforms`: the default bin alone, counting the rows of each bin. */
export const DefaultBin: Story = {};

/** A `binX` with only `thresholds`: the bins change, and the default `count` stays. */
export const ThresholdsOnly: Story = {
	args: {
		transforms: [{ type: 'binX', thresholds: [135, 145, 150, 155, 160, 165, 175, 180] }]
	}
};

/** `interval` fixes each bin's width instead of its count: here one centimeter of `height` per bin, so the bins line up on whole numbers. */
export const Interval: Story = {
	args: {
		transforms: [{ type: 'binX', interval: 1 }]
	}
};

/** A `binX` with its own `y`: the bars show the mean weight of each bin, not its count. */
export const MeanWeight: Story = {
	args: {
		transforms: [
			{
				type: 'binX',
				thresholds: 12,
				y: (rows: HeightRow[]) => rows.reduce((s, d) => s + d.weight, 0) / rows.length
			}
		],
		scales: { y: { label: 'Mean weight' } }
	}
};

/** `cumulative: 1` runs the bins as a running total: each bar reduces the rows of every bin before it, so a share climbs to 100%. Here, the share of the population living in countries up to each life expectancy. */
export const Cumulative: Story = {
	args: {
		data: COUNTRIES_AT_2007,
		x: 'life',
		transforms: [{ type: 'binX', thresholds: 12, y: populationShare, cumulative: 1 }],
		scales: {
			x: { label: 'Life expectancy (years)' },
			y: { domain: [0, 100], label: 'Share of population (%)' }
		}
	}
};

/** `reverse: true` reverses the order of the bins' output rows. The bars look the same: it only changes the order the rows come in, which is what a tooltip or a later transform reads. */
export const Reverse: Story = {
	args: {
		transforms: [{ type: 'binX', thresholds: 12, reverse: true }]
	}
};
