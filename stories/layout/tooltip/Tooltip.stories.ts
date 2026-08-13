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
 * <LineChart … tooltip markers={[{ type: 'hover' }]} />              <!-- both, defaults -->
 * <LineChart … tooltip={{ strategy: 'x', sync: true }} />            <!-- text only -->
 * <LineChart … markers={[{ type: 'hover' }]} />                      <!-- crosshair only -->
 * <HeatmapChart … tooltip={{ strategy: 'punctual', sync: true, format }} markers={[{ type: 'hover' }]} />
 * ```
 *
 * When faceted, set `sync: true` to broadcast the hover to other panels.
 * `strategy` controls how related points are found:
 * - `'x'`        all points sharing the hovered x (default for line/bar).
 * - `'y'`        all points sharing the hovered y (default for pyramid).
 * - `'punctual'` exact XY match — one cell at a time (default for heatmap).
 *
 * `tooltip.anchorX`/`anchorY` set which side of the cursor the floating box
 * prefers (default: `'right'`/`'bottom'`, clear of the cursor), falling back
 * toward the opposite side when the preferred one would overflow the chart's
 * own bounds — see the `CustomAnchor` story below.
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
      strategy: 'x',
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
    markers: [{ type: 'hover' }],
  },
};

/** Multi-series crossing tooltip: all series sharing the hovered x show up, blank-line separated. */
export const MultiSeriesCrossing: Story = {
  args: {
    title: 'Todas las series cruzando el x',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    tooltip: { strategy: 'x' },
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
    tooltip: { strategy: 'x', series: ['PBI'] },
    markers: [{ type: 'hover', series: 'PBI' }],
  },
};

/**
 * Once `sync: true`, the floating tooltip shows in *every* synced facet with a
 * match, not just the one the mouse is over — hover either panel and both
 * bubbles appear. The non-cursor facet reprojects the cursor's relative position
 * onto its own box.
 */
export const MultiFacetBroadcast: Story = {
  args: {
    title: 'Tooltip en cada faceta sincronizada',
    subtitle: 'Pasá el cursor por una región — la otra también muestra su tooltip',
    z: 'metric' as keyof SeriesPoint,
    facet: { by: 'region' as keyof SeriesPoint, columns: 2 },
    tooltip: { strategy: 'x', sync: true },
    markers: [{ type: 'hover' }],
  },
};

/** Faceted line chart — switch strategy and sync, hover across panels. */
export const FacetSyncLine: StoryObj = {
  render: () => ({ Component: TooltipSyncDemo, props: { kind: 'line' } }),
};

/** Faceted bar chart — `x` strategy highlights the same region across years. */
export const FacetSyncBar: StoryObj = {
  render: () => ({ Component: TooltipSyncDemo, props: { kind: 'bar' } }),
};

/** Faceted heatmap — `punctual` strategy highlights the same cell in every scenario. */
export const FacetSyncHeatmap: StoryObj = {
  render: () => ({ Component: TooltipSyncDemo, props: { kind: 'heatmap' } }),
};

/** Faceted pyramid — `y` strategy highlights the same age group across years. */
export const FacetSyncPyramid: StoryObj = {
  render: () => ({ Component: TooltipSyncDemo, props: { kind: 'pyramid' } }),
};

/**
 * `tooltip.anchorX`/`anchorY` control which side of the cursor the floating
 * tooltip prefers — the system default (`'right'`/`'bottom'`) keeps it clear
 * of the cursor so it never covers the hovered point. Here it's pinned
 * above-and-to-the-left instead. Whichever side is picked, it still falls
 * back toward the opposite side (via the centered position) if the cursor
 * gets close enough to an edge that the preferred side would overflow — try
 * hovering near the chart's own left/top edges to see it happen.
 */
export const CustomAnchor: Story = {
  args: {
    title: 'Anchor personalizado',
    subtitle: 'El tooltip se ancla arriba a la izquierda del cursor',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    z: 'metric' as keyof SeriesPoint,
    tooltip: { strategy: 'x', anchorX: 'left', anchorY: 'top' },
    markers: [{ type: 'hover' }],
  },
};
