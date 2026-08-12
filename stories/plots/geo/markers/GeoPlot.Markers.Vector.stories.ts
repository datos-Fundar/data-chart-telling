import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarker } from '$lib/types/markers/geo';
import { WORLD_COUNTRIES, POPULATION_SHIFT } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `vector` places arrow/spike shapes at points — mirrors svelteplot's
// `vector/shift-map` example: one arrow per capital, sized by magnitude and
// oriented by direction.

const meta = {
  title: 'Plots/GeoPlot/Markers/Vector',
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

/** Basic arrows — `length` and `rotate` accessors size/orient each arrow from the row's own magnitude/direction fields. */
export const Basic: Story = {
  args: {
    markers: [
      {
        type: 'vector',
        data: POPULATION_SHIFT,
        x: 'lon',
        y: 'lat',
        length: 'magnitude',
        rotate: 'direction',
      } satisfies GeoMarker,
    ],
  },
};

/** Spike shape — `shape: 'spike'` draws a thin triangular spike instead of an arrowhead, anchored at its base. */
export const SpikeShape: Story = {
  args: {
    markers: [
      {
        type: 'vector',
        data: POPULATION_SHIFT,
        x: 'lon',
        y: 'lat',
        length: 'magnitude',
        rotate: 'direction',
        shape: 'spike',
        anchor: 'start',
        style: { fill: '#7c3aed' },
      } satisfies GeoMarker,
    ],
  },
};

/** Filled arrow, custom color — `shape: 'arrow-filled'` with a custom fill/stroke. */
export const FilledArrow: Story = {
  args: {
    markers: [
      {
        type: 'vector',
        data: POPULATION_SHIFT,
        x: 'lon',
        y: 'lat',
        length: 'magnitude',
        rotate: 'direction',
        shape: 'arrow-filled',
        style: { fill: '#0891b2', stroke: '#164e63', strokeWidth: 1 },
      } satisfies GeoMarker,
    ],
  },
};
