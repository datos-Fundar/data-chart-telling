import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { Series, ScalesConfig } from '$lib/types/plots/common';
import {
  FEMALE_LIFE_EXPECTANCY,
  LIFE_EXPECTANCY,
  type YearPoint,
} from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/LinePlot/Scales',
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
    },
    scales: {
      description: 'Per-axis scale configuration.',
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
 * No scale overrides — both axes are auto-fitted to the data extent.
 */
export const Default: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ]
  },
};

/**
 * Constrained Y domain — tightens the visible range to [78, 85], which is
 * narrower than the auto-fitted range (the 2008 value sits at 77.9 so
 * auto-fit adds space below it). All data points lie within [78, 85], so
 * no line is clipped at the frame boundary.
 *
 * Compare with `Default` to see how the trend appears more spread out when
 * the Y range is reduced.
 */
export const CustomYDomain: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: { domain: [78, 85] },
    } satisfies ScalesConfig,
  },
};

/**
 * Constrained X domain — restricts both the visible range and the series
 * data to 2010–2020. The data is filtered to match the domain so the line
 * starts cleanly at the first in-range point (2010) rather than entering
 * the frame at an interpolated position from an earlier out-of-range point.
 */
export const CustomXDomain: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY.filter((d) => d.year >= 2010 && d.year <= 2020),
      } satisfies Series<YearPoint>,
    ],
    scales: {
      x: { domain: [2010, 2020] },
    } satisfies ScalesConfig,
  },
};

/**
 * Axis labels — a human-readable string appears alongside each axis.
 * Passing `false` to `label` suppresses the label svelteplot would infer
 * from the field name.
 */
export const WithAxisLabels: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      x: { label: 'Year' },
      y: { label: 'Life expectancy (years)' },
    } satisfies ScalesConfig,
    margins: { bottom: 50 },
  },
};

/**
 * Reversed Y axis — values increase downward instead of upward.
 * Useful for rankings, depth measurements, or other conventions where
 * a lower number means "better" or "further".
 */
export const ReversedY: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: { reverse: true },
    } satisfies ScalesConfig,
  },
};

/**
 * Grid lines on the Y axis — adds horizontal reference lines at every
 * tick, making it easier to read off individual values without a ruler.
 */
export const WithGrid: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: { grid: true },
    } satisfies ScalesConfig,
  },
};

/**
 * Explicit tick values — `ticks` pins exactly which values appear on the
 * X axis instead of the auto-computed interval. Useful to highlight
 * specific dates such as policy changes or census rounds.
 */
export const CustomTicks: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      x: { ticks: [2008, 2012, 2016, 2020] },
    } satisfies ScalesConfig,
  },
};

/**
 * Custom tick formatter on Y — the function receives the raw tick value and
 * returns the display string. Here it appends " yr" to every label.
 */
export const CustomTickFormat: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: {
        tickFormat: (d: unknown) => `${d} yr`,
      },
    } satisfies ScalesConfig,
  },
};

/**
 * Rotated X tick labels at −45°. Useful when labels are long or the plot
 * is too narrow to show them horizontally without overlap.
 */
export const RotatedXTicks: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      x: {
        tickRotate: -45,
      },
    } satisfies ScalesConfig,
  },
};

/**
 * Zero-anchored Y axis — `zero: true` forces the Y domain to include 0
 * even when all data values are far above it. Makes relative magnitudes
 * honest but compresses the visible trend significantly.
 */
export const ZeroAnchoredY: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY,
      } satisfies Series<YearPoint>,
    ],
    scales: {
      y: { zero: true },
    } satisfies ScalesConfig,
  },
};

/**
 * All overrides combined on a two-series chart: labelled axes, a tighter
 * Y domain, explicit tick values, custom bottom margin and a Y grid.
 */
export const CombinedOverrides: Story = {
  args: {
    data: LIFE_EXPECTANCY,
    x: 'year',
    y: 'value',
    z: 'sex',
    scales: {
      x: { label: 'Year', ticks: [2008, 2012, 2016, 2020], grid: false },
      y: { label: 'Life expectancy (years)', domain: [60, 90], grid: true },
    } satisfies ScalesConfig,
    margins: { bottom: 50 },
  },
};
