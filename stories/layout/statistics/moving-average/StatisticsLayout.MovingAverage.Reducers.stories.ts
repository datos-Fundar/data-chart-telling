import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import { GOOGL_AUGUST_2026 } from '../../../data/stockPrices';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `reduce` picks the window's own reducer - svelteplot's own `windowY`
// options, defaulting to `'mean'`. `statistics` is a list, so multiple
// `movingAverage` entries stack independently over the same data.

const stockData = GOOGL_AUGUST_2026.map((d, i) => ({ ...d, day: i + 1 }));

const meta = {
	title: 'Layout/Statistics/Moving Average/Reducers',
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

/** `reduce: 'median'` - more robust to single-day spikes than the default `'mean'`. */
export const Median: Story = {
	args: {
		statistics: [{ type: 'movingAverage', k: 5, reduce: 'median' }]
	}
};

/** Two entries, `reduce: 'max'` and `reduce: 'min'`, draw a rolling high/low envelope around the price. */
export const Envelope: Story = {
	args: {
		statistics: [
			{ type: 'movingAverage', k: 5, reduce: 'max', styles: { stroke: '#059669' } },
			{ type: 'movingAverage', k: 5, reduce: 'min', styles: { stroke: '#dc2626' } }
		]
	}
};
