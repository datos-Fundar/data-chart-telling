import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `delaunayLink` (one line per triangulation edge) and `delaunayMesh` (the
// whole triangulation as a single path) — svelteplot's own `DelaunayLink` /
// `DelaunayMesh`. Both take `x`/`y`. A plot grouped by `color` triangulates
// each group separately and tints it with the group's palette color, without
// any setting on the marker itself.

const meta = {
	title: 'Markers/Delaunay',
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

/** Every edge of the triangulation as its own line. */
export const Link: Story = {
	args: {
		markers: [
			{
				type: 'delaunayLink',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				styles: { strokeOpacity: 0.4 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** The same triangulation as one mesh path. */
export const Mesh: Story = {
	args: {
		markers: [
			{
				type: 'delaunayMesh',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				styles: { strokeOpacity: 0.4 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** The plot's `color: 'region'` triangulates each region separately, and the mesh inherits that grouping and tints each one with its region's palette color. */
export const GroupedByRegion: Story = {
	args: {
		color: 'region',
		markers: [
			{
				type: 'delaunayMesh',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy'
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
