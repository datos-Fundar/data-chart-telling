import type { Meta, StoryObj } from '@storybook/svelte-vite';
import GeoPlot from '$lib/plots/geo/Plot.svelte';
import RichTooltip from './RichTooltip.svelte';
import { argentinaBicontinental } from '$lib/plots/geo/projections/argentina';
import { ARGENTINA_PROVINCES, type ArgentinaProvinceProps } from './data';

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
    scales: { projection: { type: argentinaBicontinental } },
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
