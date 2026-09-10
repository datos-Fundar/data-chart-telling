import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapChart from '$lib/charts/heatmap/Chart.svelte';
import HeatmapTimeline from './HeatmapTimeline.svelte';
import { HEAT_CELLS, type HeatCell } from '../../data/heat-cells';
import type { ContinuousLegendSection } from '$lib/types/layout/legend';

const maxPct = Math.max(...HEAT_CELLS.map((d) => d.pct));

const continuousLegend: ContinuousLegendSection[] = [
  {
    type: 'continuous',
    title: 'Porcentaje',
    min: 0,
    max: maxPct,
    ticks: [maxPct * 0.5].map((v) => Math.round(v * 1000) / 1000),
    format: (v) => `${(v * 100).toFixed(0)}%`,
    width: 200,
  },
];

const meta = {
  title: 'Charts/HeatmapChart',
  component: HeatmapChart,
  tags: ['autodocs'],
  args: {
    width: 620,
    height: 520,
    x: 'rooms',
    y: 'people',
    z: 'pct',
    scales: { x: { label: 'Ambientes' }, y: { label: 'Personas' } },
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 1000, step: 20 } },
    height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
    data: { control: false },
    x: { control: false },
    y: { control: false },
    z: { control: false },
    facet: { control: false },
    timeline: { control: false },
    legend: { control: false },
  },
} satisfies Meta<typeof HeatmapChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A static heatmap for one scenario/year, with a continuous legend. Shows that
 * the *same* container + legend chrome wraps a completely different plot.
 */
export const Default: Story = {
  args: {
    title: 'Hogares por personas y ambientes',
    subtitle: 'Escenario Base · 2022',
    data: HEAT_CELLS.filter((d) => d.scenario === 'Baseline' && d.year === 2022),
    z: 'pct',
    legend: continuousLegend,
    styles: { values: { format: (v: number) => `${(v * 100).toFixed(0)}%` } },
  },
};

/**
 * `interactive: { enabled: true }` on the continuous legend adds drag
 * handles to its lower/upper edge — dragging narrows the visible range and
 * mutes (`disabledStyle`) whatever cell falls outside it. `mode: 'filter'`
 * (the default) keeps the color ramp's original domain, so in-range cells
 * keep exactly the color they'd have without any filter active.
 */
export const InteractiveLegendFilter: Story = {
  args: {
    title: 'Hogares por personas y ambientes',
    subtitle: "Leyenda interactiva · mode: 'filter'",
    caption: 'Arrastrá los extremos de la leyenda: el rango angosto solo excluye celdas, no reescala el color.',
    data: HEAT_CELLS.filter((d) => d.scenario === 'Baseline' && d.year === 2022),
    z: 'pct',
    tooltip: true,
    legend: [{ ...continuousLegend[0], interactive: { enabled: true, mode: 'filter' } }],
    styles: { values: { format: (v: number) => `${(v * 100).toFixed(0)}%` } },
  },
};

/** Same drag interaction, but `mode: 'rescale'` reprojects the color ramp onto the narrowed range. */
export const InteractiveLegendRescale: Story = {
  args: {
    title: 'Hogares por personas y ambientes',
    subtitle: "Leyenda interactiva · mode: 'rescale'",
    caption: 'Mismo drag que el ejemplo anterior, pero el color se reproyecta sobre el nuevo rango.',
    data: HEAT_CELLS.filter((d) => d.scenario === 'Baseline' && d.year === 2022),
    z: 'pct',
    legend: [{ ...continuousLegend[0], interactive: { enabled: true, mode: 'rescale' } }],
    styles: { values: { format: (v: number) => `${(v * 100).toFixed(0)}%` } },
  },
};

/** Interactive year timeline (vertical gutter), exactly like the bar timeline. */
export const WithTimeline: StoryObj = {
  render: () => ({ Component: HeatmapTimeline }),
};

/** Timeline + facet: one heatmap per scenario, sharing the year scrubber. */
export const TimelineAndFacet: StoryObj = {
  render: () => ({ Component: HeatmapTimeline, props: { faceted: true } }),
};

/** Static facets without a timeline (year fixed at 2022). */
export const Faceted: Story = {
  args: {
    title: 'Hogares por escenario',
    subtitle: '2022 · facetado por escenario',
    data: HEAT_CELLS.filter((d) => d.year === 2022),
    z: 'pct',
    legend: continuousLegend,
    styles: { values: { format: (v: number) => `${(v * 100).toFixed(0)}%` } },
    facet: { by: 'scenario' as keyof HeatCell, columns: 2 },
  },
};
