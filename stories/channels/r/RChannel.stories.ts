import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import { COUNTRIES_AT_2007 } from '$datasets';

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
		data: COUNTRIES_AT_2007,
		x: 'gdp',
		y: 'life',
		color: 'continent',
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

/**
 * `scales.r.domain` sets the two values at the ends of `range`: here `0` is
 * the smallest radius (3 px) and `200` the largest (20 px). A country past the
 * domain isn't clipped: it draws larger than the range's end.
 */
export const CustomDomain: Story = {
	args: {
		scales: {
			r: { domain: [0, 200], range: [3, 20] }
		}
	}
};

/**
 * The domain always includes `0` by default, so a radius is proportional to
 * its value. `zero: false` starts it at the lowest value instead - the
 * smallest dot takes the range's start - which spreads out values that sit
 * close together, at the cost of a dot no longer being proportional to its value.
 */
export const WithoutZero: Story = {
	args: {
		scales: {
			r: { zero: false, range: [3, 20] }
		}
	}
};
