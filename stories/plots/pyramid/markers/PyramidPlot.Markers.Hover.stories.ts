import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { Series } from '$lib/types/plots/data/common';
import { AGE_GROUPS, POPULATION_PYRAMID, type PopulationRow } from '../../../data/population-pyramid';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/PyramidPlot/Markers/Hover',
  component: PyramidPlot,
  tags: ['autodocs'],
  args: {
    width: 940,
    height: 520,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
    height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
    markers: { control: false },
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
 * Basic hover marker — dots appear on both the female and male bars at the
 * hovered age group, along with a dashed horizontal rule (`ruleY` is implied
 * by default, since pyramid's default hover strategy is `'y'` — it matches
 * by row, not by side). No floating HTML tooltip is involved.
 */
export const Basic: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } },
    markers: [
      {
        type: 'hover',
      },
    ] satisfies AxisBasedMarkersConfig[],
  },
};

/**
 * Dots only — `showLabels: false` suppresses the value labels next to each
 * dot, leaving just the position indicators and the crosshair rule.
 */
export const WithoutLabels: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } },
    markers: [
      {
        type: 'hover',
        showLabels: false,
      },
    ] satisfies AxisBasedMarkersConfig[],
  },
};

/**
 * Dots and labels only — `ruleY: false` hides the horizontal crosshair rule
 * that's implied by default, so only the dots and their labels are drawn.
 */
export const WithoutRule: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } },
    markers: [
      {
        type: 'hover',
        ruleY: false,
      },
    ] satisfies AxisBasedMarkersConfig[],
  },
};

/**
 * Both crosshair rules — `ruleX: true` adds a vertical rule at each bar's
 * magnitude on top of the default `ruleY: true` row rule, drawing a full
 * crosshair per side.
 */
export const WithBothAxis: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } },
    markers: [
      {
        type: 'hover',
        ruleX: true,
        ruleY: true,
      },
    ] satisfies AxisBasedMarkersConfig[],
  },
};

/**
 * Custom rule style — `ruleStyle` overrides the crosshair stroke. Here the
 * rule renders in red with a solid line and higher opacity.
 */
export const WithCustomRuleStyle: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: {
      x: { domain: [-6, 6] },
      y: { domain: AGE_GROUPS }
    },
    markers: [
      {
        type: 'hover',
        ruleStyle: {
          stroke: '#e63946',
          strokeOpacity: 0.7,
          strokeWidth: 2,
          strokeDasharray: '6 3',
        },
      },
    ] satisfies AxisBasedMarkersConfig[],
  },
};

/**
 * Label anchored outside the dot — `fontStyle.textAnchor: 'outside'` resolves
 * per point from its signed magnitude: the female (negative x) label sits to
 * the left of its dot, the male (positive x) label sits to the right —
 * mirroring the value labels' own `anchor: 'outside'` convention.
 */
export const LabelOutsideDot: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: {
      x: { domain: [-6, 6] },
      y: { domain: AGE_GROUPS },
    },
    markers: [
      {
        type: 'hover',
        fontStyle: {
          textAnchor: 'outside',
        },
      },
    ] satisfies AxisBasedMarkersConfig[],
  },
};

/**
 * Series-scoped marker — `series: 'Mujeres'` restricts the hover dot to the
 * female (left) side only. Hovering over the male bars produces no dot even
 * though both sides are rendered.
 *
 * Compare with `Basic` to see the difference.
 */
export const SeriesScoped: Story = {
  args: {
    data: DATA,
    x: 'pct',
    y: 'ageGroup',
    z: 'sex',
    scales: { y: { domain: AGE_GROUPS } },
    markers: [
      {
        type: 'hover',
        series: 'Mujeres',
        fontStyle: {
          textAnchor: 'outside',
        },
      },
    ] satisfies AxisBasedMarkersConfig[],
  },
};

/**
 * Hover marker on explicit series — the same unscoped hover marker behaves
 * identically whether the pyramid is built from the data/x/y/z shorthand
 * (see `Basic`) or, as here, an explicit two-series array (see `ExplicitSeries`
 * in the Series stories).
 */
export const FromExplicitSeries: Story = {
  args: {
    series: [
      {
        name: 'Mujeres',
        x: 'ageGroup',
        y: 'pct',
        data: DATA.filter((d) => d.sex === 'Mujeres'),
      } satisfies Series<PopulationRow>,
      {
        name: 'Varones',
        x: 'ageGroup',
        y: 'pct',
        data: DATA.filter((d) => d.sex === 'Varones'),
      } satisfies Series<PopulationRow>,
    ],
    scales: { y: { domain: AGE_GROUPS } },
    markers: [
      {
        type: 'hover',
        fontStyle: {
          textAnchor: 'outside',
        },
      },
    ] satisfies AxisBasedMarkersConfig[],
  },
};
