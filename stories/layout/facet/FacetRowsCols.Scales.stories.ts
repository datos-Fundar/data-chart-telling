import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import { TIME_SERIES } from '../../data/time-series';
import { CAR_SPECS } from '../../data/car-specs';

/**
 * A plot's own `facet` prop as a `rows` × `cols` grid: one facet per
 * combination, with each value labelled. Facets share their x and y scales by default, so panels compare at
 * a glance; `scales` frees one axis or both, and `axes: 'outer'` keeps only
 * the axes on the grid's left and bottom edges.
 */
const meta = {
	title: 'Layout/Facets/RowsAndCols',
	component: BarPlot,
	parameters: { docs: { source: { name: 'BarPlot' } } },
	tags: ['autodocs'],
	args: {
		width: 720,
		height: 460,
		data: TIME_SERIES,
		x: 'year',
		y: 'value',
		color: 'metric'
	},
	argTypes: {
		data: { control: false },
		facet: { control: false }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Shared by default: both regions' bars stand on the same value axis. */
export const SharedScales: Story = {
	args: {
		title: 'Indicators by region',
		subtitle: 'Facets share their scales by default',
		facet: { by: 'region', columns: 2 }
	}
};

/** `scales: 'free-y'`: each region fits its own value axis; the year axis stays shared. */
export const FreeY: Story = {
	args: {
		title: 'Indicators by region',
		subtitle: "scales: 'free-y'",
		facet: { by: 'region', columns: 2, scales: 'free-y' }
	}
};

/** `rows` × `cols`: one facet per metric and region, each column labelled above and each row beside. */
export const RowsAndCols: Story = {
	args: {
		title: 'Each indicator by region',
		subtitle: 'facet: { rows: metric, cols: region }',
		color: undefined,
		facet: { rows: 'metric', cols: 'region' }
	}
};

/** `axes: 'outer'`: only the left column's y axis and the bottom row's x axis draw; panels stay aligned. */
export const OuterAxes: Story = {
	args: {
		title: 'Each indicator by region',
		subtitle: "axes: 'outer'",
		color: undefined,
		facet: { rows: 'metric', cols: 'region', axes: 'outer' }
	}
};

/**
 * Metrics on wildly different units (horsepower vs. kilograms): a grid with
 * `scales: 'free-y'` shares the value axis along each row only, while every
 * column keeps the same models.
 */
export const FreeYPerRow: Story = {
	args: {
		width: 760,
		height: 640,
		data: CAR_SPECS,
		x: 'model',
		y: 'value',
		color: undefined,
		title: 'Car specs by metric',
		subtitle: "rows: metric, scales: 'free-y'",
		facet: { rows: 'metric', scales: 'free-y', axes: 'outer' }
	}
};
