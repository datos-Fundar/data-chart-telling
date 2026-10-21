import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { GOOGL_AUGUST_2026 } from '../../../data/stockPrices';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `statistics: [{ type: 'bollinger' }]` resolves straight to svelteplot's own
// `BollingerX`/`BollingerY` mark: a moving-average line (`n`) plus a band at
// `±k` standard deviations. Of `StrokeStyle`'s full field set, only
// `stroke`/`strokeOpacity` actually reach the line - `bandFill` is the band's
// own separate style channel.

const stockData = GOOGL_AUGUST_2026.map((d, i) => ({ ...d, day: i + 1 }));

const meta = {
	title: 'Layout/Statistics/Bollinger/Basics',
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

/** A 5-day, ±2σ Bollinger band over GOOGL's August 2026 daily close price. */
export const Default: Story = {
	args: {
		statistics: [{ type: 'bollinger', n: 5, k: 2 }]
	}
};

/** `styles.stroke` recolors the moving-average line, `styles.bandFill` the ±k·σ band - the two channels that actually route through. */
export const CustomStyle: Story = {
	args: {
		statistics: [
			{ type: 'bollinger', n: 5, k: 2, styles: { stroke: '#7c3aed', bandFill: '#7c3aed' } }
		]
	}
};
