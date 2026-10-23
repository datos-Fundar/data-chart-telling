import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/map/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, FLIGHT_ROUTES } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `link` draws connections between point pairs - mirrors svelteplot's
// `link/spherical-link` example: `curve: 'auto'` traces a great-circle
// (geodesic) arc on a geographic projection instead of a straight line,
// which reads clearly on a global, non-Mercator projection.

const meta = {
	title: 'Plots/Map/GeoPlot/Markers/Link',
	component: GeoPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: WORLD_COUNTRIES,
		styles: { fill: '#e2e8f0', stroke: '#94a3b8' }
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
 * Spherical (geodesic) links on `equal-earth` - `curve: 'auto'` (the
 * default) traces each route as a great-circle arc, visibly curved rather
 * than a straight line between the two endpoints.
 */
export const SphericalLinks: Story = {
	args: {
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
export const LinearLinks: Story = {
	args: {
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
 * visually obvious on a hemisphere view. `coordinates.rotate: true` enables
 * drag-to-rotate (dragging spins the globe instead of panning it, since
 * panning a globe within its own frame isn't useful), and `zoom: true` the
 * wheel zoom - drag the canvas below to see a route's great-circle arc land
 * correctly wherever the globe is currently facing.
 */
export const OnOrthographicGlobe: Story = {
	args: {
		coordinates: {
			projection: { type: 'orthographic', rotate: [60, -10] },
			zoom: true,
			rotate: true
		},
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
export const LiftedLinks: Story = {
	args: {
		coordinates: { projection: 'equal-earth' },
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
export const LiftedOnGlobe: Story = {
	args: {
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
export const LiftedWholeArcs: Story = {
	args: {
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
