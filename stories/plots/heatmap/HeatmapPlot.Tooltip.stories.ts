import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/common';
import { EMPLOYMENT_BY_AGE_PROVINCE, type AgeProvinceCell } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/HeatmapPlot/Tooltip',
  component: HeatmapPlot,
  tags: ['autodocs'],
  args: {
    width: 520,
    height: 420,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 900, step: 20 } },
    height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
    series: { control: false },
    tooltip: { control: false },
  },
  parameters: {
    docs: { source: { name: 'HeatmapPlot' } },
  },
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const SERIES = [
  {
    name: 'employment_rate',
    x: 'ageGroup',
    y: 'province',
    z: 'pct',
    data: EMPLOYMENT_BY_AGE_PROVINCE,
  } satisfies Series<AgeProvinceCell>,
];

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No tooltip — hovering over cells produces no floating label.
 * This is the default behaviour when `tooltip` is omitted.
 */
export const NoTooltip: Story = {
  args: { series: SERIES },
};

/**
 * Basic tooltip — the `format` callback receives the hovered cell and
 * returns the string shown in the floating box.
 *
 * Hover over any cell to activate. A standalone `HeatmapPlot` uses
 * `facetId: ''` and `sync: false`.
 */
export const BasicTooltip: Story = {
  args: {
    series: SERIES,
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { ageGroup, province, pct } = row as AgeProvinceCell;
        return `${ageGroup} - ${province}: ${(pct * 100).toFixed(1)}%`;
      },
    },
  },
};

/**
 * Rich multi-line format — `\n` splits the tooltip string across lines.
 * The first line becomes the heading, the rest the body.
 */
export const RichFormat: Story = {
  args: {
    series: SERIES,
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { ageGroup, province, pct } = row as AgeProvinceCell;
        return `Age: ${ageGroup}\nProvince: ${province}\nEmployment rate: ${(pct * 100).toFixed(1)}%`;
      },
    },
  },
};

/**
 * Computed tooltip — the format function can derive any string from the row.
 * Here it shows the employment rate relative to a 75% threshold.
 */
export const ComputedFormat: Story = {
  args: {
    series: SERIES,
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { ageGroup, province, pct } = row as AgeProvinceCell;
        const threshold = 0.75;
        const delta = ((pct - threshold) * 100).toFixed(1);
        const sign = pct >= threshold ? '+' : '';
        return `${ageGroup} - ${province}: ${(pct * 100).toFixed(1)}% (${sign}${delta} vs 75%)`;
      },
    },
  },
};

/**
 * Rounded percentage format — displays values as clean rounded percentages
 * for easier interpretation at a glance.
 */
export const RoundedPercentage: Story = {
  args: {
    series: SERIES,
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { ageGroup, province, pct } = row as AgeProvinceCell;
        return `${ageGroup} - ${province}\n${Math.round(pct * 100)}%`;
      },
    },
  },
};
