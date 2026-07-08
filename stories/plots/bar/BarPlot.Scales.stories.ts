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
      y: { domain: [70, 85] },
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
    margins: { bottom: 80 },
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
 * Bars ordered by their own Y value (descending) instead of the default
 * alphabetical order of the X category. `scales.x.sort` receives the full
 * row on each side — not just the X value — so the comparator can read
 * `value` (or any other field) to decide the order.
 */
export const SortXByYDescending: Story = {
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
        sort: (a, b) => (b as ProvincePoint).value - (a as ProvincePoint).value,
      },
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

// ── Series layout (multiple series sharing a category) ────────────────────────
// `scales.z.seriesLayout` controls how series that share the same X category
// are arranged — `z` because it's the grouping axis, not the category (`x`)
// axis itself.

/**
 * Default layout when omitted — every series draws at the same X position,
 * full band width. The taller bar is fully covered by the shorter one drawn
 * after it, so only its top sliver peeks out above. Compare with `Grouped`
 * and `Stacked` below.
 */
export const OverlappingSeries: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
  },
};

/**
 * `seriesLayout: 'grouped'` gives each series its own slice of the category
 * band, side by side — the classic grouped-bar-chart look. The slice width
 * is only an estimate (derived from this plot's own width/margins, not
 * svelteplot's actual measured scale), so it can be slightly off when an
 * `'auto'` margin ends up wider than expected.
 */
export const GroupedSeries: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    scales: {
      z: { seriesLayout: 'grouped' },
    } satisfies ScalesConfig,
  },
};

/**
 * `seriesLayout: 'stacked'` stacks series cumulatively within each category's
 * band instead of placing them side by side. Each series keeps its single
 * resolved colour; per-area `segments` style overrides aren't applied in
 * stacked mode.
 */
export const StackedSeries: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    scales: {
      z: { seriesLayout: 'stacked' },
    } satisfies ScalesConfig,
  },
};

/**
 * `scales.z.seriesPadding` (0–1) reserves a fraction of each series' own
 * slice as a gap on either side, separating bars within the same group.
 * Space *between* groups is controlled separately, by the category axis's
 * own `paddingInner`/`paddingOuter` (see `WideGroupSpacing` below).
 */
export const GroupedWithSeriesPadding: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    scales: {
      z: { seriesLayout: 'grouped', seriesPadding: 0.3 },
    } satisfies ScalesConfig,
  },
};

/**
 * `scales.x.paddingInner` widens the gap *between* categories (provinces),
 * which — since 'grouped' estimates its slice width off the same band-scale
 * formula — also narrows every series' own bars accordingly.
 */
export const WideGroupSpacing: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    scales: {
      x: { paddingInner: 0.5 },
      z: { seriesLayout: 'grouped' },
    } satisfies ScalesConfig,
  },
};

// ── Orientation (horizontal bars) ──────────────────────────────────────────────
// `scales.x`/`scales.y` always describe *that visual axis*, regardless of
// which data field ends up there — marking `scales.y.type: 'categorical'`
// says "the category is drawn on Y this time", swapping BarPlot from its
// default `BarY` (vertical) to `BarX` (horizontal). `x` is categorical by
// default; marking both (or presumably relying on neither) is ambiguous —
// BarPlot warns and falls back to vertical.

/**
 * Horizontal bars — `scales.y.type: 'categorical'` puts the province names
 * on the Y axis and life expectancy (the value) on X.
 */
export const HorizontalBars: Story = {
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
      y: { type: 'categorical' },
    } satisfies ScalesConfig,
    margins: { left: 90 },
  },
};

/**
 * Horizontal bars combined with 'grouped' series layout — the two series
 * sit side by side within each category's row instead of one on top of the
 * other.
 */
export const HorizontalGroupedSeries: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    scales: {
      y: { type: 'categorical' },
      z: { seriesLayout: 'grouped' },
    } satisfies ScalesConfig,
    margins: { left: 90 },
  },
};
