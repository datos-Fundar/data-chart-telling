import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/ranking/dumbbell/Plot.svelte';
import { PROVINCE_VALUES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Which rows a plot-level `deviation` summarizes: each series on its own (the default), only
// the named ones, or every series pooled into one.

const meta = {
	title: 'Layout/Statistics/Deviation/Scoping',
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

/** The default: one rule and band per series, each in its own color. */
export const PerSeries: Story = {
	args: {
		statistics: [{ type: 'deviation' }]
	}
};

/** `series: ['female']` summarizes only that series. */
export const OneSeries: Story = {
	args: {
		statistics: [{ type: 'deviation', series: ['female'] }]
	}
};

/** Both series named, each in an entry of its own, so each carries its own options: the median for one, two deviations for the other. */
export const BothSeries: Story = {
	args: {
		statistics: [
			{ type: 'deviation', series: ['female'], estimator: 'median' },
			{ type: 'deviation', series: ['male'], k: 2 }
		]
	}
};

/** `pooled: true` summarizes every row of every series at once: one rule and one band, here in gray. */
export const WholeDataset: Story = {
	args: {
		statistics: [
			{
				type: 'deviation',
				pooled: true,
				rule: { stroke: '#374151' },
				band: { fill: '#374151' }
			}
		]
	}
};

/** The same, sideways. */
export const WholeDatasetHorizontal: Story = {
	args: {
		x: 'value',
		y: 'province',
		statistics: [
			{
				type: 'deviation',
				pooled: true,
				rule: { stroke: '#374151' },
				band: { fill: '#374151' }
			}
		]
	}
};
