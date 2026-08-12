import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { BasePlotStylesConfig } from '$lib/types/layout/styles';
import { LIFE_EXPECTANCY_BY_PROVINCE_SEX } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/HeatmapPlot/Styles',
  component: HeatmapPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 420,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 950, step: 20 } },
    height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
    series: { control: false },
    styles: { control: false },
  },
  parameters: {
    docs: { source: { name: 'HeatmapPlot' } },
  },
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No style overrides — the plot uses the configured theme defaults.
 * Cell values are displayed and color ramp is auto-selected.
 */
export const Default: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
    x: 'province',
    y: 'sex',
    z: 'value',
  },
};

/**
 * Hide cell value labels — `styles.values.show: false` removes the numeric
 * labels from each cell, useful when cells are small or data density is high.
 */
export const NoValueLabels: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
    x: 'province',
    y: 'sex',
    z: 'value',
    scales: {
      z: { domain: [70, 85] },
    },
    styles: {
      values: { show: false },
    } satisfies BasePlotStylesConfig,
  },
};

/**
 * Custom value format — the `format(value)` callback controls how cell values
 * are displayed. Here life expectancy is shown in years with one decimal place.
 */
export const CustomValueFormat: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
    x: 'province',
    y: 'sex',
    z: 'value',
    scales: {
      z: { domain: [70, 85] },
    },
    styles: {
      values: { format: (v: number) => `${v.toFixed(1)} yr` },
    } satisfies BasePlotStylesConfig,
  },
};

/**
 * Warm color ramp — overrides the default colour scheme to a warm palette
 * (dark blue to light blue) instead of the default viridis-like ramp.
 */
export const WarmColorRamp: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
    x: 'province',
    y: 'sex',
    z: 'value',
    scales: {
      z: { domain: [70, 85] },
    },
    styles: {
      colors: { min: 'darkblue', max: 'cornflowerblue' },
      values: { format: (v: number) => `${v.toFixed(1)} yr` },
    } satisfies BasePlotStylesConfig,
  },
};

/**
 * Custom color ramp — full control over the color gradient from min to max.
 * Here a red-to-green ramp emphasizes low and high life expectancy.
 */
export const CustomColorRamp: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
    x: 'province',
    y: 'sex',
    z: 'value',
    scales: {
      z: { domain: [70, 85] },
    },
    styles: {
      colors: { min: '#ff6b6b', max: '#51cf66' },
      values: { format: (v: number) => `${v.toFixed(1)} yr` },
    } satisfies BasePlotStylesConfig,
  },
};

/**
 * Inverted color ramp — swaps min/max colors so that higher values appear
 * in darker tones, reversing the typical visual weight.
 */
export const InvertedColorRamp: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
    x: 'province',
    y: 'sex',
    z: 'value',
    scales: {
      z: { domain: [70, 85] },
    },
    styles: {
      colors: { min: '#51cf66', max: '#ff6b6b' },
      values: { format: (v: number) => `${v.toFixed(1)} yr` },
    } satisfies BasePlotStylesConfig,
  },
};
