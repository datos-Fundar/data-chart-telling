import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { Marker } from '$lib/types/markers/common';
import {
  FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
  LIFE_EXPECTANCY_BY_PROVINCE,
} from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/BarPlot/Markers/Rules',
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
      table: { type: { summary: 'Series<TData>[]' }, category: 'Data' },
    },
    markers: {
      description: 'Marker annotations.',
      control: false,
    },
  },
  parameters: {
    docs: { source: { name: 'BarPlot' } },
  },
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Vertical rule markers (ruleX) to highlight specific provinces on the
 * categorical x axis.
 */
export const WithRuleXMarkers: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      },
    ],
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
 * Horizontal rule markers (ruleY) to highlight threshold values, such as a
 * national average or a policy target.
 */
export const WithRuleYMarkers: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'province',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
      },
    ],
    markers: [
      {
        type: 'ruleY',
        y: 82.0,
        style: {
          strokeDasharray: '6 6',
          strokeOpacity: 0.5,
        },
      } satisfies Marker,
      {
        type: 'ruleY',
        y: 84.0,
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
 * data with both sexes.
 */
export const WithMixedMarkers: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
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
        y: 78.7,
        style: {
          strokeDasharray: '6 6',
          strokeOpacity: 0.5,
        },
      } satisfies Marker,
    ],
  },
};
