import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/ranking/dumbbell/Plot.svelte';
import { PROVINCE_VALUES, type ProvinceRow } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Hovering a category reads its rows - one per series - through the same
// `tooltip` prop every other plot kind takes.

const meta = {
	title: 'Plots/Ranking/DumbbellPlot/Tooltip',
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
		tooltip: {
			description: 'Tooltip runtime configuration.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'DumbbellPlot' } }
	}
} satisfies Meta<typeof DumbbellPlot>;

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
				const { province, value } = row as ProvinceRow;
				return `${province}: ${value} years`;
			}
		}
	}
};
