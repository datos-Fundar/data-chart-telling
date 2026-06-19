import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import LinePlotWithCustomMarkers from './LinePlotWithCustomMarkers.svelte';
import LinePlotWithMarkerStrategies from './LinePlotWithMarkerStrategies.svelte';
import DeltaMarker from '$lib/plots/markers/DeltaMarker.svelte';
import type { Series } from '$lib/types/plots/common';
import type { SegmentsMap } from '$lib/types/plots/styles';
import type { Marker } from '$lib/types/plots/markers';
import type { DeltaConfig } from '$lib/types/plots/delta';
import { GDP, EMPLOYMENT, COSTS, MONTHLY, type YearPoint, type MonthPoint } from './data';

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
      table: { type: { summary: 'Series<TData>[]' }, category: 'Data' },
    },
    segments: {
      description: 'Segment styling. Use series names as keys.',
      control: false,
    },
    markers: {
      description: 'Marker annotations.',
      control: false,
    },
  },
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Basic ─────────────────────────────────────────────────────────────────────

/**
 * Single series with no segments — the whole line is drawn with the CSS
 * default `--plot-line-stroke` variable (falls back to `currentColor`).
 */
export const Default: Story = {
  args: {
    series: [
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies Series<YearPoint>,
    ],
  },
};

/**
 * Two series styled via `segments`. Series carry only data; colours live in
 * `segments` so the same data can be re-styled without touching the series.
 */
export const TwoSeries: Story = {
  args: {
    series: [
      { name: 'gdp',        x: 'year', y: 'value', data: GDP        } satisfies Series<YearPoint>,
      { name: 'employment', x: 'year', y: 'value', data: EMPLOYMENT } satisfies Series<YearPoint>,
    ],
    segments: {
      gdp:        [{ style: { stroke: { stroke: '#4f46e5', strokeWidth: 3 } } }],
      employment: [{ style: { stroke: { stroke: '#e6580d', strokeWidth: 3 } } }],
    } satisfies SegmentsMap,
  },
};

/**
 * One series split into two ranges: solid up to 2020, dashed from 2020
 * onward (projected values). Both ranges share the 2020 boundary point so
 * the lines connect without a gap.
 */
export const DashedSegment: Story = {
  args: {
    series: [
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies Series<YearPoint>,
    ],
    segments: {
      gdp: [
        { to:   2020, style: { stroke: { stroke: '#4f46e5', strokeWidth: 3 } } },
        { from: 2020, style: { stroke: { stroke: '#4f46e5', strokeWidth: 3, strokeDasharray: '6 4' } } },
      ],
    } satisfies SegmentsMap,
  },
};

/**
 * Narrow layout — tests that the chart does not overflow its container.
 */
export const Narrow: Story = {
  args: {
    width: 320,
    height: 250,
    series: [
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies Series<YearPoint>,
    ],
    segments: {
      gdp: [{ style: { stroke: { stroke: '#4f46e5', strokeWidth: 2 } } }],
    } satisfies SegmentsMap,
  },
};

// ── Markers ───────────────────────────────────────────────────────────────────

/**
 * Vertical rule markers (ruleX) to highlight specific years.
 */
export const WithRuleXMarkers: Story = {
  args: {
    series: [
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies Series<YearPoint>,
    ],
    segments: {
      gdp: [{ style: { stroke: { stroke: '#4f46e5', strokeWidth: 3 } } }],
    } satisfies SegmentsMap,
    markers: [
      { type: 'ruleX', x: 2020, style: { stroke: '#dc2626', strokeDasharray: '4 4', strokeOpacity: 0.7 } } satisfies Marker,
      { type: 'ruleX', x: 2022, style: { stroke: '#16a34a', strokeDasharray: '4 4', strokeOpacity: 0.7 } } satisfies Marker,
    ],
  },
};

/**
 * Horizontal rule markers (ruleY) to highlight threshold values.
 */
export const WithRuleYMarkers: Story = {
  args: {
    series: [
      { name: 'employment', x: 'year', y: 'value', data: EMPLOYMENT } satisfies Series<YearPoint>,
    ],
    segments: {
      employment: [{ style: { stroke: { stroke: '#e6580d', strokeWidth: 3 } } }],
    } satisfies SegmentsMap,
    markers: [
      { type: 'ruleY', y: 60, style: { stroke: '#f97316', strokeDasharray: '6 6', strokeOpacity: 0.5 } } satisfies Marker,
      { type: 'ruleY', y: 75, style: { stroke: '#16a34a', strokeDasharray: '6 6', strokeOpacity: 0.5 } } satisfies Marker,
    ],
  },
};

/**
 * Mixing vertical and horizontal markers on the same chart.
 */
