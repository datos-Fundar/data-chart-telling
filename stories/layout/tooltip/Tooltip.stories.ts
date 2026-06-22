import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LineChart from '$lib/charts/line/Chart.svelte';
import TooltipSyncDemo from './TooltipSyncDemo.svelte';
import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';

/**
 * Every chart kind takes a `tooltip` prop to enable the floating HTML tooltip,
 * and a separate `markers` prop to opt into the in-SVG hover crosshair/dot —
 * the two are independent, so you can have either, both, or neither:
 *
 * ```svelte
 * <LineChart … tooltip markers={[{ type: 'hover' }]} />   <!-- both, defaults -->
 * <LineChart … tooltip={{ sync: 'x' }} />                  <!-- text only -->
 * <LineChart … markers={[{ type: 'hover' }]} />            <!-- crosshair only -->
 * <HeatmapChart … tooltip={{ sync: 'xy', format }} markers={[{ type: 'hover' }]} />
 * ```
 *
 * When faceted, hovering one panel highlights the matching point in the others.
 * `tooltip.sync` (or, with no tooltip, the hover marker's own `sync`) chooses
 * what "matching" means: `none` (independent), `x`, `y`, or `xy`.
 */
const meta = {
  title: 'Layout/Tooltip',
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
    segments: { control: false },
    facet: { control: false },
    legend: { control: false },
    tooltip: { control: false },
  },
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A single grouped line chart with `tooltip` + the hover marker — hover the lines. */
export const Basic: Story = {
  args: {
    title: 'PBI vs. Empleo',
    subtitle: 'Pasá el cursor por las líneas',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    tooltip: true,
    markers: [{ type: 'hover' }],
  },
};

/** Custom tooltip text via `format`. */
export const CustomFormat: Story = {
  args: {
    title: 'Formato personalizado',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    tooltip: {
      sync: 'x',
      format: (row) => {
        const r = row as unknown as SeriesPoint;
        return `${r.metric} · ${r.year}\n$ ${r.value} M`;
      },
    },
    markers: [{ type: 'hover' }],
  },
};

/** Tooltip text only — no in-SVG crosshair/dot. */
export const TooltipOnly: Story = {
  args: {
    title: 'Solo tooltip (sin marcador)',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    tooltip: true,
  },
};

/** Hover marker only — no floating HTML tooltip. */
export const MarkerOnly: Story = {
  args: {
    title: 'Solo marcador (sin tooltip)',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    markers: [{ type: 'hover', sync: 'x' }],
  },
};

/** Multi-series crossing tooltip: all series sharing the hovered x show up, blank-line separated. */
export const MultiSeriesCrossing: Story = {
  args: {
    title: 'Todas las series cruzando el x',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    tooltip: { sync: 'x' },
    markers: [{ type: 'hover' }],
  },
};

/**
 * Same as above, narrowed to a single named series via `tooltip.series` — and,
 * to match, the hover marker is scoped to that same series too (`markers` and
 * `tooltip.series` are independent, so an unscoped marker would still dot
 * every crossing series even though the tooltip text only talks about one).
 */
export const SeriesSubset: Story = {
  args: {
    title: 'Tooltip acotado a una serie',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    tooltip: { sync: 'x', series: ['PBI'] },
    markers: [{ type: 'hover', series: 'PBI' }],
  },
};

/**
 * Once sync isn't `none`, the floating tooltip shows in *every* synced facet
 * with a match, not just the one the mouse is over — hover either panel and
 * both bubbles appear. The non-cursor facet reprojects the cursor's relative
 * position onto its own box, since it has no mouse position of its own.
 */
export const MultiFacetBroadcast: Story = {
  args: {
    title: 'Tooltip en cada faceta sincronizada',
    subtitle: 'Pasá el cursor por una región — la otra también muestra su tooltip',
    z: 'metric' as keyof SeriesPoint,
    facet: { by: 'region' as keyof SeriesPoint, columns: 2 },
    tooltip: { sync: 'x' },
    markers: [{ type: 'hover' }],
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
