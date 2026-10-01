import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES } from '../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `voronoi` (one polygon per point) and `voronoiMesh` (the whole diagram as a
// single path) — svelteplot's own `Voronoi` / `VoronoiMesh`. Both take
// `x`/`y` and an optional `grouping` (one diagram per group); `color`
// resolves through this package's own `cfg.palette` into `stroke`.

const meta = {
	title: 'Markers/Voronoi',
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

/** One cell per country. */
export const Cells: Story = {
	args: {
		markers: [
			{ type: 'voronoi', x: 'gdpPerCapita', y: 'lifeExpectancy', styles: { strokeOpacity: 0.5 } }
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** Cells filled by region — `styles.fill` is left to the author, `color` only drives the stroke. */
export const FilledByRegion: Story = {
	args: {
		color: 'region',
		markers: [
			{
				type: 'voronoi',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				color: 'region',
				styles: { fill: '#888', fillOpacity: 0.08, strokeWidth: 1.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** The same diagram as one mesh path. */
export const Mesh: Story = {
	args: {
		markers: [
			{
				type: 'voronoiMesh',
				x: 'gdpPerCapita',
				y: 'lifeExpectancy',
				styles: { strokeOpacity: 0.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
