import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import { COUNTRIES } from '../../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `regressionType` picks the fit model - same names as svelteplot's own
// `RegressionOptions.type`. GDP per capita vs. life expectancy is a classic
// diminishing-returns relationship: each extra dollar of income buys less
// extra life expectancy the richer a country already is - a curve a straight
// line can only approximate, while `'log'` tracks it closely.

const meta = {
	title: 'Layout/Statistics/Regression/Fit Types',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		r: 6
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `regressionType: 'linear'` (the default) - a straight line undershoots the low end and overshoots the middle. */
export const Linear: Story = {
	args: {
		statistics: [{ type: 'regression', regressionType: 'linear', confidence: false }]
	}
};

/** `regressionType: 'log'` - a logarithmic fit tracks the real diminishing-returns curve much more closely. */
export const Logarithmic: Story = {
	args: {
		statistics: [
			{
				type: 'regression',
				regressionType: 'log',
				confidence: false,
				styles: { stroke: '#059669' }
			}
		]
	}
};
