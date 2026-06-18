import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LineChart from '$lib/charts/kinds/LineChart.svelte';
import { discreteLegendFromColors } from '$lib/charts/utils/legend';
import { TIME_SERIES, METRIC_COLORS, type SeriesPoint } from './data';

const meta = {
  title: 'Charts/LineChart',
  component: LineChart,
  tags: ['autodocs'],
  args: {
    width: 680,
    height: 460,
    data: TIME_SERIES,
    x: 'year',
    y: 'value',
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 1000, step: 20 } },
    height: { control: { type: 'range', min: 240, max: 700, step: 20 } },
    data: { control: false },
    x: { control: false },
    y: { control: false },
    z: { control: false },
    segments: { control: false },
    colors: { control: false },
    facet: { control: false },
    timeline: { control: false },
    legend: { control: false },
  },
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Container chrome ────────────────────────────────────────────────────────────

/** A single ungrouped series wrapped in the full chart container. */
export const Default: Story = {
  args: {
    title: 'Indicador económico',
    subtitle: 'Región Norte · serie única',
    caption: 'Fuente: datos sintéticos de demostración.',
    data: TIME_SERIES.filter((d) => d.region === 'Norte' && d.metric === 'PBI'),
  },
};

// ── Grouping (z) ────────────────────────────────────────────────────────────────

/**
 * `z` groups the flat rows into one line per metric. Colours come from the
 * `colors` map (group → colour); no manual `segments` needed.
 */
export const GroupedByZ: Story = {
  args: {
    title: 'PBI vs. Empleo',
    subtitle: 'Agrupado por `z = metric`',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    colors: METRIC_COLORS,
  },
};

/** Same grouping, now with a discrete legend built from the colour map. */
export const GroupedWithLegend: Story = {
  args: {
    title: 'PBI vs. Empleo',
    subtitle: 'Con leyenda discreta',
    caption: 'La leyenda se genera desde el mapa de colores.',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    colors: METRIC_COLORS,
    legend: [discreteLegendFromColors(METRIC_COLORS, { title: 'Indicador' })],
  },
};

// ── Faceting ────────────────────────────────────────────────────────────────────

/**
 * `facet.by` splits into small multiples (one plot per region); `z` still
 * groups within each facet. A single shared legend sits above the grid.
 */
export const Faceted: Story = {
  args: {
    title: 'PBI vs. Empleo por región',
    subtitle: 'Facetado por región',
    data: TIME_SERIES,
    z: 'metric' as keyof SeriesPoint,
    colors: METRIC_COLORS,
    legend: [discreteLegendFromColors(METRIC_COLORS, { title: 'Indicador' })],
    facet: { by: 'region' as keyof SeriesPoint, columns: 2 },
  },
};

// ── Markers ─────────────────────────────────────────────────────────────────────

/** Rule markers pass straight through to the underlying line plot. */
export const WithMarkers: Story = {
  args: {
    title: 'Con marcadores',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    colors: METRIC_COLORS,
    markers: [
      { type: 'ruleX', x: 2020, style: { stroke: '#dc2626', strokeDasharray: '4 4', strokeOpacity: 0.6 } },
    ],
  },
};
