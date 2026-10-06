import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { MEASUREMENTS, type Measurement } from '../../data/measurements';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A bin's reducer turns its rows into one value. `y` is that value for `binX`
// (for `binY`, it is `x`). `count` is the named reducer that needs no field; to
// reduce any other field, pass a function of the bin's rows. `cumulative` runs
// the bins as a running total.

const meanOf = (rows: Measurement[], field: 'value' | 'weight') =>
	rows.reduce((sum, d) => sum + d[field], 0) / rows.length;

const meta = {
	title: 'Transforms/Bin/Reducers',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: [],
		x: 'x',
		y: 'y',
		scales: { x: { domain: [15, 55] }, y: { domain: [0, 60] } }
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

/** The `mean` of each bin's `weight`, binned by `value`: a function reducer over the bin's rows. */
export const MeanWeight: Story = {
	args: {
		scales: { x: { domain: [15, 55] }, y: { domain: [0, 80] } },
		markers: [
			{
				type: 'rect',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [
					{
						type: 'binX',
						y: (rows: Measurement[]) => meanOf(rows, 'weight'),
						thresholds: 12
					}
				],
				styles: { fill: '#ea580c', fillOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `cumulative: 1` adds each bin to the ones before it, so the bars climb to the total number of rows. */
export const Cumulative: Story = {
	args: {
		scales: { x: { domain: [15, 55] }, y: { domain: [0, 300] } },
		markers: [
			{
				type: 'rect',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [{ type: 'binX', y: 'count', thresholds: 12, cumulative: 1 }],
				styles: { fill: '#0d9488', fillOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
