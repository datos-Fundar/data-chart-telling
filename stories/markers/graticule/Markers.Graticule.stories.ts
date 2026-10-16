import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, EARTHQUAKES } from '../../plots/geo/data';
import GeoPlot from '$lib/plots/geo/Plot.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `graticule` marker (svelteplot's own `Graticule`) - lon/lat gridlines
// drawn over the base map. Geo-only, so `GeoPlot` + `WORLD_COUNTRIES` stand
// in for the empty canvas the rest of `Markers/*` uses - see
// the other stories in this file for it paired with `sphere` on an
// orthographic globe.

const meta = {
	title: 'Markers/Graticule',
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
	data: WORLD_COUNTRIES
} satisfies GeoPlotStory['args'];

/** Default 10° step lon/lat gridlines. */
export const Basic: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [{ type: 'graticule' }] satisfies GeoMarkersConfig[]
	}
};

/** `step` widens the grid; `styles` (a `StrokeStyle`) lightens and dashes it. */
export const CustomStyle: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		coordinates: {
			zoom: true,
			rotate: true
		},
		markers: [
			{
				type: 'graticule',
				step: 20,
				styles: { stroke: '#94a3b8', strokeOpacity: 0.5, strokeDasharray: '2 2' }
			}
		] satisfies GeoMarkersConfig[]
	}
};

// ── Stories ───────────────────────────────────────────────────────────────────

/** Basic graticule - default 10° step lon/lat gridlines drawn over the base map. */
export const GraticuleOnly: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		data: WORLD_COUNTRIES,
		markers: [{ type: 'graticule' }] satisfies GeoMarkersConfig[]
	}
};

/** Custom step + style - a coarser 20° grid in a lighter, dashed stroke. */
export const CustomStepAndStyle: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		data: WORLD_COUNTRIES,
		coordinates: { projection: 'orthographic', rotate: true },
		markers: [
			{
				type: 'graticule',
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
export const SphereOutline: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
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
			{ type: 'graticule', styles: { stroke: '#cbd5e1', strokeOpacity: 0.6 } }
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * Graticule + sphere + raw lon/lat dots - mirrors svelteplot's
 * `geo/earthquakes` example: point data (earthquake epicenters) fed
 * straight in as a `dot` marker over the globe's graticule/sphere.
 */
export const WithEarthquakeDots: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		data: WORLD_COUNTRIES,
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
				styles: { stroke: '#e2e8f0' }
			},
			{
				type: 'dot',
				data: EARTHQUAKES,
				x: 'lon',
				y: 'lat',
				r: (d) => Math.max(3, (d as { magnitude: number }).magnitude * 2),
				styles: { dotFill: '#dc2626', dotFillOpacity: 0.6, dotStroke: '#7f1d1d' }
			}
		] satisfies GeoMarkersConfig[]
	}
};
