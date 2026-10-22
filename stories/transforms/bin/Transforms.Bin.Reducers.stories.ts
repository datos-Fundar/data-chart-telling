import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES_AT_2007, HEIGHTS, type CountryYearRow, type HeightRow } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A bin's reducer turns its rows into one value. `y` is that value for `binX`
// (for `binY`, it is `x`). `count` is the named reducer that needs no field; to
// reduce any other field, pass a function of the bin's rows. `cumulative` runs
// the bins as a running total.

const meanOf = (rows: HeightRow[], field: 'height' | 'weight') =>
	rows.reduce((sum, d) => sum + d[field], 0) / rows.length;

const TOTAL_POPULATION = COUNTRIES_AT_2007.reduce((sum, d) => sum + d.population, 0);

/** The rows' share of the whole population, in percent. */
const populationShare = (rows: CountryYearRow[]) =>
	(rows.reduce((sum, d) => sum + d.population, 0) / TOTAL_POPULATION) * 100;

const meta = {
	title: 'Transforms/Bin/Reducers',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'x',
		y: 'y'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The `mean` of each bin's `weight`, binned by `height`: a function reducer over the bin's rows. */
export const MeanWeight: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: HEIGHTS,
				x: 'height',
				transforms: [
					{
						type: 'binX',
						y: (rows: HeightRow[]) => meanOf(rows, 'weight'),
						thresholds: 12
					}
				],
				styles: { fill: '#ea580c', fillOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `cumulative: 1` hands each bin the rows of every bin before it, so a share reducer climbs to 100%: here the share of the population living in countries up to each life expectancy. */
export const Cumulative: Story = {
	args: {
		scales: {
			x: { label: 'Life expectancy (years)' },
			y: { domain: [0, 100], label: 'Share of population (%)' }
		},
		markers: [
			{
				type: 'rect',
				data: COUNTRIES_AT_2007,
				x: 'life',
				transforms: [{ type: 'binX', y: populationShare, thresholds: 12, cumulative: 1 }],
				styles: { fill: '#0d9488', fillOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
