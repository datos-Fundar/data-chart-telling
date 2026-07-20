import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { Marker } from '$lib/types/markers/common';
import {
  FEMALE_LIFE_EXPECTANCY,
  LIFE_EXPECTANCY,
} from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/LinePlot/Markers/Rules',
  component: LinePlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 400,
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
    docs: { source: { name: 'LinePlot' } },
  },
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Vertical rule markers (ruleX) to highlight specific years.
 */
export const WithRuleXMarkers: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    markers: [
      {
        type: 'ruleX',
        x: 2014,
        style: {
          strokeDasharray: '4 4',
          strokeOpacity: 0.7
        }
      } satisfies Marker,
      {
        type: 'ruleX',
        x: 2018,
        style: {
          strokeDasharray: '4 4',
          strokeOpacity: 0.7
        }
      } satisfies Marker,
    ],
  },
};

/**
 * Horizontal rule markers (ruleY) to highlight threshold values.
 */
export const WithRuleYMarkers: Story = {
  args: {
    series: [
      {
        name: 'female',
        x: 'year',
        y: 'value',
        data: FEMALE_LIFE_EXPECTANCY
      },
    ],
    markers: [
      {
        type: 'ruleY',
        y: 81.0,
        style: {
          strokeDasharray: '6 6',
          strokeOpacity: 0.5
        }
      } satisfies Marker,
      {
        type: 'ruleY',
        y: 83.7,
        style: {
          strokeDasharray: '6 6',
          strokeOpacity: 0.5
        }
      } satisfies Marker,
    ],
  },
};

/**
 * Mixing vertical and horizontal markers on the same chart.
 */
export const WithMixedMarkers: Story = {
  args: {
    data: LIFE_EXPECTANCY,
    x: 'year',
    y: 'value',
    z: 'sex',
    markers: [
      {
        type: 'ruleX',
        x: 2018,
        style: {
          strokeDasharray: '4 4',
          strokeOpacity: 0.6
        }
      } satisfies Marker,
      {
        type: 'ruleY',
        y: 78.7,
        style: {
          strokeDasharray: '6 6',
          strokeOpacity: 0.5
        }
      } satisfies Marker,
    ],
  },
};
