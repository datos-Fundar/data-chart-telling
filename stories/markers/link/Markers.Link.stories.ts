import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, FLIGHT_ROUTES } from '../../plots/map/geo/data';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `link` marker (svelteplot's own `Link`) - a connection between two
// points, `curve: 'auto'` (the default) tracing a great-circle arc on a
// geographic projection instead of a straight line. Geo-only, so `GeoPlot`
// stands in for the empty canvas the rest of `Markers/*` uses - see
// the other stories in this file for the `'linear'` curve and an orthographic
// globe comparison.

const meta = {
	title: 'Markers/Link',
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
	coordinates: { projection: 'equal-earth' },
	styles: { fill: '#e2e8f0', stroke: '#94a3b8' }
} satisfies GeoPlotStory['args'];

/** `x1`/`y1`/`x2`/`y2` are each route's own endpoint fields - the geodesic arc curvature comes from `curve: 'auto'`, the default. */
export const Basic: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'link',
				data: FLIGHT_ROUTES,
				x1: 'fromLon',
				y1: 'fromLat',
				x2: 'toLon',
				y2: 'toLat',
				styles: { stroke: '#dc2626', strokeWidth: 1.5, strokeOpacity: 0.8 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Spherical (geodesic) links on `equal-earth` - `curve: 'auto'` (the
 * default) traces each route as a great-circle arc, visibly curved rather
 * than a straight line between the two endpoints.
 */
export const SphericalLinks: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		coordinates: { projection: 'equal-earth' },
		markers: [
			{
				type: 'link',
				data: FLIGHT_ROUTES,
				x1: 'fromLon',
				y1: 'fromLat',
				x2: 'toLon',
				y2: 'toLat',
				styles: { stroke: '#dc2626', strokeWidth: 1.5, strokeOpacity: 0.8 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * Linear links - `curve: 'linear'` forces a straight planar line between
 * endpoints instead of the geodesic arc. Compare with `SphericalLinks` on
 * the same projection to see the difference.
 */
export const LinearLinks: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		coordinates: { projection: 'equal-earth' },
		markers: [
			{
				type: 'link',
				data: FLIGHT_ROUTES,
				x1: 'fromLon',
				y1: 'fromLat',
				x2: 'toLon',
				y2: 'toLat',
				curve: 'linear',
				styles: { stroke: '#dc2626', strokeWidth: 1.5, strokeOpacity: 0.8 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/**
 * Spherical links on an orthographic globe - the geodesic curvature is most
 * visually obvious on a hemisphere view. `coordinates.zoom: true` also enables
 * drag-to-rotate here (orthographic-specific: dragging spins the globe
 * instead of panning it, since panning a globe within its own frame isn't
 * useful) - drag the canvas below to see a route's great-circle arc land
 * correctly wherever the globe is currently facing.
 */
export const OnOrthographicGlobe: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		coordinates: { projection: { type: 'orthographic', rotate: [60, -10] }, zoom: true },
		markers: [
			{ type: 'sphere', behind: true, styles: { fill: '#f8fafc', stroke: 'currentColor' } },
			{ type: 'graticule', behind: true, styles: { stroke: '#e2e8f0' } },
			{
				type: 'link',
				data: FLIGHT_ROUTES,
				x1: 'fromLon',
				y1: 'fromLat',
				x2: 'toLon',
				y2: 'toLat',
				styles: { stroke: '#dc2626', strokeWidth: 1.5 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** `altitude` lifts each arc off the map: on a flat map it bows upward, by a fraction of the distance between the route's ends. */
export const LiftedLinks: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		markers: [
			{
				type: 'link',
				data: FLIGHT_ROUTES,
				x1: 'fromLon',
				y1: 'fromLat',
				x2: 'toLon',
				y2: 'toLat',
				altitude: 0.25,
				styles: { stroke: '#dc2626', strokeWidth: 1.5 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** On a globe `altitude` is a fraction of the radius: the arcs leave the surface at their ends and rise off it in between. */
export const LiftedOnGlobe: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		coordinates: { projection: { type: 'orthographic', rotate: [60, -10] }, rotate: true },
		markers: [
			{ type: 'sphere', behind: true, styles: { fill: '#f8fafc', stroke: 'currentColor' } },
			{ type: 'graticule', behind: true, styles: { stroke: '#e2e8f0' } },
			{
				type: 'link',
				data: FLIGHT_ROUTES,
				x1: 'fromLon',
				y1: 'fromLat',
				x2: 'toLon',
				y2: 'toLat',
				altitude: 0.5,
				styles: { stroke: '#dc2626', strokeWidth: 1.5 }
			}
		] satisfies GeoMarkersConfig[]
	}
};

/** `occlusion: 'globe'` keeps each arc whole: it disappears only where the globe itself covers it, instead of being cut at the horizon as the globe turns. */
export const LiftedWholeArcs: GeoPlotStory = {
	render: renderGeoPlot,
	args: {
		...GEO_PLOT_ARGS,
		coordinates: { projection: { type: 'orthographic', rotate: [60, -10] }, rotate: true },
		markers: [
			{ type: 'sphere', behind: true, styles: { fill: '#f8fafc', stroke: 'currentColor' } },
			{ type: 'graticule', behind: true, styles: { stroke: '#e2e8f0' } },
			{
				type: 'link',
				data: FLIGHT_ROUTES,
				x1: 'fromLon',
				y1: 'fromLat',
				x2: 'toLon',
				y2: 'toLat',
				altitude: 0.25,
				occlusion: 'globe',
				styles: { stroke: '#dc2626', strokeWidth: 1.5 }
			}
		] satisfies GeoMarkersConfig[]
	}
};
