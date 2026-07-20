import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/plots/props';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../data/population-pyramid';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/PyramidPlot/Scales',
  component: PyramidPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 520,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 950, step: 20 } },
    height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
    scales: { control: false },
  },
  parameters: {
    docs: { source: { name: 'PyramidPlot' } },
  },
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No scale overrides — both axes are auto-fitted to the data extent.
 */
export const Default: Story = {
  args: {
    data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
  },
};

/**
 * Explicit age group domain — ensures age groups appear in the desired order
 * (from youngest at bottom to oldest at top). The `domain` array pins the
 * exact order and set of values shown.
 */
export const WithAgeGroupDomain: Story = {
  args: {
    data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } } satisfies AxisBasedScalesConfig,
  },
};

/**
 * Axis labels — human-readable strings appear alongside each axis,
 * making the pyramid more interpretable.
 */
export const WithAxisLabels: Story = {
  args: {
    data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: {
      x: { label: 'Population %' },
      y: { label: 'Age Group', domain: AGE_GROUPS },
    } satisfies AxisBasedScalesConfig,
  },
};

/**
 * Custom X domain — constrains the diverging axis (X) to a tighter range.
 * Useful when one side dominates and you want to zoom in on the variation.
 */
export const CustomXDomain: Story = {
  args: {
    data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: {
      x: { domain: [0, 6] },
      y: { domain: AGE_GROUPS },
    } satisfies AxisBasedScalesConfig,
  },
};

/**
 * Custom tick formatter on X — the function receives the raw tick value and
 * returns the display string. Here percentages are shown with the % symbol.
 */
export const CustomXTickFormat: Story = {
  args: {
    data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: {
      x: {
        label: 'Population %',
        tickFormat: (d: unknown) => `${d}%`,
      },
      y: { label: 'Age Group', domain: AGE_GROUPS },
    } satisfies AxisBasedScalesConfig,
  },
};

/**
 * Grid on X axis — adds vertical reference lines at each tick, making it
 * easier to compare population percentages across age groups.
 */
export const WithXGrid: Story = {
  args: {
    data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: {
      x: { grid: true, label: 'Population %' },
      y: { label: 'Age Group', domain: AGE_GROUPS },
    } satisfies AxisBasedScalesConfig,
  },
};

/**
 * Combined overrides — labelled axes with custom domain, custom tick format,
 * grid on X, and expanded margins to accommodate labels.
 */
export const CombinedOverrides: Story = {
  args: {
    data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: {
      x: {
        label: 'Population Percentage',
        domain: [0, 6],
        tickFormat: (d: unknown) => `${d}%`,
        grid: true,
      },
      y: { label: 'Age Group', domain: AGE_GROUPS },
    } satisfies AxisBasedScalesConfig,
    margins: { left: 60, bottom: 50 },
  },
};
