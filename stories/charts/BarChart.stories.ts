import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarChart from '$lib/charts/kinds/BarChart.svelte';
import BarTimeline from './wrappers/BarTimeline.svelte';
import BarTimelineFacet from './wrappers/BarTimelineFacet.svelte';
import { REGION_BARS, TIME_SERIES, type SeriesPoint } from './data';

const meta = {
  title: 'Charts/BarChart',
  component: BarChart,
  tags: ['autodocs'],
  args: {
    width: 680,
    height: 460,
    data: REGION_BARS,
    x: 'region',
    y: 'value',
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 1000, step: 20 } },
    height: { control: { type: 'range', min: 240, max: 700, step: 20 } },
    data: { control: false },
    x: { control: false },
    y: { control: false },
    z: { control: false },
    colors: { control: false },
    facet: { control: false },
    timeline: { control: false },
    legend: { control: false },
  },
} satisfies Meta<typeof BarChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Single categorical bar series wrapped in the chart container. */
export const Default: Story = {
  args: {
    title: 'Valor por región',
    subtitle: 'Año 2022',
    data: REGION_BARS.filter((d) => d.year === 2022),
  },
};

/**
 * The timeline binds `progress` (a 0–1 scrubber) to the distinct years; the
 * bars redraw for the selected year. Drag the scrubber above the chart.
 */
export const WithTimeline: StoryObj = {
  render: () => ({ Component: BarTimeline }),
};

/**
 * Faceted small multiples — one bar panel per metric — sharing a legend.
 * Uses the grouped time-series dataset with `x = year`.
 */
export const Faceted: Story = {
  args: {
    title: 'Indicadores por métrica',
    subtitle: 'Facetado por métrica',
    data: TIME_SERIES.filter((d) => d.region === 'Norte'),
    x: 'year',
    colors: { series: '#4f46e5' },
    facet: { by: 'metric' as keyof SeriesPoint, columns: 2 },
  },
};

/** Timeline + facet together: a shared year scrubber across faceted panels. */
export const TimelineAndFacet: StoryObj = {
  render: () => ({ Component: BarTimelineFacet }),
};
