import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import { COUNTRIES } from '../../../plots/scatter/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `statistics: [{ type: 'regression' }]` fits svelteplot's own `RegressionX`/
// `RegressionY` mark against a plot's resolved series - with no `series`
// scope, every series pools into one combined source (here, the whole
// dataset, since `color` is unset). `styles` follows the same `StrokeStyle`
// shape as a hand-authored `line` marker; the confidence band always shares
// the same color as `stroke`, at a fixed low opacity.

const meta = {
	title: 'Layout/Statistics/Regression/Basics',
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

/** No `series` scope pools every country into one fitted curve, with its default confidence band. */
export const Default: Story = {
	args: {
		statistics: [{ type: 'regression' }]
	}
};

/** `styles` recolors the fitted line (and its confidence band, which always follows `stroke`). */
export const CustomStyle: Story = {
	args: {
		statistics: [{ type: 'regression', styles: { stroke: '#7c3aed', strokeWidth: 2.5 } }]
	}
};

/** `confidence: false` omits the band entirely, leaving just the fitted line. */
export const NoConfidenceBand: Story = {
	args: {
		statistics: [{ type: 'regression', confidence: false }]
	}
};
