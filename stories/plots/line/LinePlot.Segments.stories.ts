import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type {
  SegmentsMap,
  SeriesAwareSegmentsMap,
  LineSegmentStyle
} from '$lib/types/plots/styles';
import {
  FEMALE_LIFE_EXPECTANCY,
  LIFE_EXPECTANCY,
} from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/LinePlot/Segments',
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
    segments: {
      description: 'Segment styling rules.',
      control: false,
    },
  },
  parameters: {
    docs: { source: { name: 'LinePlot' } },
  },
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── SegmentsMap: array form ───────────────────────────────────────────────────
// When `segments` is Segment<TStyle>[], the same rules apply to every series.

/**
 * Simplest SegmentsMap: a list with one Segment containing one Area.
 *
 * The area covers x ∈ [2016, 2020], which in this dataset matches the
 * 2016, 2018, and 2020 points. Data points outside the area (2008–2014)
 * are rendered automatically with the default palette style — no need to
 * declare an explicit catch-all segment. The engine also inserts a bridge
 * point at 2016 so the default and styled lines connect without a gap.
 *
 * Use the **Stroke** controls in the panel to explore all StrokeStyle
 * properties live without editing code.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DashedSegmentInRange: any = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    // Extra args wired through render — not LinePlot props
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeOpacity: 0.8,
    strokeDasharray: '6 4',
    strokeLinecap: 'butt',
  },
  argTypes: {
    stroke: {
      control: 'color',
      description: 'Stroke color of the highlighted segment.',
      table: { category: 'Stroke' },
    },
    strokeWidth: {
      control: { type: 'range', min: 0.5, max: 8, step: 0.5 },
      description: 'Stroke width in pixels.',
      table: { category: 'Stroke' },
    },
    strokeOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Stroke opacity.',
      table: { category: 'Stroke' },
    },
    strokeDasharray: {
      control: 'text',
      description: 'SVG stroke-dasharray pattern (e.g. "6 4", "4 2 1 2").',
      table: { category: 'Stroke' },
    },
    strokeLinecap: {
      control: { type: 'select' },
      options: ['butt', 'round', 'square'],
      description: 'Shape of line end caps.',
      table: { category: 'Stroke' },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (args: any) => ({
    Component: LinePlot,
    props: {
      series: args.series,
      width: args.width,
      height: args.height,
      segments: [
        {
          areas: [{ x: { from: 2016, to: 2020 } }],
          style: {
            stroke: {
              stroke: args.stroke,
              strokeWidth: args.strokeWidth,
              strokeOpacity: args.strokeOpacity,
              strokeDasharray: args.strokeDasharray,
              strokeLinecap: args.strokeLinecap,
            },
          },
        },
      ] satisfies SegmentsMap<LineSegmentStyle>,
    },
  }),
};

/**
 * One Segment with two Areas: x ∈ [2010, 2012] and x ∈ [2016, 2020].
 *
 * A single Segment applies one shared style to every area it lists.
 * Data between the two ranges (2014) is left unstyled.
 */
export const MultipleAreasOneSegment: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    segments: [
      {
        areas: [
          { x: { from: 2010, to: 2012 } },
          { x: { from: 2016, to: 2020 } },
        ],
        style: { stroke: { strokeDasharray: '6 4', strokeOpacity: 0.7 } },
      },
    ] satisfies SegmentsMap<LineSegmentStyle>,
  },
};

/**
 * One Segment, two Areas — the second area adds a Y constraint.
 *
 * The first area matches x ∈ [2010, 2012] (any Y).
 * The second matches x ∈ [2015, 2020] AND y ∈ [83.5, 84], which in this
 * dataset narrows to the 2018 and 2020 points (83.7 and 83.9).
 * The 2016 point (83.4) falls just outside the Y bound and is not matched.
 * Both areas still share the same stroke style.
 */
export const MultipleAreasWithYConstraint: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    segments: [
      {
        areas: [
          { x: { from: 2010, to: 2012 } },
          { x: { from: 2015, to: 2020 }, y: { from: 83.5, to: 84 } },
        ],
        style: { stroke: { strokeDasharray: '6 4', strokeOpacity: 0.7 } },
      },
    ] satisfies SegmentsMap<LineSegmentStyle>,
  },
};

/**
 * Two Segments with different styles, each targeting a different Area.
 *
 * - Segment 1: x ∈ [2010, 2012] — dashed with reduced opacity.
 * - Segment 2: x ∈ [2015, 2020] AND y ∈ [83.5, 84] — a different color and tighter dash.
 *
 * Segments are drawn in list order; later ones render on top of earlier ones.
 */
export const TwoSegmentsDifferentStyles: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    segments: [
      {
        areas: [{ x: { from: 2010, to: 2012 } }],
        style: { stroke: { strokeDasharray: '6 4', strokeOpacity: 0.5 } },
      },
      {
        areas: [{ x: { from: 2015, to: 2020 }, y: { from: 83.5, to: 84 } }],
        style: { stroke: { stroke: 'tomato', strokeDasharray: '3 3', strokeWidth: 2.5 } },
      },
    ] satisfies SegmentsMap<LineSegmentStyle>,
  },
};

