import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import LinePlotWithCustomMarkers from './LinePlotWithCustomMarkers.svelte';
import LinePlotWithMarkerStrategies from './LinePlotWithMarkerStrategies.svelte';
import type { LineSeries, SegmentsMap } from '$lib/types/plots/lines';
import type { Marker } from '$lib/types/plots/markers';

// ── Shared data ───────────────────────────────────────────────────────────────

type YearPoint = { year: number; value: number };

const GDP: YearPoint[] = [
  { year: 2018, value: 42 },
  { year: 2019, value: 48 },
  { year: 2020, value: 31 },
  { year: 2021, value: 55 },
  { year: 2022, value: 61 },
];

const EMPLOYMENT: YearPoint[] = [
  { year: 2018, value: 72 },
  { year: 2019, value: 74 },
  { year: 2020, value: 60 },
  { year: 2021, value: 68 },
  { year: 2022, value: 75 },
];

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/LinePlot',
  component: LinePlot,
  tags: ['autodocs'],
  args: {
    width: 600,
    height: 400,
  },
  argTypes: {
    width: {
      description: 'Plot width in pixels.',
      control: { type: 'range', min: 300, max: 1000, step: 50 },
    },
    height: {
      description: 'Plot height in pixels.',
      control: { type: 'range', min: 200, max: 700, step: 50 },
    },
    series: {
      description: 'Data series to render. Available series are listed in each story.',
      control: false,
      table: {
        type: { summary: 'LineSeries<TData>[]' },
        category: 'Data',
      },
    },
    segments: {
      description: 'Segment styling. Use series names (gdp, employment, etc.) as keys.',
      control: false,
    },
    markers: {
      description: 'Marker annotations. Reference series names (gdp, employment, etc.) in the series property.',
      control: false,
    },
  },
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Single series with no segments — the whole line is drawn with the CSS
 * default `--plot-line-stroke` variable (falls back to `currentColor`).
 *
 * **Available series:** `gdp`
 */
export const Default: Story = {
  args: {
    series: [
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies LineSeries<YearPoint>,
    ],
  },
};

/**
 * Two series styled via `segments`. Series carry only data; colours live in
 * `segments` so the same data can be re-styled without touching the series.
 *
 * **Available series:** `gdp`, `employment`
 */
export const TwoSeries: Story = {
  args: {
    series: [
      { name: 'gdp',        x: 'year', y: 'value', data: GDP        } satisfies LineSeries<YearPoint>,
      { name: 'employment', x: 'year', y: 'value', data: EMPLOYMENT } satisfies LineSeries<YearPoint>,
    ],
    segments: {
      gdp:        [{ style: { stroke: '#4f46e5', strokeWidth: 3 } }],
      employment: [{ style: { stroke: '#e6580d', strokeWidth: 3 } }],
    } satisfies SegmentsMap,
  },
};

/**
 * One series split into two ranges: solid up to 2020, dashed from 2020
 * onward (projected values). Both ranges share the 2020 boundary point so
 * the lines connect without a gap.
 *
 * **Available series:** `gdp`
 */
export const DashedSegment: Story = {
  args: {
    series: [
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies LineSeries<YearPoint>,
    ],
    segments: {
      gdp: [
        { to:   2020, style: { stroke: '#4f46e5', strokeWidth: 3 } },
        { from: 2020, style: { stroke: '#4f46e5', strokeWidth: 3, strokeDasharray: '6 4' } },
      ],
    } satisfies SegmentsMap,
  },
};

/**
 * Narrow layout — tests that the chart does not overflow its container.
 *
 * **Available series:** `gdp`
 */
export const Narrow: Story = {
  args: {
    width: 320,
    height: 250,
    series: [
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies LineSeries<YearPoint>,
    ],
    segments: {
      gdp: [{ style: { stroke: '#4f46e5', strokeWidth: 2 } }],
    } satisfies SegmentsMap,
  },
};

/**
 * Demonstrates vertical rule markers (ruleX) to highlight specific years.
 * Markers can have custom stroke styles.
 *
 * **Available series:** `gdp`
 * **Marker type:** `ruleX` (vertical lines)
 */
export const WithRuleXMarkers: Story = {
  args: {
    series: [
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies LineSeries<YearPoint>,
    ],
    segments: {
      gdp: [{ style: { stroke: '#4f46e5', strokeWidth: 3 } }],
    } satisfies SegmentsMap,
    markers: [
      { type: 'ruleX', x: 2020, style: { stroke: '#dc2626', strokeDasharray: '4 4', strokeOpacity: 0.7 } } satisfies Marker,
      { type: 'ruleX', x: 2022, style: { stroke: '#16a34a', strokeDasharray: '4 4', strokeOpacity: 0.7 } } satisfies Marker,
    ],
  },
};

/**
 * Demonstrates horizontal rule markers (ruleY) to highlight threshold values.
 *
 * **Available series:** `employment`
 * **Marker type:** `ruleY` (horizontal lines)
 */
export const WithRuleYMarkers: Story = {
  args: {
    series: [
      { name: 'employment', x: 'year', y: 'value', data: EMPLOYMENT } satisfies LineSeries<YearPoint>,
    ],
    segments: {
      employment: [{ style: { stroke: '#e6580d', strokeWidth: 3 } }],
    } satisfies SegmentsMap,
    markers: [
      { type: 'ruleY', y: 60, style: { stroke: '#f97316', strokeDasharray: '6 6', strokeOpacity: 0.5 } } satisfies Marker,
      { type: 'ruleY', y: 75, style: { stroke: '#16a34a', strokeDasharray: '6 6', strokeOpacity: 0.5 } } satisfies Marker,
    ],
  },
};

/**
 * Demonstrates mixing vertical and horizontal markers on the same chart.
 */
export const WithMixedMarkers: Story = {
  args: {
    series: [
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies LineSeries<YearPoint>,
      { name: 'employment', x: 'year', y: 'value', data: EMPLOYMENT } satisfies LineSeries<YearPoint>,
    ],
    segments: {
      gdp:        [{ style: { stroke: '#4f46e5', strokeWidth: 3 } }],
      employment: [{ style: { stroke: '#e6580d', strokeWidth: 3 } }],
    } satisfies SegmentsMap,
    markers: [
      { type: 'ruleX', x: 2020, style: { stroke: '#dc2626', strokeDasharray: '4 4', strokeOpacity: 0.6 } } satisfies Marker,
      { type: 'ruleY', y: 50, style: { stroke: '#8b5cf6', strokeDasharray: '6 6', strokeOpacity: 0.5 } } satisfies Marker,
    ],
  },
};

/**
 * Demonstrates custom component markers using SVG elements tied to a series.
 * Components can render arbitrary SVG annotations and accept props.
 */
export const WithCustomComponentMarker: StoryObj = {
  render: () => ({
    Component: LinePlotWithCustomMarkers,
  }),
};

/**
 * Demonstrates marker strategies: series-level and segment-level peak detection.
 * Shows 4 series with different peak marker configurations:
 * - Series 1: No peak marker
 * - Series 2: Peak marker for entire series
 * - Series 3: Peak marker per segment (strategy: 'segment')
 * - Series 4: Peak marker for entire series (strategy: 'series', despite multiple segments)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WithMarkerStrategies: any = {
  render: () => ({
    Component: LinePlotWithMarkerStrategies,
  }),
};