import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import RichTooltip from './RichTooltip.svelte';
import { argentinaBicontinental } from '$lib/layout/coordinates/projections/argentina';
import { ARGENTINA_PROVINCES, CABA_COMUNAS, type ArgentinaProvinceProps, type CabaComunaProps } from './data';
import type { GeoMarkersConfig } from '$lib/types/markers/geo';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/GeoPlot/Tooltip',
  component: GeoPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 500,
    data: ARGENTINA_PROVINCES,
    featureId: (f) => (f.properties as ArgentinaProvinceProps).nombre,
    coordinates: { projection: { type: argentinaBicontinental } },
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 950, step: 20 } },
    height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
    data: { control: false },
    scales: { control: false },
    tooltip: { control: false },
  },
  parameters: {
    docs: { source: { name: 'GeoPlot' } },
  },
} satisfies Meta<typeof GeoPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No tooltip — hovering over the map produces no floating label. The
 * default when `tooltip` is omitted.
 */
export const NoTooltip: Story = {
  args: {},
};

/**
 * Basic tooltip — `format` receives the nearest hovered feature. Hover
 * matching is always 2-D/punctual (nearest feature centroid) for GeoPlot,
 * since a map has no x-only/y-only axis to match along.
 *
 * A standalone `GeoPlot` (not inside a `<Chart>`) uses `facetId: ''` and
 * `sync: false` — no cross-facet broadcasting applies.
 */
export const BasicTooltip: Story = {
  args: {
    tooltip: {
      facetId: '',
      sync: false,
      format: (f) => (f.properties as ArgentinaProvinceProps).nombre,
    },
  },
};

/**
 * Rich multi-line format — `\n` splits the tooltip string across lines,
 * with the portion before the first break used as the heading.
 */
export const RichFormat: Story = {
  args: {
    tooltip: {
      facetId: '',
      sync: false,
      format: (f) => {
        const { nombre, population } = f.properties as ArgentinaProvinceProps;
        return `${nombre}\nPopulation: ${population.toLocaleString()}`;
      },
    },
  },
};

/** Computed tooltip text — `format` can derive any string from the feature, here a share of the total population across the fixture. */
export const ComputedFormat: Story = {
  args: {
    tooltip: {
      facetId: '',
      sync: false,
      format: (f) => {
        const { nombre, population } = f.properties as ArgentinaProvinceProps;
        const total = ARGENTINA_PROVINCES.reduce(
          (sum, p) => sum + (p.properties as ArgentinaProvinceProps).population,
          0,
        );
        const share = ((population / total) * 100).toFixed(1);
        return `${nombre}: ${share}% of shown population`;
      },
    },
  },
};

/**
 * Fully custom tooltip markup via `content` — replaces the default floating
 * label entirely with an arbitrary snippet: a header, a colour swatch tied
 * to the choropleth ramp, and a footnote. `format` is still required by the
 * type but is ignored once `content` is set.
 *
 * See `RichTooltip.svelte` for the markup — the library automatically drops
 * its default dark tooltip box whenever `content` is set.
 */
export const CustomContent: StoryObj = {
  render: () => ({ Component: RichTooltip }),
};

const TIERRA_DEL_FUEGO = 'Tierra del Fuego, Antártida e Islas del Atlántico Sur';

/** See `Markers/Inset`'s `isAntarcticPart` for why this predicate is needed (splits one feature's geometry between the main map and an inset). */
const isAntarcticPart = (part: { centroid: [number, number] }, feature: { __id: string }) =>
  feature.__id === TIERRA_DEL_FUEGO && (part.centroid[1] < -60 || part.centroid[0] > -50);

/**
 * An `inset` marker can carry its own `tooltip`, independent of the plot's
 * own — scoped to just what that inset draws, matched against its own
 * local mini-projection instead of the main map's. This matters because the
 * main map's hover (`Pointer`, driving every other story in this file) only
 * ever matches the main projection's own feature positions: it has no way
 * to reach content an inset renders elsewhere, at its own scale, so without
 * this an inset would either show no tooltip or (worse) the wrong one — the
 * nearest *main-map* feature to that screen corner, not whatever the inset
 * itself is actually displaying there.
 *
 * Same two-inset layout as `Markers/Inset`'s `CombinedInsets` — CABA's own
 * comunas (a separate, finer-grained dataset than the single CABA feature in
 * `ARGENTINA_PROVINCES`) and the Antarctic/South Atlantic sector — but each
 * panel now floats its own tooltip on hover, in addition to the main map's.
 */
export const TooltipOnInsets: Story = {
  args: {
    coordinates: { projection: { type: 'mercator', domain: 'data' } },
    excludeParts: isAntarcticPart,
    tooltip: {
      facetId: '',
      sync: false,
      format: (f) => (f.properties as ArgentinaProvinceProps).nombre,
    },
    markers: [
      {
        type: 'inset',
        location: 'right-middle',
        data: CABA_COMUNAS,
        style: { stroke: '#dc2626', strokeWidth: 1 },
        tooltip: {
          format: (f) => {
            const { comuna, barrios } = f.properties as CabaComunaProps;
            return `Comuna ${comuna}\n${barrios}`;
          },
        },
      },
      {
        type: 'inset',
        location: 'bottom-right',
        features: [TIERRA_DEL_FUEGO],
        featurePartsFilter: isAntarcticPart,
        projection: { type: 'azimuthal-equidistant', rotate: [49.5, 90] },
        tooltip: {
          format: () => 'Antártida e Islas del Atlántico Sur',
        },
      },
    ] satisfies GeoMarkersConfig[],
  },
};
