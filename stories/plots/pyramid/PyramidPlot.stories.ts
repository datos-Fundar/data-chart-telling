import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../data/population-pyramid';
type Row = { ageGroup: string; pct: number };

const YEAR = 2022;

const women: Row[] = POPULATION_PYRAMID.filter((d) => d.year === YEAR && d.sex === 'Mujeres');
const men: Row[] = POPULATION_PYRAMID.filter((d) => d.year === YEAR && d.sex === 'Varones');

// 'Mujeres' < 'Varones' alphabetically → Mujeres goes left, Varones right.
const SERIES = [
  { name: 'Mujeres', x: 'ageGroup', y: 'pct', data: women },
  { name: 'Varones', x: 'ageGroup', y: 'pct', data: men },
];

const meta = {
  title: 'Plots/PyramidPlot',
  component: PyramidPlot,
  tags: ['autodocs'],
  args: {
    width: 560,
    height: 520,
    series: SERIES,
    scales: { y: { label: 'Grupo de edad', domain: AGE_GROUPS } },
    styles: { values: { format: (v: number) => `${v.toFixed(1)}%` } },
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 900, step: 20 } },
    height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
    series: { control: false },
    segments: { control: false },
  },
  parameters: {
    docs: { source: { name: 'PyramidPlot' } },
  },
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two mirrored series — women on the left, men on the right. */
export const Default: Story = {};

/** Custom left/right colours instead of the default palette. */
export const CustomColors: Story = {
  args: {
    styles: { colors: { left: '#d6336c', right: '#1971c2' } },
  },
};

/** Each bar's magnitude printed beside it. */
export const WithValueLabels: Story = {
  args: {
    styles: { values: { show: true } },
  },
};

/**
 * `segments` dims every age group but a highlighted few.
 */
export const HighlightedSegments: Story = {
  args: {
    segments: Object.fromEntries(
      (['Mujeres', 'Varones'] as const).map((name) => [
        name,
        AGE_GROUPS.map((ageGroup) => ({
          from: ageGroup,
          to: ageGroup,
          style: { fillOpacity: ['80-84', '85+'].includes(ageGroup) ? 1 : 0.25 },
        })),
      ]),
    ),
  },
};

/** A `ruleX` marker flags a magnitude threshold on the diverging axis. */
export const WithRuleMarker: Story = {
  args: {
    markers: [{ type: 'ruleX', x: 3, style: { stroke: '#f59f00', strokeDasharray: '4 4' } }],
  },
};
