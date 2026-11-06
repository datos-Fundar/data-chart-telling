import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import { AGE_SHARES_BY_YEAR, HEIGHT_DENSITY } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Each grouped area shows in the automatic legend under its group's name and color.
// With `legend.series.interactive`, clicking an entry toggles that area on and off: by default it dims,
// or with `interactive.disabled: { mode: 'omit' }` it is removed entirely, and with
// `{ mode: 'rescale' }` removed while the rest of a stack makes its whole again.

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
		legend: { series: { title: 'Sex', interactive: { enabled: true } } }
	}
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off area from the plot and rescales the y-axis. */
export const LegendOmitRescalesDomain: Story = {
	args: {
		data: HEIGHT_DENSITY,
		x: 'height',
		y: 'density',
		color: 'sex',
		legend: { series: { title: 'Sex', interactive: { enabled: true, disabled: { mode: 'omit' } } } }
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
		legend: { series: { title: 'Age group', interactive: { enabled: true } } }
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
		legend: {
			series: { title: 'Age group', interactive: { enabled: true, disabled: { mode: 'hide' } } }
		}
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
		legend: {
			series: { title: 'Age group', interactive: { enabled: true, disabled: { mode: 'omit' } } }
		}
	}
};

/**
 * Stacked, `interactive.disabled: { mode: 'rescale' }` removes a toggled-off age group and scales the others up to
 * the whole each year had: the stack still reaches 100%, each band now a share of the groups left. Compare with
 * `LegendOmitRescalesStack`, where the top drops to what the remaining groups add up to.
 */
export const LegendRescaleKeepsWhole: Story = {
	args: {
		data: AGE_SHARES_BY_YEAR,
		x: 'year',
		y: 'share',
		color: 'ageGroup',
		transforms: [{ type: 'stackY' }],
		legend: {
			series: { title: 'Age group', interactive: { enabled: true, disabled: { mode: 'rescale' } } }
		}
	}
};
