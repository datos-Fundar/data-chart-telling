import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, WORLD_TEMPERATURE } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `contour` draws marching-squares contour lines/bands from a scalar field -
// mirrors svelteplot's `contour/weather` example: temperature readings at a
// scatter of stations, spatially interpolated into smooth bands. `equirectangular`
// (not `mercator`) here, deliberately: svelteplot's `Contour` mark always
// interpolates over the plot's plain linear x/y scales (see
// `GeoPlot`'s own `Plot.svelte`, where its `<PlotLayout x y>` call pins
// them to the world lon/lat range), never through the active
// projection the way every other geo-aware mark does - `equirectangular`'s x/y
// truly are linear in lon/lat, so it's the one projection where that
// mismatch doesn't produce a visible misalignment between the contour and
// the coastlines under it.

const meta = {
	title: 'Plots/GeoPlot/Markers/Contour',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES,
		coordinates: { projection: 'equirectangular' },
		styles: { fillOpacity: 0, stroke: '#94a3b8' }
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

/**
 * Scatter-interpolation mode - `data` is a scatter of `x`/`y`/`value` rows
 * (here, a simulated world temperature grid - see `WORLD_TEMPERATURE`); the
 * mark spatially interpolates over a grid before running marching squares.
 * `stroke: 'value'` maps each contour level through the plot's color scale.
 */
export const TemperatureBands: Story = {
	args: {
		markers: [
			{
				type: 'contour',
				data: WORLD_TEMPERATURE,
				x: 'lon',
				y: 'lat',
				value: 'tempC',
				thresholds: 9,
				stroke: 'value',
				styles: { strokeWidth: 1.5, strokeOpacity: 0.8 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * Filled bands, drawn *behind* the base map - `fill: 'value'` shades each
 * band (with `blur` smoothing the interpolated field), and `behind: true`
 * puts the whole contour under the base map's own stroke-only coastlines
 * instead of over them, so the borders stay crisp on top of the coloring
 * rather than the fill covering them (markers otherwise always draw over
 * the base map, regardless of position in `markers` - see `GeoSphereMarkerConfig.
 * behind`'s doc comment for the same mechanism).
 */
export const FilledBands: Story = {
	args: {
		markers: [
			{
				type: 'contour',
				behind: true,
				data: WORLD_TEMPERATURE,
				x: 'lon',
				y: 'lat',
				value: 'tempC',
				thresholds: 10,
				fill: 'value',
				blur: 2,
				styles: { fillOpacity: 0.6, strokeOpacity: 0 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** Explicit thresholds - instead of a level count, an explicit array pins the exact temperature bands drawn. */
export const ExplicitThresholds: Story = {
	args: {
		markers: [
			{
				type: 'contour',
				data: WORLD_TEMPERATURE,
				x: 'lon',
				y: 'lat',
				value: 'tempC',
				thresholds: [-20, -10, 0, 10, 20, 30],
				stroke: 'value',
				styles: { strokeWidth: 2 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * `clip: 'land'` masks the filled contour to just the base map's own
 * landmass, leaving the ocean bare - useful when the field only makes sense
 * over land (or the reverse, see `ClippedToOcean`). `behind: true` again
 * keeps the coastlines readable on top of the fill.
 */
export const ClippedToLand: Story = {
	args: {
		// No opaque base-map `fill` here, deliberately - the land-clipped
		// contour sits directly behind these coastlines, occupying the exact
		// same land shape, so an opaque fill on top of it would just paint
		// over it entirely.
		styles: { fillOpacity: 0, stroke: '#94a3b8' },
		markers: [
			{
				type: 'contour',
				behind: true,
				clip: 'land',
				data: WORLD_TEMPERATURE,
				x: 'lon',
				y: 'lat',
				value: 'tempC',
				thresholds: 10,
				fill: 'value',
				blur: 2,
				styles: { fillOpacity: 0.8, strokeOpacity: 0 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** `clip: 'ocean'` masks the same field to just the water instead, leaving land in the base map's own plain fill. */
export const ClippedToOcean: Story = {
	args: {
		styles: { fill: '#f8fafc', fillOpacity: 1, stroke: '#94a3b8' },
		markers: [
			{
				type: 'contour',
				behind: true,
				clip: 'ocean',
				data: WORLD_TEMPERATURE,
				x: 'lon',
				y: 'lat',
				value: 'tempC',
				thresholds: 10,
				fill: 'value',
				blur: 2,
				styles: { fillOpacity: 0.8, strokeOpacity: 0 }
			}
		] satisfies GeoMarkersConfig[]
	}
};
