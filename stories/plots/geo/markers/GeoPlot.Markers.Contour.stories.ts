import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarker } from '$lib/types/plots/geo/markers';
import { WORLD_COUNTRIES, WEATHER_STATIONS } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `contour` draws marching-squares contour lines/bands from a scalar field —
// mirrors svelteplot's `contour/weather` example: temperature readings at a
// scatter of stations, spatially interpolated into smooth bands.

const meta = {
  title: 'Plots/GeoPlot/Markers/Contour',
  component: GeoPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 500,
    data: WORLD_COUNTRIES,
    scales: { projection: 'mercator' },
    styles: { fillOpacity: 0, stroke: '#94a3b8' },
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

/**
 * Scatter-interpolation mode — `data` is a scatter of `x`/`y`/`value` rows
 * (here, weather stations' lon/lat/temperature); the mark spatially
 * interpolates over a grid before running marching squares. `stroke:
 * 'value'` maps each contour level through the plot's color scale.
 */
export const TemperatureBands: Story = {
  args: {
    markers: [
      {
        type: 'contour',
        data: WEATHER_STATIONS,
        x: 'lon',
        y: 'lat',
        value: 'tempC',
        thresholds: 6,
        stroke: 'value',
        style: { strokeWidth: 1.5, strokeOpacity: 0.8 },
      } satisfies GeoMarker,
    ],
  },
};

/** Filled bands — `fill: 'value'` shades each band instead of only outlining it, with `blur` smoothing the interpolated field. */
export const FilledBands: Story = {
  args: {
    markers: [
      {
        type: 'contour',
        data: WEATHER_STATIONS,
        x: 'lon',
        y: 'lat',
        value: 'tempC',
        thresholds: 8,
        fill: 'value',
        blur: 2,
        style: { fillOpacity: 0.5, strokeOpacity: 0 },
      } satisfies GeoMarker,
    ],
  },
};

/** Explicit thresholds — instead of a level count, an explicit array pins the exact temperature bands drawn. */
export const ExplicitThresholds: Story = {
  args: {
    markers: [
      {
        type: 'contour',
        data: WEATHER_STATIONS,
        x: 'lon',
        y: 'lat',
        value: 'tempC',
        thresholds: [15, 20, 25, 30],
        stroke: 'value',
        style: { strokeWidth: 2 },
      } satisfies GeoMarker,
    ],
  },
};
