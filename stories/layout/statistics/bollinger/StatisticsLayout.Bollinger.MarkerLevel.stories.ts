import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { GOOGL_AUGUST_2026 } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A marker's own `.statistics` fits against that marker's own `data`,
// independent of the plot's top-level `statistics` - both are set here so the
// two bands are visibly distinct: the top-level one (default color) bands the
// plot's own *close* series, the marker-level one (red) bands the
// hand-authored dot's own *open* data. Unlike `movingAverage`'s derived
// `line` marker, `BollingerStatisticOptions.styles` has no `strokeDasharray`
// - only `stroke`/`strokeOpacity`/`bandFill` route through to svelteplot's
// own `BollingerX`/`Y` (see its own doc comment) - so color is what
// distinguishes them here, not dash pattern.

const stockData = GOOGL_AUGUST_2026.map((d, i) => ({ ...d, day: i + 1 }));

const meta = {
	title: 'Layout/Statistics/Bollinger/Marker Level',
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

/** The plot's own top-level `statistics` bands the *close* line (default color); a hand-authored `dot` marker, in red, tracks the daily *open* price and derives its own separate band from that data. */
export const MarkerLevel: Story = {
	args: {
		statistics: [
			{
				type: 'bollinger',
				n: 5,
				k: 2,
				styles: { stroke: '#4f46e5', bandFill: '#4f46e5' }
			}
		],
		markers: [
			{
				type: 'dot',
				x: 'day',
				y: 'open',
				r: 2.5,
				styles: { dotFill: '#dc2626', dotStroke: '#dc2626' },
				statistics: [
					{ type: 'bollinger', n: 5, k: 2, styles: { stroke: '#dc2626', bandFill: '#dc2626' } }
				]
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
