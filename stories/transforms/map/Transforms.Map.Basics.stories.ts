import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { DAILY_TEMPERATURE, BUENOS_AIRES_TEMPERATURE } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `mapY` transform replaces each group's `y` values with a function of the
// whole group at once - something a per-row accessor can't do, since it sees one
// row at a time. Built in: `cumsum` (a running total), `rank` and `quantile`.
// Any `(index, values) => values` function works too. `mapX` maps `x`.

const meta = {
	title: 'Transforms/Map/Basics',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: DAILY_TEMPERATURE,
		x: 'date',
		y: 'rain',
		color: 'city'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		color: { control: false },
		transforms: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The daily rainfall as is: spikes on rainy days, zero in between - hard to compare the two cities. */
export const DailyRain: Story = {
	args: { scales: { y: { label: 'Rain (mm)' } } }
};

/** `map: 'cumsum'` as the plot's own transform: each city's rain adds up through the year, one running total per series. */
export const Cumsum: Story = {
	args: {
		transforms: [{ type: 'mapY', map: 'cumsum' }],
		scales: { y: { label: 'Rain so far (mm)' } }
	}
};

/**
 * `map: 'quantile'` on a marker: with the temperatures as `x` and `y`, `mapY`
 * replaces each `y` by its rank among the city's days, from 0 to 1 - an
 * empirical cumulative distribution, drawn as dots.
 */
export const Quantile: Story = {
	args: {
		data: [],
		x: 'temp',
		y: 'temp',
		color: undefined,
		scales: { x: { label: 'Temperature (°C)' }, y: { label: 'Share of days at or below' } },
		markers: [
			{
				type: 'dot',
				data: DAILY_TEMPERATURE,
				x: 'temp',
				y: 'temp',
				grouping: 'city',
				color: 'city',
				transforms: [{ type: 'mapY', map: 'quantile' }],
				styles: { dotRadius: 2.5, dotStroke: 'none' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `map: 'rank'`: each day's rank among the year, the coldest day at 0 - the daily noise becomes a steady ranking. */
export const Rank: Story = {
	args: {
		data: BUENOS_AIRES_TEMPERATURE,
		y: 'temp',
		color: undefined,
		transforms: [{ type: 'mapY', map: 'rank' }],
		scales: { y: { label: 'Rank of the day’s temperature' } }
	}
};

/** A function of the whole group: each day's temperature minus its city's yearly mean - the anomaly, centered on zero. */
export const CustomMap: Story = {
	args: {
		y: 'temp',
		transforms: [
			{
				type: 'mapY',
				map: (index: number[], values: number[]) => {
					const mean = index.reduce((sum, i) => sum + values[i], 0) / index.length;
					return index.map((i) => values[i] - mean);
				}
			}
		],
		scales: { y: { label: 'Difference from yearly mean (°C)' } }
	}
};
