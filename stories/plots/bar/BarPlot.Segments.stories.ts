import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type {
  SegmentsMap,
  SeriesAwareSegmentsMap,
  BarSegmentStyle,
} from '$lib/types/plots/styles';
import {
  FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
  LIFE_EXPECTANCY_BY_PROVINCE,
} from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/BarPlot/Segments',
  component: BarPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 500,
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
    docs: { source: { name: 'BarPlot' } },
  },
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── SegmentsMap: array form ───────────────────────────────────────────────────
// When `segments` is Segment<TStyle>[], the same rules apply to every series.

/**
 * Simplest SegmentsMap: a list with one Segment containing one Area.
 *
 * The area covers x ∈ ['Buenos Aires', 'Córdoba', 'Santa Fe'], which matches
 * the first three provinces. Bars outside the area are rendered automatically
 * with the default palette style — no need to declare an explicit catch-all segment.
 *
 * Use the **Fill** controls in the panel to explore fillOpacity live without
 * editing code.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HighlightedProvincesSegment: any = {
  args: {
    series: [
      {
        name: 'female_life_expectancy',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      },
    ],
    fillOpacity: 1.0,
    dimmedOpacity: 0.3,
  },
  argTypes: {
    fillOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Fill opacity of highlighted segment.',
      table: { category: 'Fill' },
    },
    dimmedOpacity: {
      control: { type: 'range', min: 0, max: 1, step: 0.05 },
      description: 'Fill opacity of non-highlighted bars.',
      table: { category: 'Fill' },
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (args: any) => ({
    Component: BarPlot,
    props: {
      series: args.series,
      width: args.width,
      height: args.height,
      segments: [
        {
          areas: [
            {
              x: {
                from: 'Buenos Aires',
                to: 'Santa Fe',
              },
            },
          ],
          style: {
            fillOpacity: args.fillOpacity,
          },
        },
        {
          style: {
            fillOpacity: args.dimmedOpacity,
          },
        },
      ] satisfies SegmentsMap<BarSegmentStyle>,
    },
  }),
};

/**
 * Multiple bars with different opacity — highlights the top 3 provinces
 * with higher opacity while dimming the rest.
 */
export const MultipleAreasOneSegment: Story = {
  args: {
    series: [
      {
        name: 'female_life_expectancy',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      },
    ],
    segments: [
      {
        areas: [
          { x: { from: 'Buenos Aires', to: 'La Pampa' } },
          { x: { from: 'Catamarca', to: 'Catamarca' } },
        ],
        style: { fillOpacity: 0.9 },
      },
      {
        style: { fillOpacity: 0.3 },
      },
    ] satisfies SegmentsMap<BarSegmentStyle>,
  },
};

/**
 * Two Segments with different colors targeting different provinces.
 *
 * - Segment 1: Buenos Aires to Santa Fe — high opacity.
 * - Segment 2: Rest — reduced opacity.
 *
 * Segments are drawn in list order; later ones render on top of earlier ones.
 */
export const TwoSegmentsDifferentStyles: Story = {
  args: {
    series: [
      {
        name: 'female_life_expectancy',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      },
    ],
    segments: [
      {
        areas: [{ x: { from: 'Buenos Aires', to: 'Santa Fe' } }],
        style: { fill: 'tomato', fillOpacity: 0.85 },
      },
      {
        style: { fillOpacity: 0.4 },
      },
    ] satisfies SegmentsMap<BarSegmentStyle>,
  },
};

/**
 * Same two-segment structure on two series (female and male).
 *
 * Array-form `segments` apply identically to every series in the plot.
 * The styling naturally appears on all series, though each uses its own
 * palette colour combined with the segment opacity.
 */
export const TwoSegmentsOnAllSeries: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    segments: [
      {
        areas: [{ x: { from: 'Buenos Aires', to: 'Santa Fe' } }],
        style: { fillOpacity: 0.85 },
      },
      {
        style: { fillOpacity: 0.4 },
      },
    ] satisfies SegmentsMap<BarSegmentStyle>,
  },
};

// ── SeriesAwareSegmentsMap: record form ───────────────────────────────────────
// When `segments` is a Record<seriesName, Segment<TStyle>[]>, each key targets
// exactly one series. Series with no entry are drawn with the default palette.

/**
 * `SeriesAwareSegmentsMap` form: segments are keyed by series name so they
 * apply only to the named series.
 *
 * Here, highlighting is scoped explicitly to `'female'`. The male bars are
 * unaffected — the record key is the deciding factor.
 */
export const SegmentsOnOneSeriesOnly: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    segments: {
      female: [
        {
          areas: [{ x: { from: 'Buenos Aires', to: 'Santa Fe' } }],
          style: { fillOpacity: 0.9 },
        },
        {
          style: { fillOpacity: 0.3 },
        },
      ],
    } satisfies SeriesAwareSegmentsMap<BarSegmentStyle>,
  },
};

/**
 * Custom fills for different series — female bars are blue, male bars are
 * highlighted with a custom color. Each series can have its own segment rules.
 */
export const CustomFillsPerSeries: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    segments: {
      female: [
        {
          areas: [{ x: { from: 'Buenos Aires', to: 'La Pampa' } }],
          style: { fillOpacity: 0.8 },
        },
      ],
      male: [
        {
          areas: [{ x: { from: 'Buenos Aires', to: 'La Pampa' } }],
          style: { fill: '#1971c2', fillOpacity: 0.85 },
        },
      ],
    } satisfies SeriesAwareSegmentsMap<BarSegmentStyle>,
  },
};
