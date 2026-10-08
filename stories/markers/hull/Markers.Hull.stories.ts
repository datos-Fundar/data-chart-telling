import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `hull` marker (svelteplot's own `Hull`) - the convex hull around a
// cluster of points. Symmetric in x/y, so there's no `isHorizontal` to pick
// between (unlike `area`/`box`). Demoed alongside the scatter points it
// wraps.

const meta = {
	title: 'Markers/Hull',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		color: 'region'
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

/** A single hull wrapping one cluster of points, scoped to the `Americas` series. Its fill and stroke take that series' color. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'hull',
				series: 'Americas',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				styles: { fillOpacity: 0.12 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * The plot's `color: 'region'` splits the hull per region: each hull inherits
 * that grouping and takes its region's palette color for fill and stroke, the
 * same colors the scatter points use. No setting on the marker itself.
 */
export const GroupedByRegion: Story = {
	args: {
		markers: [
			{
				type: 'hull',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				styles: { fillOpacity: 0.1 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
