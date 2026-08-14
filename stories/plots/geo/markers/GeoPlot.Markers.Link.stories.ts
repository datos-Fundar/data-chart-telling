import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, FLIGHT_ROUTES } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `link` draws connections between point pairs — mirrors svelteplot's
// `link/spherical-link` example: `curve: 'auto'` traces a great-circle
// (geodesic) arc on a geographic projection instead of a straight line,
// which reads clearly on a global, non-Mercator projection.

const meta = {
  title: 'Plots/GeoPlot/Markers/Link',
  component: GeoPlot,
  tags: ['autodocs'],
  args: {
    width: 940,
    height: 500,
    data: WORLD_COUNTRIES,
    styles: { fill: '#e2e8f0', stroke: '#94a3b8' },
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
    height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
    data: { control: false },
    markers: { control: false },
  },
  parameters: {
    docs: { source: { name: 'GeoPlot' } },
  },
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Spherical (geodesic) links on `equal-earth` — `curve: 'auto'` (the
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
        style: { stroke: '#dc2626', strokeWidth: 1.5, strokeOpacity: 0.8 },
      },
    ] satisfies GeoMarkersConfig[],
  },
};

/**
 * Linear links — `curve: 'linear'` forces a straight planar line between
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
        style: { stroke: '#0891b2', strokeWidth: 1.5, strokeOpacity: 0.8 },
      },
    ] satisfies GeoMarkersConfig[],
  },
};

/**
 * Spherical links on an orthographic globe — the geodesic curvature is most
 * visually obvious on a hemisphere view. `coordinates.zoom: true` also enables
 * drag-to-rotate here (orthographic-specific: dragging spins the globe
 * instead of panning it, since panning a globe within its own frame isn't
 * useful) — drag the canvas below to see a route's great-circle arc land
 * correctly wherever the globe is currently facing.
 */
export const OnOrthographicGlobe: Story = {
  args: {
    coordinates: { projection: { type: 'orthographic', rotate: [60, -10] }, zoom: true },
    markers: [
      { type: 'sphere', behind: true, style: { fill: '#f8fafc', stroke: 'currentColor' } },
      { type: 'graticule', style: { stroke: '#e2e8f0' } },
      {
        type: 'link',
        data: FLIGHT_ROUTES,
        x1: 'fromLon',
        y1: 'fromLat',
        x2: 'toLon',
        y2: 'toLat',
        style: { stroke: '#dc2626', strokeWidth: 1.5 },
      },
    ] satisfies GeoMarkersConfig[],
  },
};
