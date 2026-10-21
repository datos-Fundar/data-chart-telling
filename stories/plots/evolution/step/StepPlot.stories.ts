import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { LIFE_EXPECTANCY } from '../line/data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Evolution/StepPlot',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: LIFE_EXPECTANCY,
		x: 'year',
		y: 'value',
		color: 'sex'
	},
	parameters: {
		docs: {
			source: { name: 'LinePlot' },
			description: {
				component:
					"There is no `StepPlot` component: a step plot is a `LinePlot` with `styles.curve` set to a step curve (`'step-after'`, `'step-before'` or `'step'`), for the whole plot or for one segment through `segments`. These stories show the common cases; every other option of a line plot (series, scales, styles, segments, markers, tooltip) works the same, so see the `LinePlot` stories for more, and `LinePlot/Curves` for every curve."
			}
		}
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** A `LinePlot` with `styles={{ curve: 'step-after' }}`: each value holds until the next point. */
export const Default: Story = {
	args: { styles: { curve: 'step-after' } }
};

/** The same plot with `'step-before'`: each value is reached at the previous point. */
export const StepBefore: Story = {
	args: { styles: { curve: 'step-before' } }
};

/** Steps with end-of-line labels, a tooltip and a hover marker, as on any line plot. */
export const WithLabelsAndTooltip: Story = {
	args: {
		styles: { curve: 'step-after', values: { show: true } },
		tooltip: {},
		markers: [{ type: 'hover' }]
	}
};
