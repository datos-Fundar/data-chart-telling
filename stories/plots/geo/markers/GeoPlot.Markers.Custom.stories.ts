import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import DotMarker from '$lib/markers/DotMarker.svelte';
import TextMarker from '$lib/markers/TextMarker.svelte';
import type { GeoMarker } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, WEATHER_STATIONS, type WeatherStation } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `component` mounts an arbitrary Svelte component as a mark — the same
// generic mark components other plot kinds already use (`DotMarker`,
// `TextMarker`) work here too: their `x`/`y` accessors just receive
// longitude/latitude instead of a linear axis value, since GeoPlot's `<Plot
// projection>` binds the `x`/`y` channels to the projection scale.

const meta = {
  title: 'Plots/GeoPlot/Markers/Custom',
  component: GeoPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 500,
    data: WORLD_COUNTRIES,
    coordinates: { projection: 'mercator' },
    styles: { fill: '#e2e8f0', stroke: '#94a3b8' },
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

/** `DotMarker` places a dot at every row's lon/lat — an alternative to the built-in `dot` marker type when you want the exact same component other plot kinds use. */
export const WithDotMarker: Story = {
  args: {
    markers: [
      {
        type: 'component',
        component: DotMarker,
        data: WEATHER_STATIONS,
        props: {
          x: (d: WeatherStation) => d.lon,
          y: (d: WeatherStation) => d.lat,
          style: { dotFill: '#0891b2', dotRadius: 6 },
        },
      } satisfies GeoMarker,
    ],
  },
};

/** `TextMarker` renders a label at every row's lon/lat — here, each station's city name above its position. */
export const WithTextMarker: Story = {
  args: {
    markers: [
      {
        type: 'component',
        component: DotMarker,
        data: WEATHER_STATIONS,
        props: {
          x: (d: WeatherStation) => d.lon,
          y: (d: WeatherStation) => d.lat,
          style: { dotFill: '#0891b2', dotRadius: 4 },
        },
      } satisfies GeoMarker,
      {
        type: 'component',
        component: TextMarker,
        data: WEATHER_STATIONS,
        props: {
          x: (d: WeatherStation) => d.lon,
          y: (d: WeatherStation) => d.lat,
          text: (d: WeatherStation) => d.city,
          style: { dy: -10, fontWeight: 'bold' },
        },
      } satisfies GeoMarker,
    ],
  },
};
