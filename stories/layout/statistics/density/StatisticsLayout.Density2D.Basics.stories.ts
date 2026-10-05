import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import { COUNTRIES } from '../../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `statistics: [{ type: 'density2d' }]` resolves straight to svelteplot's own
// `Density` mark — 2D kernel density contour bands over the plot's `x`/`y`,
// the same mark a `density` marker draws. Same options as that marker:
// `bandwidth` in pixels, `thresholds` for the band count or explicit levels.

const meta = {
	title: 'Layout/Statistics/Density/2D',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		r: 4
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default contour bands over the country scatter, svelteplot's own bandwidth and band count. */
export const Default: Story = {
	args: {
		statistics: [{ type: 'density2d' }]
	}
};

/** A wider `bandwidth` smooths the bands; an explicit `thresholds` list picks the density levels drawn. */
export const SmoothedLevels: Story = {
	args: {
		statistics: [{ type: 'density2d', bandwidth: 40, thresholds: [0.005, 0.01, 0.02] }]
	}
};

/** `color` splits the rows into regions and the statistic follows that grouping, so every region gets its own contour bands in its own color. `styles.stroke` set explicitly overrides that and paints all of them one color. */
export const PerRegion: Story = {
	args: {
		color: 'region',
		statistics: [{ type: 'density2d', bandwidth: 30, styles: { strokeWidth: 1 } }]
	}
};
