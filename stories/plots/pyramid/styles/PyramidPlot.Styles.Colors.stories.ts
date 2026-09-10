import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../../data/population-pyramid';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/PyramidPlot/Styles/Colors',
  component: PyramidPlot,
  tags: ['autodocs'],
  args: {
    width: 940,
    height: 520,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
    height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
    styles: { control: false },
  },
  parameters: {
    docs: { source: { name: 'PyramidPlot' } },
  },
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const DATA = POPULATION_PYRAMID.filter((d) => d.year === 2022);

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No style overrides — the plot uses the configured theme defaults.
 * The palette chooses colors for left/right (female/male) automatically.
 */
export const Default: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } },
  },
};

/**
 * Custom left/right colours — overrides the default palette with explicit
 * colors for the left (Female) and right (Male) sides of the pyramid.
 */
export const CustomColors: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: {
      y: { domain: AGE_GROUPS }
    },
    styles: {
      colors: { left: '#ff6b9d', right: '#4ecdc4' },
    } satisfies AxisBasedStylesConfig,
  },
};

/**
 * Custom colors with value labels — combines a distinct color scheme with
 * on-bar annotations for maximum information density.
 */
export const CustomColorsAndLabels: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: {
      x: { domain: [-6, 6] },
      y: { domain: AGE_GROUPS }
    },
    styles: {
      colors: { left: '#9c27b0', right: '#ff9800' },
      values: { show: true, format: (v: number) => `${v.toFixed(1)}%` },
    } satisfies AxisBasedStylesConfig,
  },
};
