import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarker } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, EARTHQUAKES } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `graticule` (lon/lat gridlines) and `sphere` (the outer globe outline) are
// the simplest GeoPlot markers — mirrors svelteplot's `geo/earthquakes`
// example, which combines both with raw lon/lat point data.

const meta = {
  title: 'Plots/GeoPlot/Markers/Graticule',
  component: GeoPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 500,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 950, step: 20 } },
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

/** Basic graticule — default 10° step lon/lat gridlines drawn over the base map. */
export const Basic: Story = {
  args: {
    data: WORLD_COUNTRIES,
    markers: [{ type: 'graticule' } satisfies GeoMarker],
  },
};

/** Custom step + style — a coarser 20° grid in a lighter, dashed stroke. */
export const CustomStepAndStyle: Story = {
  args: {
    data: WORLD_COUNTRIES,
    scales: { projection: 'orthographic' },
    markers: [
      {
        type: 'graticule',
        step: 20,
        style: { stroke: '#94a3b8', strokeOpacity: 0.5, strokeDasharray: '2 2' },
      } satisfies GeoMarker,
    ],
  },
};

/**
 * Sphere + graticule on an orthographic globe — the `sphere` marker draws
 * the outer outline of the whole earth, which only reads clearly on a
 * hemisphere-style projection like `orthographic`. `behind: true` is what
 * makes the fill work as ocean-colored background here rather than an
 * opaque layer painted over every country on top of it — markers otherwise
 * always draw over the base map regardless of their position in `markers`.
 * `styles.zoom: true` also enables drag-to-rotate on an orthographic
 * projection — drag the globe below to spin it.
 */
export const SphereOutline: Story = {
  args: {
    data: WORLD_COUNTRIES,
    scales: { projection: { type: 'orthographic', rotate: [60, 20] } },
    styles: { zoom: true },
    markers: [
      {
        type: 'sphere',
        behind: true,
        style: { fill: '#eff6ff', stroke: 'currentColor', strokeWidth: 1 },
      } satisfies GeoMarker,
      { type: 'graticule', style: { stroke: '#cbd5e1', strokeOpacity: 0.6 } } satisfies GeoMarker,
    ],
  },
};

/**
 * Graticule + sphere + raw lon/lat dots — mirrors svelteplot's
 * `geo/earthquakes` example: point data (earthquake epicenters) fed
 * straight in as a `dot` marker over the globe's graticule/sphere.
 */
export const WithEarthquakeDots: Story = {
  args: {
    data: WORLD_COUNTRIES,
    scales: { projection: { type: 'orthographic', rotate: [65, 15] } },
    styles: { zoom: true },
    markers: [
      { type: 'sphere', behind: true, style: { fill: '#f8fafc', stroke: 'currentColor' } } satisfies GeoMarker,
      { type: 'graticule', style: { stroke: '#e2e8f0' } } satisfies GeoMarker,
      {
        type: 'dot',
        data: EARTHQUAKES,
        x: 'lon',
        y: 'lat',
        r: (d) => Math.max(3, (d as { magnitude: number }).magnitude * 2),
        style: { dotFill: '#dc2626', dotFillOpacity: 0.6, dotStroke: '#7f1d1d' },
      } satisfies GeoMarker,
    ],
  },
};