/**
 * Same two-segment structure, now with two series (female and male).
 *
 * Array-form `segments` apply identically to every series in the plot.
 * Segment 1 (x range only) visibly styles both lines at 2010–2012.
 * Segment 2 (x AND y ∈ [83.5, 84]) only matches female's values at that range
 * (83.7, 83.9); male's values there are 78–79 and fall outside the Y bound —
 * so the tomato style naturally appears only on the female line, even though
 * the segment is global. Compare with the next story to see the difference
 * between implicit Y filtering and explicit series targeting.
 */
export const TwoSegmentsOnAllSeries: Story = {
  args: {
    data: LIFE_EXPECTANCY,
    x: 'year',
    y: 'value',
    z: 'sex',
    segments: [
      {
        areas: [{ x: { from: 2010, to: 2012 } }],
        style: { stroke: { strokeDasharray: '6 4', strokeOpacity: 0.5 } },
      },
      {
        areas: [{ x: { from: 2015, to: 2020 }, y: { from: 83.5, to: 84 } }],
        style: { stroke: { stroke: 'tomato', strokeDasharray: '3 3', strokeWidth: 2.5 } },
      },
    ] satisfies SegmentsMap<LineSegmentStyle>,
  },
};

// ── SeriesAwareSegmentsMap: record form ───────────────────────────────────────
// When `segments` is a Record<seriesName, Segment<TStyle>[]>, each key targets
// exactly one series. Series with no entry are drawn with the default palette.

/**
 * `SeriesAwareSegmentsMap` form: segments are keyed by series name so they
 * apply only to the named series.
 *
 * Here, the same two segments from the previous story are scoped explicitly
 * to `'female'`. The male line is unaffected regardless of its Y values —
 * the record key is the deciding factor, not data filtering.
 */
export const SegmentsOnOneSeriesOnly: Story = {
  args: {
    data: LIFE_EXPECTANCY,
    x: 'year',
    y: 'value',
    z: 'sex',
    segments: {
      female: [
        {
          areas: [{ x: { from: 2010, to: 2012 } }],
          style: { stroke: { strokeDasharray: '6 4', strokeOpacity: 0.5 } },
        },
        {
          areas: [{ x: { from: 2015, to: 2020 }, y: { from: 83.5, to: 84 } }],
          style: { stroke: { stroke: 'tomato', strokeDasharray: '3 3', strokeWidth: 2.5 } },
        },
      ],
    } satisfies SeriesAwareSegmentsMap<LineSegmentStyle>,
  },
};

// ── Dots ──────────────────────────────────────────────────────────────────────

/**
 * Single series with circular dots at each data point.
 * Dots appear when the `dots` object is present in the segment style.
 */
export const WithDots: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    segments: {
      female: [
        {
          style: {
            dots: { dotRadius: 8, dotSymbol: 'circle' },
          },
        },
      ],
    } satisfies SeriesAwareSegmentsMap<LineSegmentStyle>,
  },
};

/**
 * Two series with different dot symbols (circle vs square) and coordinated
 * colors. Dots fill matches the line stroke.
 */
export const TwoSeriesWithDifferentDots: Story = {
  args: {
    data: LIFE_EXPECTANCY,
    x: 'year',
    y: 'value',
    z: 'sex',
    segments: {
      female: [
        {
          style: {
            dots: { dotRadius: 8, dotSymbol: 'circle', dotStrokeWidth: 2 },
          },
        },
      ],
      male: [
        {
          style: {
            dots: { dotRadius: 8, dotSymbol: 'square', dotStrokeWidth: 2 },
          },
        },
      ],
    } satisfies SeriesAwareSegmentsMap<LineSegmentStyle>,
  },
};

/**
 * One series split into solid and dashed segments,
 * with circle dots before 2015 and triangle dots after.
 */
export const DashedSegmentWithDots: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    segments: {
      female: [
        {
          areas: [{ x: { to: 2015 } }],
          style: { dots: { dotRadius: 8, dotSymbol: 'circle' } },
        },
        {
          areas: [{ x: { from: 2015 } }],
          style: {
            stroke: { strokeDasharray: '6 4', strokeOpacity: 0.6 },
            dots: { dotRadius: 8, dotSymbol: 'triangle' },
          },
        },
      ],
    } satisfies SeriesAwareSegmentsMap<LineSegmentStyle>,
  },
};

/**
 * Custom dots with an explicit stroke width.
 */
export const CustomDotsWithStroke: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    segments: {
      female: [
        {
          style: {
            dots: {
              dotRadius: 12,
              dotSymbol: 'circle',
              dotFill: 'yellow',
              dotFillOpacity: 0.8,
              dotStroke: 'red',
              dotStrokeWidth: 3
            },
          },
        },
      ],
    } satisfies SeriesAwareSegmentsMap<LineSegmentStyle>,
  },
};