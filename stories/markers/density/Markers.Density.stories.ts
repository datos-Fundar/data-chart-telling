import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `density` marker (svelteplot's own `Density`) — 2D kernel density
// estimation drawn as filled/stroked contour bands. Symmetric in x/y, so
// there's no `isHorizontal` to pick between (unlike `area`/`box`). Demoed
// alongside the scatter points it's estimated from.

const meta = {
	title: 'Markers/Density',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy'
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

/** Filled contour bands, colored by estimated density via the `'density'` keyword. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'density',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				bandwidth: 28,
				styles: { fill: 'density', strokeOpacity: 0 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** The plot's `color: 'region'` estimates and draws a separate density surface per region, each in its region's color. */
export const GroupedByRegion: Story = {
	args: {
		color: 'region',
		markers: [
			{
				type: 'density',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				bandwidth: 24,
				thresholds: 4,
				styles: { fill: 'none', strokeOpacity: 0.6 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
