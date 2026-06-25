import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { Series } from '$lib/types/plots/common';
import {
  FEMALE_LIFE_EXPECTANCY,
  MALE_LIFE_EXPECTANCY,
  LIFE_EXPECTANCY,
  type YearPoint,
  type LifeExpectancyPoint,
} from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/LinePlot/Tooltip',
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
    tooltip: {
      description: 'Tooltip runtime configuration.',
      control: false,
    },
  },
  parameters: {
    docs: { source: { name: 'LinePlot' } },
  },
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const FEMALE = {
  name: 'female',
  x: 'year',
  y: 'value',
  data: FEMALE_LIFE_EXPECTANCY,
} satisfies Series<YearPoint>;

const MALE = {
  name: 'male',
  x: 'year',
  y: 'value',
  data: MALE_LIFE_EXPECTANCY,
} satisfies Series<YearPoint>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No tooltip — hovering over the plot produces no floating label.
 * This is the default behaviour when `tooltip` is omitted.
 */
export const NoTooltip: Story = {
  args: {
    series: [FEMALE],
  },
};

/**
 * Basic tooltip — the `format` callback receives the nearest hovered row and
 * returns the string shown in the floating box.
 *
 * Hover over the line to activate. A standalone `LinePlot` (not inside a
 * `<Chart>`) uses `facetId: ''` and `sync: 'none'` — no cross-facet
 * broadcasting applies.
 */
export const BasicTooltip: Story = {
  args: {
    series: [FEMALE],
    tooltip: {
      facetId: '',
      sync: 'none',
      format: (row) => {
        const { year, value } = row as YearPoint;
        return `${year}: ${value} yr`;
      },
    },
  },
};

/**
 * Rich multi-line format — `\n` splits the tooltip string across lines.
 * The portion before the first break is used as the heading; the rest is
 * the body text.
 */
export const RichFormat: Story = {
  args: {
    series: [FEMALE],
    tooltip: {
      facetId: '',
      sync: 'none',
      format: (row) => {
        const { year, value } = row as YearPoint;
        return `Year: ${year}\nLife expectancy: ${value.toFixed(1)} yr`;
      },
    },
  },
};

/**
 * Computed tooltip text — the format function can derive any string from the
 * row. Here it shows the difference relative to an 80-year threshold.
 */
export const ComputedFormat: Story = {
  args: {
    series: [FEMALE],
    tooltip: {
      facetId: '',
      sync: 'none',
      format: (row) => {
        const { year, value } = row as YearPoint;
        const delta = (value - 80).toFixed(1);
        const sign = value >= 80 ? '+' : '';
        return `${year}: ${value.toFixed(1)} yr (${sign}${delta} vs 80)`;
      },
    },
  },
};

/**
 * Two-series chart — the tooltip fires for whichever series' point is nearest
 * to the cursor. Move the cursor between the two lines to see each respond
 * independently.
 */
export const TwoSeries: Story = {
  args: {
    series: [FEMALE, MALE],
    tooltip: {
      facetId: '',
      sync: 'none',
      format: (row) => {
        const { year, value } = row as YearPoint;
        return `${year}: ${value.toFixed(1)} yr`;
      },
    },
  },
};

/**
 * Series-filtered tooltip — `series: ['female']` restricts hover matching
 * to points that belong to the named series only. Hovering over the male
 * line shows no tooltip even though both lines are rendered.
 *
 * Compare with `TwoSeries` to see the difference.
 */
export const SeriesFiltered: Story = {
  args: {
    series: [FEMALE, MALE],
    tooltip: {
      facetId: '',
      sync: 'none',
      series: ['female'],
      format: (row) => {
        const { year, value } = row as YearPoint;
        return `Female: ${value.toFixed(1)} yr (${year})`;
      },
    },
  },
};

/**
 * Two series from grouped data — `data / x / y / z` auto-creates one series
 * per unique `z` value. The row type is `LifeExpectancyPoint`, which carries
 * the `sex` field so the format can include it directly.
 */
export const TwoSeriesFromGroupedData: Story = {
  args: {
    data: LIFE_EXPECTANCY,
    x: 'year',
    y: 'value',
    z: 'sex',
    tooltip: {
      facetId: '',
      sync: 'none',
      format: (row) => {
        const { sex, year, value } = row as LifeExpectancyPoint;
        return `${sex} (${year}): ${value.toFixed(1)} yr`;
      },
    },
  },
};

/**
 * Grouped-data tooltip filtered to one sex — even though both series are
 * rendered, the tooltip only responds to female data points.
 */
export const GroupedDataSeriesFiltered: Story = {
  args: {
    data: LIFE_EXPECTANCY,
    x: 'year',
    y: 'value',
    z: 'sex',
    tooltip: {
      facetId: '',
      sync: 'none',
      series: ['female'],
      format: (row) => {
        const { year, value } = row as LifeExpectancyPoint;
        return `Female (${year}): ${value.toFixed(1)} yr`;
      },
    },
  },
};
