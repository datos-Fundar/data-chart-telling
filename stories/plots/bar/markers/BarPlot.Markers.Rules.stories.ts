import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { Marker } from '$lib/types/plots/markers';
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
 * Horizontal rule markers (ruleY) to highlight threshold values on the Y axis.
 * Useful for showing policy thresholds, targets, or average lines.
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
          strokeDasharray: '4 4',
          strokeOpacity: 0.7,
        },
      } satisfies Marker,
      {
        type: 'ruleY',
        y: 84.0,
        style: {
          strokeDasharray: '4 4',
          strokeOpacity: 0.7,
        },
      } satisfies Marker,
    ],
  },
};

/**
 * Single threshold marker — highlights a single policy target or average.
 * Helpful for comparing all provinces against a national standard.
 */
export const SingleThresholdMarker: Story = {
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
        y: 82.5,
        style: {
          stroke: '#f59f00',
          strokeWidth: 2,
          strokeDasharray: '6 4',
          strokeOpacity: 0.8,
        },
      } satisfies Marker,
    ],
  },
};

/**
 * Mixing two threshold markers with different styles — one dashed (target)
 * and one solid (warning level).
 */
export const MultipleThresholdsWithStyles: Story = {
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
          stroke: '#51cf66',
          strokeDasharray: '6 4',
          strokeOpacity: 0.7,
        },
      } satisfies Marker,
      {
        type: 'ruleY',
        y: 80.0,
        style: {
          stroke: '#ff6b6b',
          strokeWidth: 2,
          strokeOpacity: 0.6,
        },
      } satisfies Marker,
    ],
  },
};

/**
 * Two series with shared threshold markers. The markers apply to both series,
 * helping compare their relationship to the threshold.
 */
export const TwoSeriesWithThresholdMarkers: Story = {
  args: {
    data: LIFE_EXPECTANCY_BY_PROVINCE,
    x: 'province',
    y: 'value',
    z: 'sex',
    markers: [
      {
        type: 'ruleY',
        y: 80.0,
        style: {
          strokeDasharray: '4 4',
          strokeOpacity: 0.6,
        },
      } satisfies Marker,
      {
        type: 'ruleY',
        y: 82.0,
        style: {
          strokeDasharray: '4 4',
          strokeOpacity: 0.6,
        },
      } satisfies Marker,
    ],
  },
};
