import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `hull` marker (svelteplot's own `Hull`) — the convex hull around a
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

/** A single hull wrapping one cluster of points — here, scoped to the `Americas` series (one per `color: 'region'`) so it reuses the plot's own data. */
export const Basic: Story = {
	args: {
		markers: [
			{
				type: 'hull',
				series: 'Americas',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				styles: { fill: '#4f46e5', fillOpacity: 0.12, stroke: '#4f46e5' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Grouping by `grouping` (here, `region`) draws one hull per group instead
 * of a single hull over every point. `color: 'region'` matches each hull's
 * fill/stroke to the same `region` colors the scatter points above already
 * use — the theme's shared `cfg.palette`, not a separate default scheme.
 */
export const GroupedByRegion: Story = {
	args: {
		markers: [
			{
				type: 'hull',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				grouping: 'region',
				color: 'region',
				styles: { fillOpacity: 0.1 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
