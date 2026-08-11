import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import RichTooltip from './RichTooltip.svelte';
import StackedRichTooltip from './StackedRichTooltip.svelte';
import {
  FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
  MALE_LIFE_EXPECTANCY_BY_PROVINCE,
  LIFE_EXPECTANCY_BY_PROVINCE,
  AGE_BRACKET_BY_PROVINCE,
  provinceSort,
  type ProvincePoint,
  type ProvinceLifeExpectancy,
  type AgeBracketPoint,
} from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/BarPlot/Tooltip',
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
    tooltip: {
      description: 'Tooltip runtime configuration.',
      control: false,
    },
  },
  parameters: {
    docs: { source: { name: 'BarPlot' } },
  },
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const FEMALE = {
  name: 'female',
  x: 'province',
  y: 'value',
  data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
} satisfies Series<ProvincePoint>;

const MALE = {
  name: 'male',
  x: 'province',
  y: 'value',
  data: MALE_LIFE_EXPECTANCY_BY_PROVINCE,
} satisfies Series<ProvincePoint>;

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
 * Hover over any bar to activate. A standalone `BarPlot` (not inside a
 * `<Chart>`) uses `facetId: ''` and `sync: false` — no cross-facet
 * broadcasting applies.
 */
export const BasicTooltip: Story = {
  args: {
    series: [FEMALE],
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { province, value } = row as ProvincePoint;
        return `${province}: ${value} yr`;
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
      sync: false,
      format: (row) => {
        const { province, value } = row as ProvincePoint;
        return `Province: ${province}\nLife expectancy: ${value.toFixed(1)} yr`;
      },
    },
  },
};

/**
 * Computed tooltip text — the format function can derive any string from the
 * row. Here it shows the difference relative to an 82-year threshold.
 */
export const ComputedFormat: Story = {
  args: {
    series: [FEMALE],
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { province, value } = row as ProvincePoint;
        const delta = (value - 82).toFixed(1);
        const sign = value >= 82 ? '+' : '';
        return `${province}: ${value.toFixed(1)} yr (${sign}${delta} vs 82)`;
      },
    },
  },
};

/**
 * Two-series chart — the tooltip fires for whichever series' bar is nearest
 * to the cursor. Move the cursor between female and male bars to see each respond
 * independently.
 */
export const TwoSeries: Story = {
  args: {
    series: [FEMALE, MALE],
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { province, value } = row as ProvincePoint;
        return `${province}: ${value.toFixed(1)} yr`;
      },
    },
  },
};

/**
 * Series-filtered tooltip — `series: ['female']` restricts hover matching
 * to bars that belong to the named series only. Hovering over male bars shows
 * no tooltip even though both series are rendered.
 *
 * Compare with `TwoSeries` to see the difference.
 */
export const SeriesFiltered: Story = {
  args: {
    series: [FEMALE, MALE],
    tooltip: {
      facetId: '',
      sync: false,
      series: ['female'],
      format: (row) => {
        const { province, value } = row as ProvincePoint;
        return `Female - ${province}: ${value.toFixed(1)} yr`;
      },
    },
  },
};

/**
 * Two series from grouped data — `data / x / y / z` auto-creates one series
 * per unique `z` value. The row type is `ProvinceLifeExpectancy`, which carries
 * the `sex` field so the format can include it directly.
 */
export const TwoSeriesFromGroupedData: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { sex, province, value } = row as ProvinceLifeExpectancy;
        return `${sex} (${province}): ${value.toFixed(1)} yr`;
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
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    tooltip: {
      facetId: '',
      sync: false,
      series: ['female'],
      format: (row) => {
        const { sex, province, value } = row as ProvinceLifeExpectancy;
        return `${sex} (${province}): ${value.toFixed(1)} yr`;
      },
    },
  },
};

/**
 * Fully custom tooltip markup via `content` — replaces the default floating
 * label entirely with an arbitrary snippet: a bold header, a colour-coded
 * per-series list sorted by value, and a footnote. `format` is still required
 * by the type but is ignored once `content` is set.
 *
 * See `RichTooltip.svelte` for the markup — the library automatically drops
 * its default dark tooltip box (background/padding/border) whenever
 * `content` is set, so the custom card fully owns the look.
 */
export const CustomContent: StoryObj = {
  render: () => ({ Component: RichTooltip }),
};

// ── Horizontal, many categories ─────────────────────────────────────────────

/**
 * Horizontal, stacked, many categories — province on the y-axis (24 of
 * them, so long labels don't need to rotate), age-bracket series stacked to
 * 100% per province. Exercises the same hover-hit-area path as the stories
 * above, just with a much larger, thinner-banded category count.
 */
export const HorizontalStackedTooltip: Story = {
  args: {
    width: 900,
    height: 900,
    data: AGE_BRACKET_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'bracket',
    scales: {
      y: { type: 'categorical', sort: provinceSort },
      z: { seriesLayout: 'stacked' },
    } satisfies AxisBasedScalesConfig,
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { province, bracket, value } = row as AgeBracketPoint;
        return `${province} / ${bracket}: ${value}`;
      },
    },
    markers: [{ type: 'hover', showLabels: false }],
  },
};

/**
 * Same horizontal, many-category layout as above, but a single bracket —
 * no stacking, no `z`.
 */
export const HorizontalSingleSeriesTooltip: Story = {
  args: {
    width: 900,
    height: 900,
    data: AGE_BRACKET_BY_PROVINCE.filter((d) => d.bracket === '0 a 14 años'),
    x: 'province',
    y: 'value',
    scales: {
      y: { type: 'categorical', sort: provinceSort },
    } satisfies AxisBasedScalesConfig,
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { province, value } = row as AgeBracketPoint;
        return `${province}: ${value}`;
      },
    },
  },
};

/**
 * `HorizontalStackedTooltip`'s data/layout with a fully custom `content`
 * card instead of the default tooltip box — see `CustomContent` above for
 * the two-series version and `StackedRichTooltip.svelte` for the markup.
 */
export const HorizontalStackedCustomTooltip: StoryObj = {
  render: () => ({ Component: StackedRichTooltip }),
};
