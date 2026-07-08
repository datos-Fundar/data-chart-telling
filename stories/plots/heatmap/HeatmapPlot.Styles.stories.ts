import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/common';
import type { PlotStyles } from '$lib/types/plots/styles';
import { EMPLOYMENT_BY_AGE_PROVINCE, type AgeProvinceCell } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/HeatmapPlot/Styles',
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
    styles: { control: false },
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
 * No style overrides — the plot uses the configured theme defaults.
 * Cell values are displayed and color ramp is auto-selected.
 */
export const Default: Story = {
  args: { series: SERIES },
};

/**
 * Hide cell value labels — `styles.values.show: false` removes the numeric
 * labels from each cell, useful when cells are small or data density is high.
 */
export const NoValueLabels: Story = {
  args: {
    series: SERIES,
    styles: {
      values: { show: false },
    } satisfies PlotStyles,
  },
};

/**
 * Custom value format — the `format(value)` callback controls how cell values
 * are displayed. Here percentages are shown as percentages with one decimal place.
 */
export const CustomValueFormat: Story = {
  args: {
    series: SERIES,
    styles: {
      values: { format: (v: number) => `${(v * 100).toFixed(0)}%` },
    } satisfies PlotStyles,
  },
};

/**
 * Warm color ramp — overrides the default colour scheme to a warm palette
 * (dark blue to light blue) instead of the default viridis-like ramp.
 */
export const WarmColorRamp: Story = {
  args: {
    series: SERIES,
    styles: {
      colors: { min: 'darkblue', max: 'cornflowerblue' },
      values: { format: (v: number) => `${(v * 100).toFixed(0)}%` },
    } satisfies PlotStyles,
  },
};

/**
 * Custom color ramp — full control over the color gradient from min to max.
 * Here a red-to-green ramp emphasizes high and low employment rates.
 */
export const CustomColorRamp: Story = {
  args: {
    series: SERIES,
    styles: {
      colors: { min: '#ff6b6b', max: '#51cf66' },
      values: { format: (v: number) => `${(v * 100).toFixed(0)}%` },
    } satisfies PlotStyles,
  },
};

/**
 * No values, custom color ramp — combines value label hiding with a distinct
 * color scheme for pure visual comparison without numeric clutter.
 */
export const PureVisualNoLabels: Story = {
  args: {
    series: SERIES,
    styles: {
      colors: { min: '#f8f9fa', max: '#1971c2' },
      values: { show: false },
    } satisfies PlotStyles,
  },
};

/**
 * High contrast colors — uses a purple-to-yellow ramp for maximum contrast
 * and visibility of the employment rate gradient across regions.
 */
export const HighContrastColors: Story = {
  args: {
    series: SERIES,
    styles: {
      colors: { min: '#5f3dc4', max: '#ffd43b' },
      values: { format: (v: number) => `${(v * 100).toFixed(1)}%` },
    } satisfies PlotStyles,
  },
};

/**
 * Inverted color ramp — swaps min/max colors so that higher values appear
 * in darker tones, reversing the typical visual weight.
 */
export const InvertedColorRamp: Story = {
  args: {
    series: SERIES,
    styles: {
      colors: { min: '#51cf66', max: '#ff6b6b' },
      values: { format: (v: number) => `${(v * 100).toFixed(0)}%` },
    } satisfies PlotStyles,
  },
};
