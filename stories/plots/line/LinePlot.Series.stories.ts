import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import {
	LIFE_EXPECTANCY,
	MALE_LIFE_EXPECTANCY,
	FEMALE_LIFE_EXPECTANCY,
	type YearPoint
} from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/LinePlot/Series',
	component: LinePlot,
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
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Single series with no segments - the whole line is drawn in the configured
 * palette colour for its series index (first colour, by default).
 */
export const Default: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			} satisfies Series<YearPoint>
		]
	}
};

/**
 * Series carry only data; colours live in
 * `segments` so the same data can be re-styled without touching the series.
 * Because `segments` is not present here, it is using the default palette.
 */
export const TwoSeries: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			} satisfies Series<YearPoint>,
			{
				name: 'male_life_expectancy',
				x: 'year',
				y: 'value',
				data: MALE_LIFE_EXPECTANCY
			} satisfies Series<YearPoint>
		]
	}
};

/**
 * Alternative approach: pass raw data and declare which fields map to dimensions.
 * - `data`: full dataset (all rows combined)
 * - `x`: field name for X-axis values (year)
 * - `y`: field name for Y-axis values (value)
 * - `color`: grouping dimension (categorical field that creates separate series per value)
 *
 * LinePlot automatically creates one series per unique `color` value (male/female),
 * using each sex's name from the grouping column.
 */
export const TwoSeriesUsingDataAndGrouping: Story = {
	args: {
		data: LIFE_EXPECTANCY,
		x: 'year',
		y: 'value',
		color: 'sex'
	}
};
