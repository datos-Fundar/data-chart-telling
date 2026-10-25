import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { ARGENTINA_CHILE_TRENDS, IRIS_LONG } from '$datasets';

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
		data: ARGENTINA_CHILE_TRENDS,
		x: 'year',
		y: 'value',
		color: 'metric'
	},
	argTypes: {
		data: { control: false },
		facet: { control: false }
	}
} satisfies Meta<typeof BarPlot>;

/** The mean of each measurement per species: three bars per metric. */
const SPECIES_MEANS = [...new Set(IRIS_LONG.map((d) => `${d.species}|${d.metric}`))].map((key) => {
	const [species, metric] = key.split('|');
	const rows = IRIS_LONG.filter((d) => d.species === species && d.metric === metric);
	return { species, metric, value: rows.reduce((sum, d) => sum + d.value, 0) / rows.length };
});

export default meta;
type Story = StoryObj<typeof meta>;

/** Shared by default: both countries' bars stand on the same value axis. */
export const SharedScales: Story = {
	args: {
		title: 'Indicators by country',
		subtitle: 'Facets share their scales by default',
		facet: { by: 'country', columns: 2 }
	}
};

/** `scales: 'free-y'`: each country fits its own value axis; the year axis stays shared. */
export const FreeY: Story = {
	args: {
		title: 'Indicators by country',
		subtitle: "scales: 'free-y'",
		facet: { by: 'country', columns: 2, scales: 'free-y' }
	}
};

/** `rows` × `cols`: one facet per metric and country, each column labelled above and each row beside. */
export const RowsAndCols: Story = {
	args: {
		title: 'Each indicator by country',
		subtitle: 'facet: { rows: metric, cols: country }',
		color: undefined,
		facet: { rows: 'metric', cols: 'country' }
	}
};

/** `axes: 'outer'`: only the left column's y axis and the bottom row's x axis draw; panels stay aligned. */
export const OuterAxes: Story = {
	args: {
		title: 'Each indicator by country',
		subtitle: "axes: 'outer'",
		color: undefined,
		facet: { rows: 'metric', cols: 'country', axes: 'outer' }
	}
};

/**
 * Measurements on different ranges (petal width under 3 cm, sepal length near
 * 8): a grid with `scales: 'free-y'` shares the value axis along each row only,
 * while every column keeps the same species.
 */
export const FreeYPerRow: Story = {
	args: {
		width: 760,
		height: 640,
		data: SPECIES_MEANS,
		x: 'species',
		y: 'value',
		color: undefined,
		title: 'Iris measurements by species',
		subtitle: "rows: metric, scales: 'free-y'",
		facet: { rows: 'metric', scales: 'free-y', axes: 'outer' }
	}
};
