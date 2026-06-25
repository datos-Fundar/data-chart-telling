import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { Marker } from '$lib/types/plots/markers';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../../data/population-pyramid';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/PyramidPlot/Markers/Rules',
  component: PyramidPlot,
  tags: ['autodocs'],
  args: {
    width: 560,
    height: 520,
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 900, step: 20 } },
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
const BASE_ARGS = {
  data: DATA,
  x: 'pct',
  y: 'ageGroup',
  z: 'sex',
  scales: { y: { domain: AGE_GROUPS } },
};

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Vertical rule marker (ruleX) to highlight a magnitude threshold on the
 * diverging axis. Useful for showing a policy threshold, average, or
 * comparative benchmark.
 */
export const WithRuleXMarker: Story = {
  args: {
    ...BASE_ARGS,
    markers: [
      {
        type: 'ruleX',
        x: 3,
        style: {
          stroke: '#f59f00',
          strokeDasharray: '4 4',
          strokeOpacity: 0.7,
        },
      } satisfies Marker,
    ],
  },
};

/**
 * Multiple threshold markers — shows two reference lines, useful for
 * comparing against multiple benchmarks or targets.
 */
export const MultipleThresholdMarkers: Story = {
  args: {
    ...BASE_ARGS,
    markers: [
      {
        type: 'ruleX',
        x: 2.5,
        style: {
          stroke: '#51cf66',
          strokeDasharray: '6 4',
          strokeOpacity: 0.6,
        },
      } satisfies Marker,
      {
        type: 'ruleX',
        x: 3.5,
        style: {
          stroke: '#ff6b6b',
          strokeDasharray: '4 4',
          strokeOpacity: 0.6,
        },
      } satisfies Marker,
    ],
  },
};

/**
 * Symmetric threshold markers — shows equal-magnitude reference lines on
 * both sides (±2%), useful for visualizing symmetry or balance around
 * a central point.
 */
export const SymmetricMarkers: Story = {
  args: {
    ...BASE_ARGS,
    markers: [
      {
        type: 'ruleX',
        x: -2,
        style: {
          stroke: '#748ffc',
          strokeWidth: 1.5,
          strokeOpacity: 0.5,
        },
      } satisfies Marker,
      {
        type: 'ruleX',
        x: 2,
        style: {
          stroke: '#748ffc',
          strokeWidth: 1.5,
          strokeOpacity: 0.5,
        },
      } satisfies Marker,
    ],
  },
};

/**
 * Average-based marker — a single rule at 3% representing the average cohort
 * size, helping identify which age groups are above or below average.
 */
export const AverageMarker: Story = {
  args: {
    ...BASE_ARGS,
    markers: [
      {
        type: 'ruleX',
        x: 3.0,
        style: {
          stroke: '#495057',
          strokeWidth: 2,
          strokeDasharray: '2 4',
          strokeOpacity: 0.7,
        },
      } satisfies Marker,
    ],
  },
};

/**
 * Policy threshold marker — a prominent red rule indicating a critical
 * population percentage threshold, useful for policy discussions or targets.
 */
export const PolicyThresholdMarker: Story = {
  args: {
    ...BASE_ARGS,
    markers: [
      {
        type: 'ruleX',
        x: 4.0,
        style: {
          stroke: '#d9480f',
          strokeWidth: 2.5,
          strokeDasharray: '3 3',
          strokeOpacity: 0.8,
        },
      } satisfies Marker,
    ],
  },
};
