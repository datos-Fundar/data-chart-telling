import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, WEATHER_STATIONS, type WeatherStation } from '../data';

// `x`/`y`/`value` below use the field-key shorthand (`'lon'` instead of
// `(d) => (d as WeatherStation).lon`) — see `DotMarkerConfig`'s own doc.

// ── Meta ──────────────────────────────────────────────────────────────────────
// `dot` places point markers by longitude/latitude — mirrors svelteplot's
// `dot/weather` example: one dot per weather station, sized/colored by
// temperature.

const meta = {
  title: 'Plots/GeoPlot/Markers/Dot',
  component: GeoPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 500,
    data: WORLD_COUNTRIES,
    coordinates: { projection: 'mercator' },
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

/** Basic dots — one fixed-size, fixed-color dot per weather station. */
export const Basic: Story = {
  args: {
    styles: { fill: '#e2e8f0', stroke: '#94a3b8' },
    markers: [
      { type: 'dot', data: WEATHER_STATIONS, x: 'lon', y: 'lat' },
    ] satisfies GeoMarkersConfig[],
  },
};

/** Sized by value — `r` maps each station's temperature to the dot's radius, so hotter cities draw a bigger circle. */
export const SizedByTemperature: Story = {
  args: {
    styles: { fill: '#e2e8f0', stroke: '#94a3b8' },
    markers: [
      {
        type: 'dot',
        data: WEATHER_STATIONS,
        x: 'lon',
        y: 'lat',
        r: (d) => (d as WeatherStation).tempC / 2,
        style: { dotFill: '#f97316', dotFillOpacity: 0.7, dotStroke: '#c2410c' },
      },
    ] satisfies GeoMarkersConfig[],
  },
};

/**
 * Colored by value — the marker's own `value` accessor drives a color ramp
 * (`style.colors.min`/`max`, same mechanism as the base map's choropleth
 * ramp) so each dot's fill reflects its station's temperature, mirroring
 * `dot/weather`'s color-by-temperature encoding.
 */
export const ColoredByTemperature: Story = {
  args: {
    styles: { fillOpacity: 0.3, stroke: '#94a3b8' },
    markers: [
      {
        type: 'dot',
        data: WEATHER_STATIONS,
        x: 'lon',
        y: 'lat',
        r: 8,
        value: 'tempC',
        style: { colors: { min: '#3b82f6', max: '#dc2626' }, dotStroke: '#1e293b' },
      },
    ] satisfies GeoMarkersConfig[],
  },
};
