import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { COUNTRIES } from '../../plots/correlation/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `r` sizes every dot by a per-row value - see `Plots/ScatterPlot/Bubble` for
// the channel itself. This page is specifically about `scales.r`: unlike
// `color`, svelteplot binds `r` to exactly one scale shared by every mark in
// the plot (there's no per-mark equivalent), so `scales.r` is plot-level
// only - `domain`/`range` are threaded straight into svelteplot's own `r`
// scale rather than resolved independently.

const meta = {
	title: 'Channels/R',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		color: 'region',
		r: 'population'
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No `scales.r` - svelteplot's own auto-fit pixel range, sized to the plot's own bounds. */
export const Default: Story = {};

/** `scales.r.range` sets an explicit `[min, max]` pixel radius instead of svelteplot's auto-fit. */
export const CustomRange: Story = {
	args: {
		scales: {
			r: { range: [2, 30] }
		}
	}
};

/** `scales.r.domain` clamps the input range - countries below/above it render at the domain's own min/max radius instead of their real, more extreme population. */
export const CustomDomain: Story = {
	args: {
		scales: {
			r: { domain: [0, 200], range: [3, 20] }
		}
	}
};