export const WithMixedMarkers: Story = {
  args: {
    series: [
      { name: 'gdp',        x: 'year', y: 'value', data: GDP        } satisfies Series<YearPoint>,
      { name: 'employment', x: 'year', y: 'value', data: EMPLOYMENT } satisfies Series<YearPoint>,
    ],
    segments: {
      gdp:        [{ style: { stroke: { stroke: '#4f46e5', strokeWidth: 3 } } }],
      employment: [{ style: { stroke: { stroke: '#e6580d', strokeWidth: 3 } } }],
    } satisfies SegmentsMap,
    markers: [
      { type: 'ruleX', x: 2020, style: { stroke: '#dc2626', strokeDasharray: '4 4', strokeOpacity: 0.6 } } satisfies Marker,
      { type: 'ruleY', y: 50,   style: { stroke: '#8b5cf6', strokeDasharray: '6 6', strokeOpacity: 0.5 } } satisfies Marker,
    ],
  },
};

/**
 * Custom component markers using SVG elements tied to a series.
 */
export const WithCustomComponentMarker: StoryObj = {
  render: () => ({ Component: LinePlotWithCustomMarkers }),
};

/**
 * Marker strategies: series-level and segment-level peak detection.
 * - Series 1: No peak marker
 * - Series 2: Peak marker for entire series
 * - Series 3: Peak marker per segment (strategy: 'segment')
 * - Series 4: Peak marker for entire series despite multiple segments
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WithMarkerStrategies: any = {
  render: () => ({ Component: LinePlotWithMarkerStrategies }),
};

// ── Dots ──────────────────────────────────────────────────────────────────────

/**
 * Single series with circular dots at each data point.
 * Dots appear when the `dots` object is present in the segment style —
 * no explicit `showDots` flag needed.
 */
export const WithDots: Story = {
  args: {
    series: [
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies Series<YearPoint>,
    ],
    segments: {
      gdp: [
        {
          style: {
            stroke: { stroke: '#4f46e5', strokeWidth: 3 },
            dots: { dotRadius: 8, dotSymbol: 'circle' },
          },
        },
      ],
    } as SegmentsMap,
  },
};

/**
 * Two series with different dot symbols (circle vs square) and coordinated
 * colors — dots fill matches the line stroke, white dot-stroke for contrast.
 */
export const TwoSeriesWithDifferentDots: Story = {
  args: {
    series: [
      { name: 'gdp',  x: 'year', y: 'value', data: GDP  } satisfies Series<YearPoint>,
      { name: 'costs', x: 'year', y: 'value', data: COSTS } satisfies Series<YearPoint>,
    ],
    segments: {
      gdp: [
        {
          style: {
            stroke: { stroke: '#4f46e5', strokeWidth: 3 },
            dots: { dotRadius: 8, dotSymbol: 'circle', dotFill: '#4f46e5', dotStroke: '#fff', dotStrokeWidth: 2 },
          },
        },
      ],
      costs: [
        {
          style: {
            stroke: { stroke: '#e6580d', strokeWidth: 3 },
            dots: { dotRadius: 8, dotSymbol: 'square', dotFill: '#e6580d', dotStroke: '#fff', dotStrokeWidth: 2 },
          },
        },
      ],
    } as SegmentsMap,
  },
};

/**
 * One series split into solid (observed) and dashed (projected) segments,
 * with circle dots before 2020 and triangle dots after.
 */
export const DashedSegmentWithDots: Story = {
  args: {
    series: [
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies Series<YearPoint>,
    ],
    segments: {
      gdp: [
        {
          to: 2020,
          style: {
            stroke: { stroke: '#4f46e5', strokeWidth: 3 },
            dots: { dotRadius: 8, dotSymbol: 'circle', dotFill: '#4f46e5' },
          },
        },
        {
          from: 2020,
          style: {
            stroke: { stroke: '#4f46e5', strokeWidth: 3, strokeDasharray: '6 4', strokeOpacity: 0.6 },
            dots: { dotRadius: 8, dotSymbol: 'triangle', dotFill: '#4f46e5' },
          },
        },
      ],
    } as SegmentsMap,
  },
};

/**
 * Custom dots.
 */
export const CustomDotsWithStroke: Story = {
  args: {
    series: [
      { name: 'gdp', x: 'year', y: 'value', data: GDP } satisfies Series<YearPoint>,
    ],
    segments: {
      gdp: [
        {
          style: {
            stroke: { stroke: '#dc2626', strokeWidth: 2 },
            dots: { dotRadius: 12, dotSymbol: 'circle', dotFill: 'orange', dotStroke: '#222', dotStrokeWidth: 3 },
          },
        },
      ],
    } as SegmentsMap,
  },
};

