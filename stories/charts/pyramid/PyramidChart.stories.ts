import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidChart from '$lib/charts/pyramid/Chart.svelte';
import PyramidTimeline from './PyramidTimeline.svelte';
import PyramidTimelineInterpolated from './PyramidTimelineInterpolated.svelte';
import { AGE_GROUPS, POPULATION_PYRAMID, type PopulationRow } from '../../data/population-pyramid';
import type { LegendSection } from '$lib/types/charts/legend';

const legend: LegendSection[] = [
  {
    type: 'discrete',
    items: [
      { name: 'Mujeres', color: '#d6336c', symbol: 'square' },
      { name: 'Varones', color: '#1971c2', symbol: 'square' },
    ],
    columns: 2,
  },
];

const meta = {
  title: 'Charts/PyramidChart',
  component: PyramidChart,
  tags: ['autodocs'],
  args: {
    width: 680,
    height: 560,
    y: 'ageGroup' as keyof PopulationRow,
    x: 'pct' as keyof PopulationRow,
    z: 'sex' as keyof PopulationRow,
    scales: { y: { domain: AGE_GROUPS } },
    styles: { colors: { left: '#d6336c', right: '#1971c2' }, values: { format: (v: number) => `${v.toFixed(1)}%` } },
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 1000, step: 20 } },
    height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
    data: { control: false },
    z: { control: false },
    segments: { control: false },
    facet: { control: false },
    timeline: { control: false },
    legend: { control: false },
  },
} satisfies Meta<typeof PyramidChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A static pyramid for one year, with a discrete legend for the two sides. */
export const Default: Story = {
  args: {
    title: 'Pirámide poblacional',
    subtitle: 'Censo 2022',
    data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
    legend,
  },
};

/** `showValues` prints each bar's magnitude beside it. */
export const WithValueLabels: Story = {
  args: {
    title: 'Pirámide poblacional',
    subtitle: 'Censo 2022',
    data: POPULATION_PYRAMID.filter((d) => d.year === 2022),
    legend,
    styles: { values: { show: true } },
  },
};

/**
 * Interactive year timeline (vertical gutter), exactly like the bar/heatmap
 * timelines — drag the scrubber to morph the pyramid from 1991 to 2040.
 */
export const WithTimeline: StoryObj = {
  render: () => ({ Component: PyramidTimeline }),
};

/**
 * `interpolate` crossfades each bar's magnitude between its real values at
 * the two censuses bracketing the scrub position, instead of cutting
 * straight from one snapshot to the next — `interpolate: true` reuses the
 * chart's own `value` (and `category`/`z` as the per-bar key), no extra
 * wiring needed.
 */
export const WithInterpolatedTimeline: StoryObj = {
  render: () => ({ Component: PyramidTimelineInterpolated }),
};

/**
 * `segments` dims every age group but a highlighted few while the timeline
 * runs.
 */
export const WithTimelineAndHighlight: StoryObj = {
  render: () => ({ Component: PyramidTimeline, props: { highlight: ['0-4', '5-9', '10-14'] } }),
};

/** Faceted small multiples — one pyramid per decade. */
export const Faceted: Story = {
  args: {
    title: 'Pirámide poblacional por año',
    subtitle: 'Facetado por año',
    data: POPULATION_PYRAMID.filter((d) => [1991, 2022, 2030, 2040].includes(d.year)),
    legend,
    facet: { by: 'year' as keyof PopulationRow, columns: 2 },
  },
};
