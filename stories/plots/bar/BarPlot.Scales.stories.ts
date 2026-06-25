import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { Series, ScalesConfig } from '$lib/types/plots/common';
import {
  FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
  LIFE_EXPECTANCY_BY_PROVINCE,
  type ProvincePoint,
} from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/BarPlot/Scales',
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
    },
    scales: {
      description: 'Per-axis scale configuration.',
      control: false,
    },
  },
  parameters: {
    docs: { source: { name: 'BarPlot' } },
  },
} satisfies Meta<typeof BarPlot>;

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
        name: 'female_life_expectancy',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      } satisfies Series<ProvincePoint>,
    ],
  },
};

/**
 * Constrained Y domain — tightens the visible range to [75, 85], which makes
 * the variation in life expectancy more visible. Compare with `Default` to see
 * how the bars appear more spread out when the Y range is reduced.
 */
export const CustomYDomain: Story = {
  args: {
    series: [
      {
        name: 'female_life_expectancy',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      } satisfies Series<ProvincePoint>,
    ],
    scales: {
      y: { domain: [75, 85] },
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
        name: 'female_life_expectancy',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      } satisfies Series<ProvincePoint>,
    ],
    scales: {
      x: { label: 'Province' },
      y: { label: 'Life expectancy (years)' },
    } satisfies ScalesConfig,
  },
};

/**
 * Reversed Y axis — values increase downward instead of upward.
 * Useful for rankings where lower numbers are better.
 */
export const ReversedY: Story = {
  args: {
    series: [
      {
        name: 'female_life_expectancy',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      } satisfies Series<ProvincePoint>,
    ],
    scales: {
      y: { reverse: true },
    } satisfies ScalesConfig,
  },
};

/**
 * Grid lines on the Y axis — adds horizontal reference lines at every tick,
 * making it easier to read off individual values without a ruler.
 */
export const WithGrid: Story = {
  args: {
    series: [
      {
        name: 'female_life_expectancy',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      } satisfies Series<ProvincePoint>,
    ],
    scales: {
      y: { grid: true },
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
        name: 'female_life_expectancy',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      } satisfies Series<ProvincePoint>,
    ],
    scales: {
      y: {
        tickFormat: (d: unknown) => `${d} yr`,
      },
    } satisfies ScalesConfig,
  },
};

/**
 * Rotated X tick labels at −45°. Useful when province names are long and
 * would otherwise overlap on a horizontal axis.
 */
export const RotatedXTicks: Story = {
  args: {
    series: [
      {
        name: 'female_life_expectancy',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      } satisfies Series<ProvincePoint>,
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
        name: 'female_life_expectancy',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      } satisfies Series<ProvincePoint>,
    ],
    scales: {
      y: { zero: true },
    } satisfies ScalesConfig,
  },
};

/**
 * All overrides combined on a two-series chart: labelled axes, a tighter
 * Y domain, rotated X tick labels, and a Y grid.
 */
export const CombinedOverrides: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    scales: {
      x: { label: 'Province', tickRotate: -45 },
      y: { label: 'Life expectancy (years)', domain: [70, 85], grid: true },
    } satisfies ScalesConfig,
    margins: { bottom: 80, left: 60 },
  },
};
