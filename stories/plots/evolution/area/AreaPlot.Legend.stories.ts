import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import { AGE_SHARES_BY_YEAR, HEIGHT_DENSITY } from '$datasets';
import type { LegendSection } from '$lib/types/layout/legend';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Each grouped area shows in the legend under its group's name and color.
// Clicking a legend entry toggles that area on and off: by default it dims,
// or with `interactive.disabled: { mode: 'omit' }` it is removed entirely.

const meta = {
	title: 'Plots/Evolution/AreaPlot/Legend',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		legend: { control: false }
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * One interactive item per sex; `mode` sets what a toggled-off area does.
 * Items follow the data's own series order (male first), since a legend item
 * takes its color from its position in this list.
 */
function sexLegend(mode: 'dim' | 'hide' | 'omit'): LegendSection[] {
	return [
		{
			type: 'discrete',
			title: 'Sex',
			interactive: { enabled: true, ...(mode !== 'dim' ? { disabled: { mode } } : {}) },
			items: [
				{ name: 'male', label: 'Male', symbol: 'square' },
				{ name: 'female', label: 'Female', symbol: 'square' }
			]
		}
	];
}

/** One interactive item per age group, in the data's own series order. */
function ageLegend(mode: 'dim' | 'hide' | 'omit'): LegendSection[] {
	return [
		{
			type: 'discrete',
			title: 'Age group',
			interactive: { enabled: true, ...(mode !== 'dim' ? { disabled: { mode } } : {}) },
			items: ['0-14', '15-29', '30-44', '45-64', '65+'].map((name) => ({
				name,
				symbol: 'square' as const
			}))
		}
	];
}

/**
 * Clicking a legend entry dims that area instead of hiding it: its fill fades
 * to the legend's disabled opacity while the other area keeps its color. Here
 * the two sexes overlap, so the dimmed one stays readable behind the other.
 */
export const LegendDisabledDimsArea: Story = {
	args: {
		data: HEIGHT_DENSITY,
		x: 'height',
		y: 'density',
		color: 'sex',
		legend: sexLegend('dim')
	}
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off area from the plot and rescales the y-axis. */
export const LegendOmitRescalesDomain: Story = {
	args: {
		data: HEIGHT_DENSITY,
		x: 'height',
		y: 'density',
		color: 'sex',
		legend: sexLegend('omit')
	}
};

/**
 * Stacked, a dimmed age group keeps its place in the stack: its band fades in
 * position while the others stay where they are, so the total still reads 100%.
 */
export const LegendDisabledDimsStacked: Story = {
	args: {
		data: AGE_SHARES_BY_YEAR,
		x: 'year',
		y: 'share',
		color: 'ageGroup',
		transforms: [{ type: 'stackY' }],
		scales: { y: { domain: [0, 100] } },
		legend: ageLegend('dim')
	}
};

/**
 * Stacked, `interactive.disabled: { mode: 'hide' }` makes a toggled-off age group
 * fully transparent: the gap it leaves stays in the stack and the y-axis keeps
 * its range. Compare with `LegendOmitRescalesStack`.
 */
export const LegendHideKeepsStack: Story = {
	args: {
		data: AGE_SHARES_BY_YEAR,
		x: 'year',
		y: 'share',
		color: 'ageGroup',
		transforms: [{ type: 'stackY' }],
		legend: ageLegend('hide')
	}
};

/**
 * Stacked, `interactive.disabled: { mode: 'omit' }` removes a toggled-off age group
 * and the stack closes the gap, with the y-axis rescaled to what remains.
 */
export const LegendOmitRescalesStack: Story = {
	args: {
		data: AGE_SHARES_BY_YEAR,
		x: 'year',
		y: 'share',
		color: 'ageGroup',
		transforms: [{ type: 'stackY' }],
		legend: ageLegend('omit')
	}
};
