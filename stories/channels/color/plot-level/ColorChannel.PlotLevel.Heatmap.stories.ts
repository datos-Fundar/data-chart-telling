import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import { LIFE_EXPECTANCY_BY_PROVINCE_SEX } from '../../../plots/heatmap/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The `color` channel: a plot-level `color` accessor plus `scales.color`
// drives every default mark's fill — here, HeatmapPlot's own cells. See
// `Plots/HeatmapPlot/Styles` for the full set of ramp options; this page
// exists to show the channel concept itself, independent of any one plot kind.

const meta = {
	title: 'Channels/Color/Plot Level/Heatmap',
	component: HeatmapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420,
		data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
		x: 'province',
		y: 'sex'
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
 * `color: 'value'` feeds each cell's life-expectancy value into the plot's
 * own `scales.color` ramp — no marker config needed, since every plot kind's
 * default marks read the plot-level channel automatically.
 */
export const Default: Story = {
	args: {
		color: 'value'
	}
};

/** `scales.color.scheme` swaps the ramp's colors without touching `color` itself. */
export const CustomScheme: Story = {
	args: {
		color: 'value',
		scales: {
			color: {
				domain: [70, 85],
				scheme: 'viridis'
			}
		}
	}
};
