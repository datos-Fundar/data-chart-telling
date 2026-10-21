import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ForestPlot from '$lib/plots/ranking/forest/Plot.svelte';
import { INFLATION_RANGES, type InflationRange } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Hovering a category reads its rows - one per series - through the same
// `tooltip` prop every other plot kind takes.

const meta = {
	title: 'Plots/Ranking/ForestPlot/Tooltip',
	component: ForestPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 480,
		data: INFLATION_RANGES,
		x: 'mean',
		y: 'period',
		lower: 'min',
		upper: 'max',
		color: 'region'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		tooltip: {
			description: 'Tooltip runtime configuration.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'ForestPlot' } }
	}
} satisfies Meta<typeof ForestPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default text: the hovered row's mean. */
export const DefaultTooltip: Story = {
	args: {
		tooltip: { sync: false }
	}
};

/** The `format` callback gets the hovered row, interval included, and returns its label. */
export const CustomFormat: Story = {
	args: {
		tooltip: {
			sync: false,
			format: (row) => {
				const { period, mean, min, max } = row as InflationRange;
				return `${period}: ${mean}% (${min} to ${max})`;
			}
		}
	}
};
