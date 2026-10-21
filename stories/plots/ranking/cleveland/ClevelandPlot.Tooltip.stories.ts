import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ClevelandPlot from '$lib/plots/ranking/cleveland/Plot.svelte';
import { AGE_SHARES, type AgeShareRow } from '$examples/data';
import { SEQUENTIAL_COLORS } from './colors';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Hovering a category reads its rows - one per series - through the same
// `tooltip` prop every other plot kind takes.

const meta = {
	title: 'Plots/Ranking/ClevelandPlot/Tooltip',
	component: ClevelandPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { color: SEQUENTIAL_COLORS },
		data: AGE_SHARES,
		x: 'ageGroup',
		y: 'share',
		grouping: 'year'
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
		docs: { source: { name: 'ClevelandPlot' } }
	}
} satisfies Meta<typeof ClevelandPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default text: the hovered category's value for each series. */
export const DefaultTooltip: Story = {
	args: {
		tooltip: { sync: false }
	}
};

/** The `format` callback gets one hovered row and returns its label. */
export const CustomFormat: Story = {
	args: {
		tooltip: {
			sync: false,
			format: (row) => {
				const { ageGroup, share } = row as AgeShareRow;
				return `${ageGroup}: ${share}%`;
			}
		}
	}
};
