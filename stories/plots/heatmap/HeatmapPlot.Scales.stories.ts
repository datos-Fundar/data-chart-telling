import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Series, ScalesConfig } from '$lib/types/plots/common';
import { EMPLOYMENT_BY_AGE_PROVINCE, AGE_GROUPS, PROVINCES, type AgeProvinceCell } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/HeatmapPlot/Scales',
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
    scales: { control: false },
  },
  parameters: {
    docs: { source: { name: 'HeatmapPlot' } },
  },
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No scale overrides — both X and Y axes are auto-fitted to the data extent.
 */
export const Default: Story = {
  args: {
    series: [
      {
        name: 'employment_rate',
        x: 'ageGroup',
        y: 'province',
        z: 'pct',
        data: EMPLOYMENT_BY_AGE_PROVINCE,
      } satisfies Series<AgeProvinceCell>,
    ],
  },
};

/**
 * With axis labels — human-readable strings appear alongside each axis,
 * making the heatmap more interpretable.
 */
export const WithAxisLabels: Story = {
  args: {
    series: [
      {
        name: 'employment_rate',
        x: 'ageGroup',
        y: 'province',
        z: 'pct',
        data: EMPLOYMENT_BY_AGE_PROVINCE,
      } satisfies Series<AgeProvinceCell>,
    ],
    scales: {
      x: { label: 'Age Group' },
      y: { label: 'Province' },
    } satisfies ScalesConfig,
  },
};

/**
 * Explicit domain ordering for X axis — ensures age groups appear in the
 * desired order rather than alphabetically. The `domain` array pins the
 * exact order and set of values shown.
 */
export const ExplicitXDomain: Story = {
  args: {
    series: [
      {
        name: 'employment_rate',
        x: 'ageGroup',
        y: 'province',
        z: 'pct',
        data: EMPLOYMENT_BY_AGE_PROVINCE,
      } satisfies Series<AgeProvinceCell>,
    ],
    scales: {
      x: { domain: AGE_GROUPS, label: 'Age Group' },
      y: { domain: PROVINCES, label: 'Province' },
    } satisfies ScalesConfig,
  },
};

/**
 * Reversed Y axis — provinces appear bottom-to-top instead of top-to-bottom.
 * Useful for matching reading direction or presentation conventions.
 */
export const ReversedY: Story = {
  args: {
    series: [
      {
        name: 'employment_rate',
        x: 'ageGroup',
        y: 'province',
        z: 'pct',
        data: EMPLOYMENT_BY_AGE_PROVINCE,
      } satisfies Series<AgeProvinceCell>,
    ],
    scales: {
      y: { reverse: true },
    } satisfies ScalesConfig,
  },
};

/**
 * Rotated X tick labels — makes long age group labels more readable when
 * they might otherwise overlap on narrow charts.
 */
export const RotatedXTicks: Story = {
  args: {
    series: [
      {
        name: 'employment_rate',
        x: 'ageGroup',
        y: 'province',
        z: 'pct',
        data: EMPLOYMENT_BY_AGE_PROVINCE,
      } satisfies Series<AgeProvinceCell>,
    ],
    scales: {
      x: { tickRotate: -45 },
    } satisfies ScalesConfig,
  },
};

/**
 * Combined overrides — labelled axes, explicit domain ordering for both axes,
 * and custom margins to accommodate labels and rotated ticks.
 */
export const CombinedOverrides: Story = {
  args: {
    series: [
      {
        name: 'employment_rate',
        x: 'ageGroup',
        y: 'province',
        z: 'pct',
        data: EMPLOYMENT_BY_AGE_PROVINCE,
      } satisfies Series<AgeProvinceCell>,
    ],
    scales: {
      x: { domain: AGE_GROUPS, label: 'Age Group', tickRotate: -45 },
      y: { domain: PROVINCES, label: 'Province' },
    } satisfies ScalesConfig,
    margins: { bottom: 50, left: 100 },
  },
};
