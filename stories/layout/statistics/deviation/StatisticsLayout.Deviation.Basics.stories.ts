import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/ranking/dumbbell/Plot.svelte';
import { PROVINCE_VALUES } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `deviation` draws a rule at an estimator (the mean by default) and a band `k` standard
// deviations either side of it, along whichever axis the plot measures: the plot decides it,
// the statistic does not. Upright, that is a horizontal rule on `y`; sideways, a vertical one
// on `x`. By default one is drawn per series, in that series' color.

const meta = {
	title: 'Layout/Statistics/Deviation/Basics',
	component: DumbbellPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		data: { control: false },
		statistics: { control: false }
	},
	parameters: {
		docs: { source: { name: 'DumbbellPlot' } }
	}
} satisfies Meta<typeof DumbbellPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** One mean and a ±1 standard deviation band per sex, over the values on `y`. */
export const Vertical: Story = {
	args: {
		statistics: [{ type: 'deviation' }]
	}
};

/** The categories on `y` lay the plot sideways: the rule and the band turn vertical, still along the values. */
export const Horizontal: Story = {
	args: {
		x: 'value',
		y: 'province',
		statistics: [{ type: 'deviation' }]
	}
};
