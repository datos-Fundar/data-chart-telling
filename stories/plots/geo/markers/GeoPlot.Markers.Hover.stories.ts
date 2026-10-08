import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';
import { argentinaBicontinental } from '$lib/layout/coordinates/projections/argentina';
import { ARGENTINA_PROVINCES, type ArgentinaProvinceProps } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Defaults to `argentinaBicontinental` (see the `Scales`/`Styles` stories)
// like every other `ARGENTINA_PROVINCES`-based story file, instead of the
// bare `equal-earth` default a plot gets with no `coordinates.projection` at
// all - `equal-earth`'s whole-world extent leaves far more empty frame
// around the mainland than the bicontinental projection's tight fit.

const meta = {
  title: 'Plots/GeoPlot/Markers/Hover',
  component: GeoPlot,
  tags: ['autodocs'],
  args: {
    width: 940,
    height: 500,
    data: ARGENTINA_PROVINCES,
    featureId: (f) => (f.properties as ArgentinaProvinceProps).nombre,
    coordinates: { projection: { type: argentinaBicontinental } },
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

/** Basic hover marker - the feature under the cursor gets a neutral translucent fill (the shared `hover.area` theme default). Matching follows the browser's own SVG hit-testing, not distance to a centroid. */
export const Basic: Story = {
  args: {
    markers: [{ type: 'geo-hover' }] satisfies GeoMarkersConfig[],
  },
};

/** Custom style - overrides the hovered feature's stroke. */
export const CustomStyle: Story = {
  args: {
    markers: [
      { type: 'geo-hover', styles: { stroke: '#7f1d1d', strokeWidth: 3 } },
    ] satisfies GeoMarkersConfig[],
  },
};

/** Filled highlight - a semi-transparent fill on top of the feature's own choropleth color. */
export const FilledHighlight: Story = {
  args: {
    markers: [
      { type: 'geo-hover', styles: { fill: '#facc15', fillOpacity: 0.4, stroke: '#a16207', strokeWidth: 2 } },
    ] satisfies GeoMarkersConfig[],
  },
};