// ── Styling ───────────────────────────────────────────────────────────────────

/**
 * Monthly ISO-string X axis with solid and dashed segments that have
 * different dot symbols — shows string-keyed SegmentsMap in action.
 * ISO format ("2024-01") ensures alphabetical order matches chronological order.
 */
export const MonthlyWithSegmentedDots: Story = {
  args: {
    series: [
      { name: 'metric', x: 'month', y: 'value', data: MONTHLY } satisfies Series<MonthPoint>,
    ],
    segments: {
      metric: [
        {
          to: '2024-03',
          style: {
            stroke: { stroke: '#4f46e5', strokeWidth: 3 },
            dots: { dotRadius: 5, dotSymbol: 'circle', dotFill: '#4f46e5' },
          },
        },
        {
          from: '2024-03',
          style: {
            stroke: { stroke: '#4f46e5', strokeWidth: 3, strokeDasharray: '6 4', strokeOpacity: 0.6 },
            dots: { dotRadius: 5, dotSymbol: 'triangle', dotFill: '#4f46e5' },
          },
        },
      ],
    } as SegmentsMap,
  },
};

// ── Delta ─────────────────────────────────────────────────────────────────────
// Delta annotations are rendered via `DeltaMarker`, a custom component marker:
// `data` carries the series it needs to resolve `from`/`to` against, and
// `props` is a `DeltaConfig` (axis included).

const GDP_SERIES = [
  { name: 'gdp', x: 'year', y: 'value', data: GDP },
] satisfies Series<YearPoint>[];
const COSTS_SERIES = [
  { name: 'costs', x: 'year', y: 'value', data: COSTS },
] satisfies Series<YearPoint>[];
const GDP_AND_COSTS_SERIES = [...GDP_SERIES, ...COSTS_SERIES];

/**
 * Vertical delta line between two series at a given X position.
 */
