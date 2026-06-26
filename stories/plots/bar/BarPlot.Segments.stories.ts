import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type {
  Segments,
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

// ── Default key: segments that apply to every series ──────────────────────────

/**
 * Simplest `default` key: one Segment with one Area.
 *
 * The area covers x ∈ ['Buenos Aires', 'Santa Fe']. Bars outside the area are
 * rendered with the default palette style — no explicit catch-all needed.
 *
 * Use the **Fill** controls in the panel to explore fillOpacity live.
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
      segments: {
        default: [
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
        ],
      } satisfies Segments<BarSegmentStyle>,
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
    segments: {
      default: [
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
      ],
    } satisfies Segments<BarSegmentStyle>,
  },
};

/**
 * Two Segments with different colors targeting different provinces.
 *
 * - Segment 1: Buenos Aires to Santa Fe — high opacity.
 * - Segment 2: Rest — reduced opacity.
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
    segments: {
      default: [
        {
          areas: [{ x: { from: 'Buenos Aires', to: 'Santa Fe' } }],
          style: { fill: 'tomato', fillOpacity: 0.85 },
        },
        {
          style: { fillOpacity: 0.4 },
        },
      ],
    } satisfies Segments<BarSegmentStyle>,
  },
};

/**
 * Same two-segment structure on two series (female and male).
 *
 * `default` segments apply identically to every series in the plot.
 */
export const TwoSegmentsOnAllSeries: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    segments: {
      default: [
        {
          areas: [{ x: { from: 'Buenos Aires', to: 'Santa Fe' } }],
          style: { fillOpacity: 0.85 },
        },
        {
          style: { fillOpacity: 0.4 },
        },
      ],
    } satisfies Segments<BarSegmentStyle>,
  },
};

// ── Series-aware form ─────────────────────────────────────────────────────────

/**
 * Segments keyed by series name apply only to the named series.
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
    } satisfies Segments<BarSegmentStyle>,
  },
};

/**
 * Custom fills for different series — female bars are highlighted with a
 * range-specific opacity, male bars get a custom color.
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
    } satisfies Segments<BarSegmentStyle>,
  },
};
