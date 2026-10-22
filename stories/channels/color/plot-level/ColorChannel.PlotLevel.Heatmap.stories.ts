import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import { PENGUIN_COUNTS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The `color` channel: a plot-level `color` accessor plus `scales.color`
// drives every default mark's fill - here, HeatmapPlot's own cells. See
// `Plots/HeatmapPlot/Styles` for the full set of ramp options; this page
// exists to show the channel concept itself, independent of any one plot kind.

const meta = {
	title: 'Channels/Color/Plot Level/Heatmap',
	component: HeatmapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: PENGUIN_COUNTS,
		x: 'island',
		y: 'species'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HeatmapPlot' } }
	}
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * `color: 'count'` feeds each cell's penguin count into the plot's
 * own `scales.color` ramp - no marker config needed, since every plot kind's
 * default marks read the plot-level channel automatically.
 */
export const Default: Story = {
	args: {
		color: 'count'
	}
};

/** `scales.color.scheme` swaps the ramp's colors without touching `color` itself. */
export const CustomScheme: Story = {
	args: {
		color: 'count',
		scales: {
			color: {
				domain: [0, 120],
				scheme: 'viridis'
			}
		}
	}
};