export const XDeltaBetweenTwoSeries: Story = {
  args: {
    series: GDP_AND_COSTS_SERIES,
    segments: {
      gdp:   [{ style: { stroke: { stroke: '#4f46e5', strokeWidth: 3 } } }],
      costs: [{ style: { stroke: { stroke: '#e6580d', strokeWidth: 3 } } }],
    } satisfies SegmentsMap,
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        data: GDP_AND_COSTS_SERIES,
        props: {
          axis: 'x',
          at: 2019,
          from: { type: 'series', series: 'gdp' },
          to:   { type: 'series', series: 'costs' },
          strokeStyle: { stroke: '#6b7280', strokeDasharray: '6 6' },
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
    series: GDP_SERIES,
    segments: {
      gdp: [{ style: { stroke: { stroke: '#4f46e5', strokeWidth: 3 } } }],
    } satisfies SegmentsMap,
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        data: GDP_SERIES,
        props: {
          axis: 'x',
          at: 2021,
          from: { type: 'series', series: 'gdp' },
          strokeStyle: { stroke: '#4f46e5', strokeDasharray: '4 4', strokeOpacity: 0.6 },
          formatDiff: (d) => `${d}`,
          fontStyle: { dx: 12, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
    ],
  },
};

/**
 * Delta to an explicit axis threshold (e.g. a policy target at y=40).
 */
export const XDeltaToAxisValue: Story = {
  args: {
    series: GDP_SERIES,
    segments: {
      gdp: [{ style: { stroke: { stroke: '#4f46e5', strokeWidth: 3 } } }],
    } satisfies SegmentsMap,
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        data: GDP_SERIES,
        props: {
          axis: 'x',
          at: 2022,
          from: { type: 'series', series: 'gdp' },
          to:   { type: 'axis', value: 40 },
          strokeStyle: { stroke: '#dc2626', strokeDasharray: '6 4' },
          formatDiff: (d) => `+ ${d.toFixed(0)}`,
          fontStyle: { dx: 20, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
    ],
  },
};

/**
 * Multiple X delta annotations on the same chart at different years.
 */
export const MultipleXDeltas: Story = {
  args: {
    series: GDP_AND_COSTS_SERIES,
    segments: {
      gdp:   [{ style: { stroke: { stroke: '#4f46e5', strokeWidth: 3 } } }],
      costs: [{ style: { stroke: { stroke: '#e6580d', strokeWidth: 3 } } }],
    } satisfies SegmentsMap,
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        data: GDP_AND_COSTS_SERIES,
        props: {
          axis: 'x',
          at: 2019,
          from: { type: 'series', series: 'gdp' },
          to:   { type: 'series', series: 'costs' },
          strokeStyle: { stroke: '#6b7280', strokeDasharray: '4 4', strokeOpacity: 0.7 },
          formatDiff: (d) => d.toFixed(0),
          fontStyle: { dx: 12, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
      {
        type: 'component',
        component: DeltaMarker,
        data: GDP_AND_COSTS_SERIES,
        props: {
          axis: 'x',
          at: 2022,
          from: { type: 'series', series: 'gdp' },
          to:   { type: 'series', series: 'costs' },
          strokeStyle: { stroke: '#6b7280', strokeDasharray: '4 4', strokeOpacity: 0.7 },
          formatDiff: (d) => d.toFixed(0),
          fontStyle: { dx: 12, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
    ],
  },
};

/**
 * Horizontal delta between two series at a given Y value.
 * At y=40, GDP reaches that value around 2018, COSTS reaches it at 2021.
 * The line spans those two X positions.
 */
export const YDeltaBetweenTwoSeries: Story = {
  args: {
    series: GDP_AND_COSTS_SERIES,
    segments: {
      gdp:   [{ style: { stroke: { stroke: '#4f46e5', strokeWidth: 3 } } }],
      costs: [{ style: { stroke: { stroke: '#e6580d', strokeWidth: 3 } } }],
    } satisfies SegmentsMap,
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        data: GDP_AND_COSTS_SERIES,
        props: {
          axis: 'y',
          at: 40,
          from: { type: 'series', series: 'gdp' },
          to:   { type: 'series', series: 'costs' },
          strokeStyle: { stroke: '#6b7280', strokeDasharray: '6 6' },
          formatDiff: (d) => `${d} yr`,
          fontStyle: { dy: -10, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
    ],
  },
};

/**
 * Horizontal delta from a series down to the x=0 baseline (no `to` target).
 * At y=55, GDP is at x=2021, so the true diff is 2021.
 * `x.domain` keeps the axis tight around the data; the line is clamped to
 * the domain edge visually, but the label still shows the true distance from x=0.
 */
export const YDeltaToBaseline: Story = {
  args: {
    series: GDP_SERIES,
    segments: {
      gdp: [{ style: { stroke: { stroke: '#4f46e5', strokeWidth: 3 } } }],
    } satisfies SegmentsMap,
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        data: GDP_SERIES,
        props: {
          xDomain: [2018, 2023],
          ...({
            axis: 'y',
            at: 55,
            from: { type: 'series', series: 'gdp' },
            strokeStyle: { stroke: '#4f46e5', strokeDasharray: '4 4', strokeOpacity: 0.6 },
            formatDiff: (d) => `${d.toFixed(0)} yr`,
            fontStyle: { dy: -10, lineAnchor: 'middle' },
          } satisfies DeltaConfig),
        },
      } satisfies Marker,
    ],
    xScale: { domain: [2018, 2023] },
  },
};

/**
 * Horizontal delta from a series point to an explicit X axis value.
 * At y=45, COSTS is at 2022 — the line shows the distance to year 2019.
 */
export const YDeltaToAxisValue: Story = {
  args: {
    series: COSTS_SERIES,
    segments: {
      costs: [{ style: { stroke: { stroke: '#e6580d', strokeWidth: 3 } } }],
    } satisfies SegmentsMap,
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        data: COSTS_SERIES,
        props: {
          axis: 'y',
          at: 45,
          from: { type: 'series', series: 'costs' },
          to:   { type: 'axis', value: 2019 },
          strokeStyle: { stroke: '#dc2626', strokeDasharray: '6 4' },
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
    series: GDP_AND_COSTS_SERIES,
    segments: {
      gdp:   [{ style: { stroke: { stroke: '#4f46e5', strokeWidth: 3 } } }],
      costs: [{ style: { stroke: { stroke: '#e6580d', strokeWidth: 3 } } }],
    } satisfies SegmentsMap,
    markers: [
      {
        type: 'component',
        component: DeltaMarker,
        data: GDP_AND_COSTS_SERIES,
        props: {
          axis: 'y',
          at: 32,
          from: { type: 'series', series: 'gdp' },
          to:   { type: 'series', series: 'costs' },
          strokeStyle: { stroke: '#6b7280', strokeDasharray: '4 4', strokeOpacity: 0.7 },
          formatDiff: (d) => `${d} yr`,
          fontStyle: { dy: -10, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
      {
        type: 'component',
        component: DeltaMarker,
        data: GDP_AND_COSTS_SERIES,
        props: {
          axis: 'y',
          at: 48,
          from: { type: 'series', series: 'gdp' },
          to:   { type: 'series', series: 'costs' },
          strokeStyle: { stroke: '#6b7280', strokeDasharray: '4 4', strokeOpacity: 0.7 },
          formatDiff: (d) => `${d} yr`,
          fontStyle: { dy: -10, lineAnchor: 'middle' },
        } satisfies DeltaConfig,
      } satisfies Marker,
    ],
  },
};
