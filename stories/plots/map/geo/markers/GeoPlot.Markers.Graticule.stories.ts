import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES } from '$datasets/world-countries';
import { EARTHQUAKES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `graticule` (lon/lat gridlines) and `sphere` (the outer globe outline) are
// the simplest GeoPlot markers - mirrors svelteplot's `geo/earthquakes`
// example, which combines both with raw lon/lat point data.

const meta = {
	title: 'Plots/Map/GeoPlot/Markers/Graticule',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'GeoPlot' } }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Basic graticule - default 10° step lon/lat gridlines drawn behind the base map. */
export const Basic: Story = {
	args: {
		data: WORLD_COUNTRIES,
		markers: [{ type: 'graticule', behind: true }] satisfies GeoMarkersConfig[]
	}
};

/** Custom step + style - a coarser 20° grid in a lighter, dashed stroke. */
export const CustomStepAndStyle: Story = {
	args: {
		data: WORLD_COUNTRIES,
		coordinates: { projection: 'orthographic', rotate: true },
		markers: [
			{
				type: 'graticule',
				behind: true,
				step: 20,
				styles: { stroke: '#94a3b8', strokeOpacity: 0.5, strokeDasharray: '2 2' }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * Sphere + graticule on an orthographic globe - the `sphere` marker draws
 * the outer outline of the whole earth, which only reads clearly on a
 * hemisphere-style projection like `orthographic`. `behind: true` is what
 * makes the fill work as ocean-colored background here rather than an
 * opaque layer painted over every country on top of it - markers otherwise
 * always draw over the base map regardless of their position in `markers`.
 * `coordinates.rotate: true` enables drag-to-rotate on an orthographic
 * projection (independent of `zoom`, which only covers wheel/pinch scale
 * here) - drag the globe below to spin it.
 */
export const SphereOutline: Story = {
	args: {
		data: WORLD_COUNTRIES,
		coordinates: {
			projection: { type: 'orthographic', rotate: [60, 20] },
			zoom: true,
			rotate: true
		},
		markers: [
			{
				type: 'sphere',
				behind: true,
				styles: { fill: '#eff6ff', stroke: 'currentColor', strokeWidth: 1 }
			},
			{ type: 'graticule', behind: true, styles: { stroke: '#cbd5e1', strokeOpacity: 0.6 } }
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * Graticule + sphere + raw lon/lat dots - mirrors svelteplot's
 * `geo/earthquakes` example: point data (earthquake epicenters) fed
 * straight in as a `dot` marker over the globe's graticule/sphere.
 */
export const WithEarthquakeDots: Story = {
	args: {
		data: WORLD_COUNTRIES,
		scales: { r: { domain: [6, 8], zero: false, range: [3, 8] } },
		coordinates: {
			projection: { type: 'orthographic', rotate: [65, 15] },
			zoom: true,
			rotate: true
		},
		markers: [
			{
				type: 'sphere',
				behind: true,
				styles: { fill: '#f8fafc', stroke: 'currentColor' }
			},
			{
				type: 'graticule',
				behind: true,
				styles: { stroke: '#e2e8f0' }
			},
			{
				type: 'dot',
				data: EARTHQUAKES,
				x: 'lon',
				y: 'lat',
				r: 'magnitude',
				styles: { dotFill: '#dc2626', dotFillOpacity: 0.6, dotStroke: '#7f1d1d' }
			}
		] satisfies GeoMarkersConfig[]
	}
};
