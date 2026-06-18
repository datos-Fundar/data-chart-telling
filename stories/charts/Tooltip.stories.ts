import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LineChart from '$lib/charts/kinds/LineChart.svelte';
import TooltipSyncDemo from './wrappers/TooltipSyncDemo.svelte';
import { TIME_SERIES, METRIC_COLORS, type SeriesPoint } from './data';

/**
 * Every chart kind takes a `tooltip` prop to enable hover tooltips:
 *
 * ```svelte
 * <LineChart … tooltip />                          <!-- defaults -->
 * <LineChart … tooltip={{ sync: 'x' }} />          <!-- sync across facets by x -->
 * <HeatmapChart … tooltip={{ sync: 'xy', format }} />
 * ```
 *
 * When faceted, hovering one panel highlights the matching point in the others.
 * `sync` chooses what "matching" means: `none` (independent), `x`, `y`, or `xy`.
 */
const meta = {
  title: 'Charts/Tooltip',
  component: LineChart,
  tags: ['autodocs'],
  args: { width: 680, height: 440, data: TIME_SERIES, x: 'year', y: 'value' },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 1000, step: 20 } },
    height: { control: { type: 'range', min: 240, max: 700, step: 20 } },
    data: { control: false },
    x: { control: false },
    y: { control: false },
    z: { control: false },
    colors: { control: false },
    facet: { control: false },
    legend: { control: false },
    tooltip: { control: false },
  },
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single grouped line chart with `tooltip` enabled — hover the lines. */
export const Basic: Story = {
  args: {
    title: 'PBI vs. Empleo',
    subtitle: 'Pasá el cursor por las líneas',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    colors: METRIC_COLORS,
    tooltip: true,
  },
};

/** Custom tooltip text via `format`. */
export const CustomFormat: Story = {
  args: {
    title: 'Formato personalizado',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    colors: METRIC_COLORS,
    tooltip: {
      sync: 'x',
      format: (row) => {
        const r = row as unknown as SeriesPoint;
        return `${r.metric} · ${r.year}\n$ ${r.value} M`;
      },
    },
  },
};

/** Faceted line chart — switch the sync mode and hover across panels. */
export const FacetSyncLine: StoryObj = {
  render: () => ({ Component: TooltipSyncDemo, props: { kind: 'line' } }),
};

/** Faceted heatmap — `xy` sync highlights the same cell in every scenario. */
export const FacetSyncHeatmap: StoryObj = {
  render: () => ({ Component: TooltipSyncDemo, props: { kind: 'heatmap' } }),
};
