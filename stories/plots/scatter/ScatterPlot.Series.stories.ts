import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { COUNTRIES, AMERICAS, EUROPE, type CountryPoint } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/ScatterPlot/Series',
  component: ScatterPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 500,
  },
  argTypes: {
    width: {
      description: 'Plot width in pixels.',
      control: { type: 'range', min: 300, max: 950, step: 50 },
    },
    height: {
      description: 'Plot height in pixels.',
      control: { type: 'range', min: 200, max: 700, step: 50 },
    },
    series: {
      description: 'Data series to render.',
      control: false,
      table: { type: { summary: 'Series<TData>[]' }, category: 'Data' },
    },
  },
  parameters: {
    docs: { source: { name: 'ScatterPlot' } },
  },
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Single series with no segments — every point is drawn in the configured palette colour for its series index (first colour, by default). */
export const Default: Story = {
  args: {
    series: [
      { name: 'americas', x: 'gdpPerCapita', y: 'lifeExpectancy', data: AMERICAS } satisfies Series<CountryPoint>,
    ],
  },
};

/** Series carry only data; colours live in `segments` so the same data can be re-styled without touching the series. Because `segments` is not present here, it uses the default palette. */
export const TwoSeries: Story = {
  args: {
    series: [
      { name: 'americas', x: 'gdpPerCapita', y: 'lifeExpectancy', data: AMERICAS } satisfies Series<CountryPoint>,
      { name: 'europe', x: 'gdpPerCapita', y: 'lifeExpectancy', data: EUROPE } satisfies Series<CountryPoint>,
    ],
  },
};

/**
 * Alternative approach: pass raw data and declare which fields map to dimensions.
 * - `data`: full dataset (every country combined)
 * - `x`: field name for X-axis values (GDP per capita)
 * - `y`: field name for Y-axis values (life expectancy)
 * - `z`: grouping dimension (categorical field that creates separate series per value)
 *
 * ScatterPlot automatically creates one series per unique `z` value (one per region).
 */
export const TwoSeriesUsingDataAndGrouping: Story = {
  args: {
    data: COUNTRIES,
    x: 'gdpPerCapita',
    y: 'lifeExpectancy',
    z: 'region',
  },
};
