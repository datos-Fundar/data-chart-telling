import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { COUNTRIES, AMERICAS } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/ScatterPlot/Markers/Rules',
  component: ScatterPlot,
  tags: ['autodocs'],
  args: {
    width: 950,
    height: 500,
    data: AMERICAS,
    x: 'gdpPerCapita',
    y: 'lifeExpectancy',
  },
  argTypes: {
    width: { control: { type: 'range', min: 300, max: 950, step: 50 } },
    height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
    data: { control: false },
    markers: { description: 'Marker annotations.', control: false },
  },
  parameters: {
    docs: { source: { name: 'ScatterPlot' } },
  },
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** Vertical rule marker (ruleX) to highlight a specific GDP threshold. */
export const WithRuleXMarker: Story = {
  args: {
    markers: [
      { type: 'rule', axis: 'x', value: 15, style: { strokeDasharray: '4 4', strokeOpacity: 0.7 } },
    ] satisfies AxisBasedMarkersConfig[],
  },
};

/** Horizontal rule marker (ruleY) to highlight a life-expectancy threshold. */
export const WithRuleYMarker: Story = {
  args: {
    markers: [
      { type: 'rule', axis: 'y', value: 75, style: { strokeDasharray: '6 6', strokeOpacity: 0.5 } },
    ] satisfies AxisBasedMarkersConfig[],
  },
};

/**
 * Quadrant dividers — one `ruleX` and one `ruleY` at the median GDP/life
 * expectancy split the plot into four quadrants (low/high GDP × low/high
 * life expectancy), a common scatter-chart annotation. No scatter-specific
 * marker is needed: `rule` is already a shared axis-based marker kind.
 */
export const QuadrantDividers: Story = {
  args: {
    data: COUNTRIES,
    z: 'region',
    markers: [
      { type: 'rule', axis: 'x', value: 15, style: { strokeDasharray: '4 4', strokeOpacity: 0.5 } },
      { type: 'rule', axis: 'y', value: 75, style: { strokeDasharray: '4 4', strokeOpacity: 0.5 } },
    ] satisfies AxisBasedMarkersConfig[],
  },
};
