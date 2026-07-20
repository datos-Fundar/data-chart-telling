import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Marker } from '$lib/types/markers/common';
import { LIFE_EXPECTANCY_BY_PROVINCE_SEX } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/HeatmapPlot/Markers/Rules',
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
    markers: { control: false },
  },
  parameters: {
    docs: { source: { name: 'HeatmapPlot' } },
  },
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const SERIES = [
  {
    name: 'life_expectancy',
    x: 'province',
    y: 'sex',
    z: 'value',
    data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
  },
];

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Vertical rule markers (ruleX) to highlight specific provinces on the
 * categorical x axis.
 */
export const WithRuleXMarkers: Story = {
  args: {
    series: SERIES,
    markers: [
      {
        type: 'ruleX',
        x: 'Córdoba',
        style: {
          strokeDasharray: '4 4',
          strokeOpacity: 0.7,
        },
      } satisfies Marker,
      {
        type: 'ruleX',
        x: 'Tucumán',
        style: {
          strokeDasharray: '4 4',
          strokeOpacity: 0.7,
        },
      } satisfies Marker,
    ],
  },
};

/**
 * Horizontal rule markers (ruleY) to highlight specific rows on the
 * categorical y axis — here, both sexes get their own dashed rule.
 */
export const WithRuleYMarkers: Story = {
  args: {
    series: SERIES,
    markers: [
      {
        type: 'ruleY',
        y: 'Female',
        style: {
          strokeDasharray: '6 6',
          strokeOpacity: 0.5,
        },
      } satisfies Marker,
      {
        type: 'ruleY',
        y: 'Male',
        style: {
          strokeDasharray: '6 6',
          strokeOpacity: 0.5,
        },
      } satisfies Marker,
    ],
  },
};

/**
 * Mixing a vertical and a horizontal marker on the same chart, on grouped
 * data via the data/x/y/z shorthand.
 */
export const WithMixedMarkers: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
    x: 'province',
    y: 'sex',
    z: 'value',
    markers: [
      {
        type: 'ruleX',
        x: 'Buenos Aires',
        style: {
          strokeDasharray: '4 4',
          strokeOpacity: 0.6,
        },
      } satisfies Marker,
      {
        type: 'ruleY',
        y: 'Female',
        style: {
          strokeDasharray: '6 6',
          strokeOpacity: 0.5,
        },
      } satisfies Marker,
    ],
  },
};
