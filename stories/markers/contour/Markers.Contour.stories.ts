import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES } from '$datasets/world-countries';
import { WORLD_TEMPERATURE } from '$datasets';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `contour` marker (svelteplot's own `Contour`) - marching-squares
// contour lines/bands spatially interpolated from a scalar field. Geo-only,
// so `GeoPlot` stands in for the empty canvas the rest of `Markers/*` uses.
// `equirectangular` specifically (not `mercator`) - svelteplot's `Contour`
// always interpolates over plain linear x/y, which only lines up with the
// coastlines under that one projection - see the other stories in this file
// for `behind`/`clip`/filled-band variants.

const meta = {
	title: 'Markers/Contour',
	component: GeoPlot,
	tags: ['autodocs'],
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	}
} satisfies Meta<typeof GeoPlot>;

export default meta;

// Each story renders its own plot (the same marker works on any plot kind), so the
// host, its base args and its story type are declared per host below.
type GeoPlotStory = StoryObj<typeof GeoPlot>;
const renderGeoPlot: GeoPlotStory['render'] = (args) => ({ Component: GeoPlot, props: args });

const GEO_PLOT_ARGS = {
	width: 940,
	height: 500,
	data: WORLD_COUNTRIES,
	coordinates: { projection: 'equirectangular' },
	styles: { fillOpacity: 0, stroke: '#94a3b8' }
} satisfies GeoPlotStory['args'];

/** `value` is the scalar field's own field key; `stroke: 'value'` maps each contour level through the plot's color scale. */
export const Basic: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'contour',
				data: WORLD_TEMPERATURE,
				x: 'lon',
				y: 'lat',
				value: 'tempC',
				blur: 2,
				thresholds: 9,
				stroke: 'value',
				styles: { strokeWidth: 1.5, strokeOpacity: 0.8 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Scatter-interpolation mode - `data` is a scatter of `x`/`y`/`value` rows
 * (here, the 2025 mean temperature on a world grid - see `WORLD_TEMPERATURE`); the
 * mark spatially interpolates over a grid before running marching squares.
 * `stroke: 'value'` maps each contour level through the plot's color scale.
 */
export const TemperatureBands: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'contour',
				data: WORLD_TEMPERATURE,
				x: 'lon',
				y: 'lat',
				value: 'tempC',
				blur: 2,
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
 * the base map, regardless of position in `markers` - see `GeoSphereMarkerConfig`
 * behind's doc comment for the same mechanism).
 */
export const FilledBands: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
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
export const ExplicitThresholds: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'contour',
				data: WORLD_TEMPERATURE,
				x: 'lon',
				y: 'lat',
				value: 'tempC',
				blur: 2,
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
export const ClippedToLand: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
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
export const ClippedToOcean: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
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

// ── Interpolation ─────────────────────────────────────────────────────────────

/** The same scatter drawn with one `interpolate` mode - how the grid is filled in between the samples before the contours are traced. */
const interpolated = (
	interpolate: 'none' | 'nearest' | 'barycentric' | 'random-walk'
): GeoPlotStory => ({
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'contour',
				interpolate,
				data: WORLD_TEMPERATURE,
				x: 'lon',
				y: 'lat',
				value: 'tempC',
				thresholds: 10,
				fill: 'value',
				styles: { fillOpacity: 0.6, strokeOpacity: 0 }
			}
		] satisfies GeoMarkersConfig[]
	}
});

/** `'none'` leaves the grid empty between samples, so a sparse scatter like this one traces no contours at all - it is for data that already is a dense grid. */
export const InterpolateNone: GeoPlotStory = interpolated('none');

/** `'nearest'` (the default for a scatter) gives each cell its closest sample's value: flat patches with abrupt edges. */
export const InterpolateNearest: GeoPlotStory = interpolated('nearest');

/** `'barycentric'` blends the three samples around each cell (a Delaunay triangulation): smooth, continuous bands. */
export const InterpolateBarycentric: GeoPlotStory = interpolated('barycentric');

/** `'random-walk'` fills each cell by a random walk to the samples: smooth overall, but the contours come out noticeably rougher and noisier. */
export const InterpolateRandomWalk: GeoPlotStory = interpolated('random-walk');
