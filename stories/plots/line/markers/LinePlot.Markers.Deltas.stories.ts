import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import DeltaMarker from '$lib/plots/markers/DeltaMarker.svelte';
import type { Marker } from '$lib/types/plots/markers';
import type { DeltaConfig } from '$lib/types/plots/delta';
import { FEMALE_LIFE_EXPECTANCY, LIFE_EXPECTANCY } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

// Delta annotations are rendered via `DeltaMarker`, a custom component marker:
// `data` carries the series it needs to resolve `from`/`to` against, and
// `props` is a `DeltaConfig` (axis included).

const meta = {
  title: 'Plots/LinePlot/Markers/Deltas',
  component: LinePlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 400,
  },
  argTypes: {
    width: {
      description: 'Plot width in pixels.',
      control: { type: 'range', min: 300, max: 950, step: 50 },
    },
    height: {
      description: 'Plot height in pixels.',
      control: { type: 'range', min: 200, max: 700, step: 50 },
    },
    series: {
      description: 'Data series to render.',
      control: false,
      table: { type: { summary: 'Series<TData>[]' }, category: 'Data' },
    },
    markers: {
      description: 'Marker annotations.',
      control: false,
    },
  },
  parameters: {
    docs: { source: { name: 'LinePlot' } },
  },
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── X-axis deltas ─────────────────────────────────────────────────────────────

/**
 * Vertical delta line between two series at a given X position.
 */
export const XDeltaBetweenTwoSeries: Story = {
  args: {
    data: LIFE_EXPECTANCY,
    x: 'year',
    y: 'value',
    z: 'sex',
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        props: {
          axis: 'x',
          at: 2018,
          from: { type: 'series', series: 'female' },
          to: { type: 'series', series: 'male' },
          strokeStyle: { stroke: 'grey', strokeDasharray: '6 6' },
          formatDiff: (d) => d.toFixed(0),
          fontStyle: { dx: 12, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
    ],
  },
};

/**
 * Delta from a series down to the Y=0 baseline (no `to` target).
 * Useful for labelling the absolute value of a series at a point.
 */
export const XDeltaToBaseline: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        props: {
          yDomain: [78, 85],
          ...({
            axis: 'x',
            at: 2018,
            from: { type: 'series', series: 'female' },
            fontStyle: { dx: 20, lineAnchor: 'middle' },
          } satisfies DeltaConfig),
        },
      } satisfies Marker,
    ],
    scales: { y: { domain: [78, 85] } },
  },
};

/**
 * Delta to an explicit axis threshold (e.g. a policy target at y=80).
 */
export const XDeltaToAxisValue: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        props: {
          axis: 'x',
          at: 2018,
          from: { type: 'series', series: 'female' },
          to: { type: 'axis', value: 80 },
          fontStyle: { dx: 20, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
    ],
    scales: { y: { domain: [78, 85] } },
  },
};

/**
 * Multiple X delta annotations on the same chart at different years.
 */
export const MultipleXDeltas: Story = {
  args: {
    data: LIFE_EXPECTANCY,
    x: 'year',
    y: 'value',
    z: 'sex',
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        props: {
          axis: 'x',
          at: 2020,
          from: { type: 'series', series: 'female' },
          to: { type: 'series', series: 'male' },
          formatDiff: (d) => d.toFixed(0),
          fontStyle: { dx: -12, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
      {
        type: 'component',
        component: DeltaMarker,
        props: {
          axis: 'x',
          at: 2008,
          from: { type: 'series', series: 'female' },
          to: { type: 'series', series: 'male' },
          formatDiff: (d) => d.toFixed(0),
          fontStyle: { dx: 12, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
    ],
  },
};

// ── Y-axis deltas ─────────────────────────────────────────────────────────────

/**
 * Horizontal delta between two series at a given Y value.
 * Shows the distance between male and female life expectancy at a given Y value.
 */
export const YDeltaBetweenTwoSeries: Story = {
  args: {
    data: LIFE_EXPECTANCY,
    x: 'year',
    y: 'value',
    z: 'sex',
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        props: {
          axis: 'y',
          at: 78,
          from: { type: 'series', series: 'female' },
          to: { type: 'series', series: 'male' },
          formatDiff: (d) => `${d} yr`,
          fontStyle: { dy: -10, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
    ],
  },
};

/**
 * Horizontal delta from a series down to the x=0 baseline (no `to` target).
 * Shows the distance from the x=0 baseline at a given Y value.
 * `scales.x.domain` keeps the axis tight around the data; the line is clamped
 * to the domain edge visually, but the label still shows the true distance from x=0.
 */
export const YDeltaToBaseline: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        props: {
          xDomain: [2008, 2020],
          ...({
            axis: 'y',
            at: 81,
            from: { type: 'series', series: 'female' },
            formatDiff: (d) => `${d.toFixed(0)} yr`,
            fontStyle: { dy: -10, lineAnchor: 'middle' },
          } satisfies DeltaConfig),
        },
      } satisfies Marker,
    ],
    scales: { x: { domain: [2008, 2020] } },
  },
};

/**
 * Horizontal delta from a series point to an explicit X axis value.
 * Shows the distance from a series point to a target X axis value.
 */
export const YDeltaToAxisValue: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        props: {
          axis: 'y',
          at: 81,
          from: { type: 'series', series: 'female' },
          to: { type: 'axis', value: 2016 },
          strokeStyle: { strokeDasharray: '6 4' },
          formatDiff: (d) => `${d} yr`,
          fontStyle: { dy: -10, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
    ],
  },
};

/**
 * Multiple Y delta annotations at different Y values on the same chart.
 */
export const MultipleYDeltas: Story = {
  args: {
    data: LIFE_EXPECTANCY,
    x: 'year',
    y: 'value',
    z: 'sex',
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        props: {
          axis: 'y',
          at: 78,
          from: { type: 'series', series: 'female' },
          to: { type: 'series', series: 'male' },
          formatDiff: (d) => `${d} yr`,
          fontStyle: { dy: -10, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
      {
        type: 'component',
        component: DeltaMarker,
        props: {
          axis: 'y',
          at: 79,
          from: { type: 'series', series: 'female' },
          to: { type: 'series', series: 'male' },
          formatDiff: (d) => `${d} yr`,
          fontStyle: { dy: -10, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
    ],
  },
};
