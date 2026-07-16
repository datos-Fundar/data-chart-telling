import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarker } from '$lib/types/plots/geo/markers';
import { ARGENTINA_PROVINCES, type ArgentinaProvinceProps } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/GeoPlot/Markers/Hover',
  component: GeoPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 500,
    data: ARGENTINA_PROVINCES,
    featureId: (f) => (f.properties as ArgentinaProvinceProps).nombre,
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
 * Basic hover marker — a dot + label appears on the nearest feature's
 * centroid as the cursor moves over the map. Matching is always 2-D/nearest-
 * feature for GeoPlot — there's no x-only/y-only axis to restrict it to.
 */
export const Basic: Story = {
  args: {
    markers: [{ type: 'hover' } satisfies GeoMarker],
  },
};

/** No labels — `showLabels: false` keeps just the highlight dot, no text next to it. */
export const WithoutLabels: Story = {
  args: {
    markers: [{ type: 'hover', showLabels: false } satisfies GeoMarker],
  },
};

/** Custom format — the label text is derived from the matched point instead of the default feature id. */
export const CustomFormat: Story = {
  args: {
    markers: [
      {
        type: 'hover',
        format: (p) => `📍 ${p.label}`,
      } satisfies GeoMarker,
    ],
  },
};

/** Custom dot/font style — overrides the highlight dot's fill/radius and the label's font. */
export const CustomStyle: Story = {
  args: {
    markers: [
      {
        type: 'hover',
        dotStyle: { dotFill: '#dc2626', dotRadius: 8, dotStrokeOpacity: 1, dotStroke: '#7f1d1d' },
        fontStyle: { fill: '#7f1d1d', fontWeight: 'bold', fontSize: 14 },
      } satisfies GeoMarker,
    ],
  },
};
