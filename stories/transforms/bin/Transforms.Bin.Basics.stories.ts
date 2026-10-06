import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { MEASUREMENTS } from '../../data/measurements';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `binX` transform on a `rect` marker: the marker's rows are grouped into bins
// along `x`, and each bin is reduced to one rect. The default reducer is `count`,
// so the bar's height is how many rows fall in the bin. `binY` is the same on the
// other axis. Demoed on an empty `LinePlot` canvas with the domains pinned, so
// only the bins are on screen — see `Plots/HistogramPlot` for bins on real charts.

const meta = {
	title: 'Transforms/Bin/Basics',
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

// ── Stories ───────────────────────────────────────────────────────────────────

/** `binX` with the default `count` reducer: each bar is the number of rows whose `value` falls in its bin. */
export const Count: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [{ type: 'binX', y: 'count', thresholds: 12 }],
				styles: { fill: '#2563eb', fillOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `binY` bins along `y` instead, so the bars run horizontally: the reducer goes to `x`, the bar's length. */
export const BinY: Story = {
	args: {
		scales: { x: { domain: [0, 60] }, y: { domain: [15, 55] } },
		markers: [
			{
				type: 'rect',
				data: MEASUREMENTS,
				y: 'value',
				transforms: [{ type: 'binY', x: 'count', thresholds: 12 }],
				styles: { fill: '#16a34a', fillOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `insetLeft`/`insetRight` on the bin close the gap between neighbouring bars, so the bins read as one continuous histogram. */
export const NoGaps: Story = {
	args: {
		markers: [
			{
				type: 'rect',
				data: MEASUREMENTS,
				x: 'value',
				transforms: [{ type: 'binX', y: 'count', thresholds: 12, insetLeft: 0, insetRight: 0 }],
				styles: { fill: '#9333ea', fillOpacity: 0.8 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
