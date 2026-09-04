import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterChart from '$lib/charts/scatter/Chart.svelte';
import { COUNTRIES, type CountryPoint } from '../../plots/scatter/data';

const meta = {
  title: 'Charts/ScatterChart',
  component: ScatterChart,
  tags: ['autodocs'],
  args: {
    width: 680,
    height: 460,
    data: COUNTRIES,
    x: 'gdpPerCapita',
    y: 'lifeExpectancy',
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 1000, step: 20 } },
    height: { control: { type: 'range', min: 240, max: 700, step: 20 } },
    data: { control: false },
    x: { control: false },
    y: { control: false },
    z: { control: false },
    r: { control: false },
    segments: { control: false },
    facet: { control: false },
    legend: { control: false },
  },
} satisfies Meta<typeof ScatterChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Container chrome ────────────────────────────────────────────────────────────

/** All countries in one ungrouped point cloud, wrapped in the full chart container. */
export const Default: Story = {
  args: {
    title: 'Riqueza y esperanza de vida',
    subtitle: 'PBI per cápita vs. esperanza de vida',
    caption: 'Fuente: datos sintéticos de demostración.',
  },
};

// ── Grouping (z) + legend ────────────────────────────────────────────────────────

/** `z` groups countries by region into one point cloud per region, with a discrete legend built from the same colour map. */
export const GroupedWithLegend: Story = {
  args: {
    title: 'Riqueza y esperanza de vida por región',
    z: 'region' as keyof CountryPoint,
    legend: [{
      type: 'discrete',
      title: 'Región',
      items: [
        { name: 'Americas', symbol: 'circle' },
        { name: 'Europe', symbol: 'circle' },
        { name: 'Asia', symbol: 'circle' },
        { name: 'Africa', symbol: 'circle' },
      ],
      columns: 4,
    }],
  },
};

/**
 * `interactive: { enabled: true }` on the legend turns each region into a
 * toggle: click to dim that region's points in place (and drop them from
 * hover/tooltip), click again to bring them back.
 */
export const InteractiveLegend: Story = {
  args: {
    title: 'Riqueza y esperanza de vida por región',
    subtitle: 'Leyenda interactiva — click en una región para ocultarla',
    z: 'region' as keyof CountryPoint,
    tooltip: true,
    legend: [{
      type: 'discrete',
      title: 'Región',
      interactive: { enabled: true, disabledStyle: { opacity: 0.08 } },
      items: [
        { name: 'Americas', symbol: 'circle' },
        { name: 'Europe', symbol: 'circle' },
        { name: 'Asia', symbol: 'circle' },
        { name: 'Africa', symbol: 'circle' },
      ],
      columns: 4,
    }],
  },
};

// ── Bubble sizing ─────────────────────────────────────────────────────────────

/** `r` sizes every bubble by population, through its own auto sqrt scale (bubble area, not radius, stays proportional — no manual math needed). */
export const Bubble: Story = {
  args: {
    title: 'Riqueza, esperanza de vida y población',
    z: 'region' as keyof CountryPoint,
    r: 'population' as keyof CountryPoint,
  },
};

// ── Faceting ────────────────────────────────────────────────────────────────────

/** `facet.by` splits into small multiples, one plot per region. */
export const Faceted: Story = {
  args: {
    title: 'Riqueza y esperanza de vida por región',
    subtitle: 'Facetado por región',
    facet: { by: 'region' as keyof CountryPoint, columns: 2 },
  },
};

// ── Markers ─────────────────────────────────────────────────────────────────────

/** Rule markers pass straight through to the underlying scatter plot — quadrant dividers at the median x/y. */
export const WithMarkers: Story = {
  args: {
    title: 'Con líneas divisorias',
    z: 'region' as keyof CountryPoint,
    markers: [
      { type: 'rule', axis: 'x', value: 15, style: { strokeDasharray: '4 4', strokeOpacity: 0.5 } },
      { type: 'rule', axis: 'y', value: 75, style: { strokeDasharray: '4 4', strokeOpacity: 0.5 } },
    ],
  },
};
