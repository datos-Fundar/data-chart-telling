import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { GOOGL_AUGUST_2026 } from '../../../data/stockPrices';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A marker's own `.statistics` fits against that marker's own `data`,
// independent of the plot's top-level `statistics` — both are set here so the
// two derived lines are visibly distinct: the top-level one (default color)
// smooths the plot's own *close* series, the marker-level one (red) smooths
// the hand-authored dot's own *open* data. Both use the same dashed
// `strokeDasharray` — `movingAverage` wraps into a plain `line` marker, so
// its `styles` is a full `StrokeStyle`, unlike `bollinger`'s narrower one.

const stockData = GOOGL_AUGUST_2026.map((d, i) => ({ ...d, day: i + 1 }));

const meta = {
	title: 'Layout/Statistics/Moving Average/Marker Level',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: stockData,
		x: 'day',
		y: 'close'
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

/** The plot's own top-level `statistics` smooths the *close* line (default color); a hand-authored `dot` marker, in red, tracks the daily *open* price and derives its own separate moving average from that data. Both dashed. */
export const MarkerLevel: Story = {
	args: {
		statistics: [{
			type: 'movingAverage',
			k: 5,
			styles: { stroke: '#4f46e5', strokeDasharray: '4 2' }
		}],
		markers: [
			{
				type: 'dot',
				data: stockData,
				x: 'day',
				y: 'open',
				r: 2.5,
				styles: { dotFill: '#dc2626', dotStroke: '#dc2626' },
				statistics: [
					{ type: 'movingAverage', k: 5, styles: { stroke: '#dc2626', strokeDasharray: '4 2' } }
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
