import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import { GOOGL_AUGUST_2026 } from '../../../data/stockPrices';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `statistics: [{ type: 'movingAverage' }]` has no dedicated svelteplot mark —
// it calls svelteplot's own `windowY` transform and wraps the smoothed result
// into a `line` marker, so `styles` is a plain `StrokeStyle`, same as any
// hand-authored `line`.

const stockData = GOOGL_AUGUST_2026.map((d, i) => ({ ...d, day: i + 1 }));

const meta = {
	title: 'Layout/Statistics/Moving Average/Basics',
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

/** A 5-day `movingAverage` (default `reduce: 'mean'`) smoothing GOOGL's August 2026 daily close price. */
export const Default: Story = {
	args: {
		statistics: [{ type: 'movingAverage', k: 5 }]
	}
};

/** `styles` recolors and redashes the derived `line` marker, same as any hand-authored one. */
export const CustomStyle: Story = {
	args: {
		statistics: [{ type: 'movingAverage', k: 5, styles: { strokeDasharray: '4 2' } }]
	}
};
