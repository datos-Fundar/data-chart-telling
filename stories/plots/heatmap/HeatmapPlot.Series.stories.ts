import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import {
	LIFE_EXPECTANCY_BY_PROVINCE_SEX,
	FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
	MALE_LIFE_EXPECTANCY_BY_PROVINCE,
	type ProvinceSexCell
} from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/HeatmapPlot/Series',
	component: HeatmapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		series: { control: false },
		data: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HeatmapPlot' } }
	}
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Single series with explicit series object — data is grouped into one series
 * with x, y, color dimensions mapping to 'province', 'sex', and 'value' fields.
 *
 * The heatmap displays life expectancy across provinces and sex.
 */
export const Default: Story = {
	args: {
		series: [
			{
				name: 'life_expectancy',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
			} satisfies Series<ProvinceSexCell>
		]
	}
};

/**
 * Alternative data structure — the same grid built from two separate
 * per-sex series instead of one combined array. Each series only carries
 * its own row of cells; `HeatmapPlot` merges every series' data onto the
 * same x/y/color accessors before drawing.
 */
export const TwoSeriesBySex: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			} satisfies Series<ProvinceSexCell>,
			{
				name: 'male',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: MALE_LIFE_EXPECTANCY_BY_PROVINCE
			} satisfies Series<ProvinceSexCell>
		]
	}
};

/**
 * Using data + x + y + color shorthand — alternative to passing a series array.
 * Equivalent to the Default story but with less boilerplate.
 */
export const UsingDataShorthand: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE_SEX,
		x: 'province',
		y: 'sex',
		color: 'value'
	}
};
