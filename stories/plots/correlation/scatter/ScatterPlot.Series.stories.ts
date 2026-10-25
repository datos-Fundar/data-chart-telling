import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { COUNTRIES_AT_2007, type CountryYearRow } from '$datasets';

const CONTINENTS = [...new Set(COUNTRIES_AT_2007.map((d) => d.continent))];

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Correlation/ScatterPlot/Series',
	component: ScatterPlot,
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
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Single series with no segments - every point is drawn in the configured palette colour for its series index (first colour, by default). */
export const Default: Story = {
	args: {
		series: [
			{
				name: 'countries',
				x: 'gdp',
				y: 'life',
				data: COUNTRIES_AT_2007
			} satisfies Series<CountryYearRow>
		]
	}
};

/** Series carry only data; colours live in `segments` so the same data can be re-styled without touching the series. Because `segments` is not present here, it uses the default palette. */
export const SeriesPerContinent: Story = {
	args: {
		series: CONTINENTS.map(
			(continent) =>
				({
					name: continent,
					x: 'gdp',
					y: 'life',
					data: COUNTRIES_AT_2007.filter((d) => d.continent === continent)
				}) satisfies Series<CountryYearRow>
		)
	}
};

/**
 * Alternative approach: pass raw data and declare which fields map to dimensions.
 * - `data`: full dataset (every country combined)
 * - `x`: field name for X-axis values (GDP per capita)
 * - `y`: field name for Y-axis values (life expectancy)
 * - `color`: grouping dimension (categorical field that creates separate series per value)
 *
 * ScatterPlot automatically creates one series per unique `color` value (one per continent).
 */
export const SeriesUsingDataAndGrouping: Story = {
	args: {
		data: COUNTRIES_AT_2007,
		x: 'gdp',
		y: 'life',
		color: 'continent'
	}
};
