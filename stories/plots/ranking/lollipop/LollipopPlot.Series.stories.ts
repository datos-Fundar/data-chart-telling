import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LollipopPlot from '$lib/plots/ranking/lollipop/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import { PROVINCE_VALUES, type ProvinceRow } from '$datasets';

/** One value per province: the female rows. */
const FEMALE = PROVINCE_VALUES.filter((row) => row.sex === 'female');

// ── Meta ──────────────────────────────────────────────────────────────────────
// Every series draws one lollipop per category of its rows: a dot at the value
// on a thin stem that rises from zero. String values on `x` stand the
// lollipops upright; on `y` they lie sideways. Grouping by `color` draws one
// set per group, each in its own color.

const meta = {
	title: 'Plots/Ranking/LollipopPlot/Series',
	component: LollipopPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { y: { domain: [70, 85] } }
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 500, step: 50 }
		},
		series: {
			description: 'Data series to render.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		}
	},
	parameters: {
		docs: { source: { name: 'LollipopPlot' } }
	}
} satisfies Meta<typeof LollipopPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** One value per province: female life expectancy at birth, in years. */
export const Default: Story = {
	args: {
		data: FEMALE,
		x: 'province',
		y: 'value'
	}
};

/** The categories on `y` and the values on `x` lay the same lollipops out sideways. */
export const Horizontal: Story = {
	args: {
		data: FEMALE,
		x: 'value',
		y: 'province',
		scales: { x: { domain: [70, 85] } }
	}
};

/** `color: 'province'` makes each province its own series, so every lollipop takes its own color. */
export const ColoredByCategory: Story = {
	args: {
		data: FEMALE,
		x: 'province',
		y: 'value',
		color: 'province'
	}
};

/** Pre-built `series`: one per group of provinces, each over its own rows. Series that share categories overlap, so split those with `facet` instead. */
export const SeriesBased: Story = {
	args: {
		series: [
			{
				name: 'Patagonia and Cuyo',
				x: 'province',
				y: 'value',
				data: FEMALE.filter((d) => ['Chubut', 'Mendoza'].includes(d.province))
			},
			{
				name: 'Center and Northwest',
				x: 'province',
				y: 'value',
				data: FEMALE.filter((d) => ['Buenos Aires', 'Córdoba', 'Salta'].includes(d.province))
			}
		] satisfies Series<ProvinceRow>[]
	}
};

/** `facet: { by: 'sex' }` draws one panel per sex on a shared scale, so the two compare side by side. */
export const FacetedBySex: Story = {
	args: {
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex',
		facet: { by: 'sex' }
	}
};
