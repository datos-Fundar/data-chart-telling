import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/dumbbell/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { PROVINCE_VALUES, type ProvinceRow } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Every category is two dots, one per series, joined by a connector: the gap between them
// is what the eye reads. Here, life expectancy at birth by sex in five provinces. String
// values on `x` stand the rows upright; on `y` they lie sideways.

const meta = {
	title: 'Plots/DumbbellPlot/Series',
	component: DumbbellPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		series: {
			description: 'Data series to render.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		}
	},
	parameters: {
		docs: { source: { name: 'DumbbellPlot' } }
	}
} satisfies Meta<typeof DumbbellPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** One dot per series in every category, each series in its own color. */
export const Default: Story = {
	args: {
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex'
	}
};

/** The categories on `y` and the values on `x` lay the same rows out sideways. */
export const Horizontal: Story = {
	args: {
		data: PROVINCE_VALUES,
		x: 'value',
		y: 'province',
		color: 'sex'
	}
};

/** Pre-built `series`: one per sex, each over its own rows, joined where they share a category. */
export const SeriesBased: Story = {
	args: {
		series: [
			{
				name: 'Female',
				x: 'province',
				y: 'value',
				data: PROVINCE_VALUES.filter((d) => d.sex === 'female')
			},
			{
				name: 'Male',
				x: 'province',
				y: 'value',
				data: PROVINCE_VALUES.filter((d) => d.sex === 'male')
			}
		] satisfies Series<ProvinceRow>[]
	}
};

/** `r: 'population'` sizes every dot by its row's population (millions); the legend gets a size section, titled here through `legend.r.title`. A number is a fixed radius in pixels instead. */
export const SizedByPopulation: Story = {
	args: {
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex',
		r: 'population',
		legend: { r: { title: 'Population (millions)' } }
	}
};
