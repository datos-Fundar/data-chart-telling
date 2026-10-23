import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import {
	PROVINCE_VALUES,
	MALE_PROVINCE_VALUES,
	FEMALE_PROVINCE_VALUES,
	type ProvinceRow
} from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Ranking/BarPlot/Series',
	component: BarPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 700, step: 50 }
		},
		series: {
			description: 'Data series to render.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		}
	},
	parameters: {
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Single series with categorical x axis (provinces) - the bars are drawn in
 * the configured palette colour for the series (first colour, by default).
 */
export const Default: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_PROVINCE_VALUES
			} satisfies Series<ProvinceRow>
		]
	}
};

/**
 * Series carry only data; colours live in `segments` so the same data can be
 * re-styled without touching the series. Because `segments` is not present
 * here, it is using the default palette.
 */
export const TwoSeries: Story = {
	args: {
		series: [
			{
				name: 'female_life_expectancy',
				x: 'province',
				y: 'value',
				data: FEMALE_PROVINCE_VALUES
			} satisfies Series<ProvinceRow>,
			{
				name: 'male_life_expectancy',
				x: 'province',
				y: 'value',
				data: MALE_PROVINCE_VALUES
			} satisfies Series<ProvinceRow>
		]
	}
};

/**
 * Alternative approach: pass raw data and declare which fields map to dimensions.
 * - `data`: full dataset (all rows combined)
 * - `x`: field name for X-axis values (province)
 * - `y`: field name for Y-axis values (value)
 * - `color`: grouping dimension (categorical field that creates separate series per value)
 *
 * BarPlot automatically creates one series per unique `color` value (male/female),
 * using each sex's name from the grouping column.
 */
export const TwoSeriesUsingDataAndGrouping: Story = {
	args: {
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex'
	}
};
