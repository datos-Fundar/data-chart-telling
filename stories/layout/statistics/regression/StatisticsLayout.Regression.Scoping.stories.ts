import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { COUNTRIES } from '../../../plots/correlation/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `statistics` entry's own `series` field controls what it fits against:
// omitted, it pools every resolved series into one combined source; named,
// it fits once per listed series, using that series' own data/color. Series
// themselves come from `color` (or an explicit `grouping`) splitting the data
// by region - the same three stories below, at three different scopes.

const meta = {
	title: 'Layout/Statistics/Regression/Scoping',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		r: 6
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Plot level, one series: no `color`, so the whole dataset is a single series and `statistics` fits one curve across every country. */
export const Pooled: Story = {
	args: {
		statistics: [{ type: 'regression', confidence: false }]
	}
};

/** Plot level, grouped by series: `color: 'region'` splits the data into one series per continent, and with no `series` scope the statistic fits one regression per continent in that continent's color. */
export const GroupedByContinent: Story = {
	args: {
		color: 'region',
		statistics: [{ type: 'regression', confidence: false }]
	}
};

/** `pooled: true` opts out of the per-series default: `color: 'region'` still splits the data, but one regression fits every continent combined. */
export const PooledAcrossSeries: Story = {
	args: {
		color: 'region',
		statistics: [{ type: 'regression', confidence: false, pooled: true }]
	}
};

/** Scoped to a single series: same `color`-split series as above, but `series: ['Europe']` fits a regression for just that one continent - every country still renders, only Europe gets a line. */
export const SingleSeriesScoped: Story = {
	args: {
		color: 'region',
		statistics: [{ type: 'regression', confidence: false, series: ['Europe'] }]
	}
};
