import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LineChart from '$lib/charts/line/Chart.svelte';
import LineTimeline from './LineTimeline.svelte';
import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';

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
export const GroupedByZ: Story = {
  args: {
    title: 'PBI vs. Empleo',
    subtitle: 'Agrupado por `z = metric`',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
  },
};

/** Same grouping, now with a discrete legend built from the colour map. */
export const GroupedWithLegend: Story = {
  args: {
    title: 'PBI vs. Empleo',
    subtitle: 'Con leyenda discreta',
    caption: 'La leyenda y el gráfico utilizan el mapa de colores default.',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    legend: [{
      type: 'discrete',
      title: 'Indicador',
      items: [
        {
          name: 'PBI',
          symbol: 'line',
        },{
          name: 'Empleo',
          symbol: 'line',
        }
      ],
      columns: 2,
    }],
  },
};

// ── Timeline ────────────────────────────────────────────────────────────────────

/**
 * Unlike bar/heatmap, a line timeline defaults to a *cumulative* reveal
 * (`filterMode: 'upTo'`) — the line grows up to the selected year instead of
 * collapsing to a single point. Drag the scrubber to watch it grow.
 */
export const WithTimeline: StoryObj = {
  render: () => ({ Component: LineTimeline }),
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
    legend: [{
      type: 'discrete',
      title: 'Indicador',
      items: [
        {
          name: 'PBI',
          symbol: 'line',
        },{
          name: 'Empleo',
          symbol: 'line',
        }
      ],
      columns: 2,
    }],
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
    markers: [
      {
        type: 'ruleX',
        x: 2020,
        style: {
          strokeDasharray: '4 4',
          strokeOpacity: 0.6
        }
      },
    ],
  },
};
