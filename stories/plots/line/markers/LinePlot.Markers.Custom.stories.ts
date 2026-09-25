import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import PeakMarker from '$lib/markers/PeakMarker.svelte';
import DotMarker from '$lib/markers/DotMarker.svelte';
import TextMarker from '$lib/markers/TextMarker.svelte';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { LineMarkersConfig } from '$lib/types/markers/line';
import { FEMALE_LIFE_EXPECTANCY, type YearPoint } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/LinePlot/Markers/Custom',
  component: LinePlot,
  tags: ['autodocs'],
  args: {
    width: 940,
    height: 400,
  },
  argTypes: {
    width: {
      description: 'Plot width in pixels.',
      control: { type: 'range', min: 300, max: 940, step: 50 },
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

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * DotMarker places a dot at every data point in the series.
 */
export const WithDotMarker: Story = {
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
        series: 'female',
        component: DotMarker,
        props: {
          x: (d: YearPoint) => d.year,
          y: (d: YearPoint) => d.value,
        },
      },
    ] satisfies LineMarkersConfig[],
  },
};

/**
 * TextMarker renders a value label at every data point in the series.
 */
export const WithTextMarker: Story = {
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
        series: 'female',
        component: TextMarker,
        props: {
          x: (d: YearPoint) => d.year,
          y: (d: YearPoint) => d.value,
          text: (d: YearPoint) => String(d.value),
          styles: {
            dy: -10,
          }
        },
      },
    ] satisfies LineMarkersConfig[],
  },
};

/**
 * PeakMarker highlights the max or min value of the series — use the `mode`
 * control to switch between peak detection strategies.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WithPeakMarker: any = {
  args: {
    width: 940,
    height: 400,
    mode: 'max',
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
  },
  argTypes: {
    mode: {
      description: 'Peak detection mode — finds the maximum or minimum value.',
      control: { type: 'inline-radio' },
      options: ['max', 'min'],
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: ({ mode, ...args }: any) => ({
    Component: LinePlot,
    props: {
      ...args,
      markers: [
        {
          type: 'component',
          series: 'female',
          component: PeakMarker,
          props: {
            yProp: 'value',
            xProp: 'year',
            mode,
            label: mode === 'max' ? 'Max' : 'Min',
          },
        },
      ] satisfies LineMarkersConfig[],
    },
  }),
};

// ── WithMarkerStrategies data ──────────────────────────────────────────────────

const SERIES1: YearPoint[] = [
  { year: 2018, value: 30 },
  { year: 2019, value: 35 },
  { year: 2020, value: 28 },
  { year: 2021, value: 40 },
  { year: 2022, value: 38 },
];

const SERIES2: YearPoint[] = [
  { year: 2018, value: 50 },
  { year: 2019, value: 55 },
  { year: 2020, value: 48 },
  { year: 2021, value: 65 },
  { year: 2022, value: 62 },
];

const SERIES3: YearPoint[] = [
  { year: 2018, value: 20 },
  { year: 2019, value: 28 },
  { year: 2020, value: 15 },
  { year: 2021, value: 32 },
  { year: 2022, value: 25 },
];

const SERIES4: YearPoint[] = [
  { year: 2018, value: 60 },
  { year: 2019, value: 70 },
  { year: 2020, value: 45 },
  { year: 2021, value: 58 },
  { year: 2022, value: 68 },
];

const STRATEGIES_SEGMENTS: SegmentsConfig<LineSegmentStyle> = {
  series1: [{ styles: {} }],
  series2: [{ styles: {} }],
  series3: [
    { areas: [{ x: { to: 2020 } }], styles: {} },
    { areas: [{ x: { from: 2020 } }], styles: { stroke: { strokeDasharray: '6 4' } } },
  ],
  series4: [
    { areas: [{ x: { to: 2020 } }], styles: {} },
    { areas: [{ x: { from: 2020 } }], styles: { stroke: { strokeDasharray: '6 4' } } },
  ],
};

/**
 * Marker strategies: series-level and segment-level peak detection.
 * - 🔵 series1: No peak marker
 * - 🟠 series2: Peak marker for entire series
 * - 🟢 series3: Peak marker per segment (strategy: `'segment'`)
 * - 🔴 series4: Peak marker for entire series despite multiple segments
 */
export const WithMarkerStrategies: Story = {
  args: {
    series: [
      { name: 'series1', x: 'year', y: 'value', data: SERIES1 },
      { name: 'series2', x: 'year', y: 'value', data: SERIES2 },
      { name: 'series3', x: 'year', y: 'value', data: SERIES3 },
      { name: 'series4', x: 'year', y: 'value', data: SERIES4 },
    ],
    segments: STRATEGIES_SEGMENTS,
    markers: [
      {
        type: 'component',
        series: 'series2',
        component: PeakMarker,
        props: {
          yProp: 'value',
          xProp: 'year',
          mode: 'max',
          label: 'Max',
        },
      },
      {
        type: 'component',
        series: 'series3',
        component: PeakMarker,
        scope: 'segment',
        props: {
          yProp: 'value',
          xProp: 'year',
          mode: 'max',
          label: 'Max',
        },
      },
      {
        type: 'component',
        series: 'series4',
        component: PeakMarker,
        scope: 'series',
        props: {
          yProp: 'value',
          xProp: 'year',
          mode: 'max',
          label: 'Max',
        },
      },
    ] satisfies LineMarkersConfig[],
  },
};
