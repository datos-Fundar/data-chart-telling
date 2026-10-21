import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LollipopPlot from '$lib/plots/ranking/lollipop/Plot.svelte';
import { PROVINCE_VALUES, type ProvinceRow } from '$examples/data';

const FEMALE = PROVINCE_VALUES.filter((row) => row.sex === 'female');

// ── Meta ──────────────────────────────────────────────────────────────────────
// Hovering a lollipop reads its row through the same `tooltip` prop every
// other plot kind takes.

const meta = {
	title: 'Plots/Ranking/LollipopPlot/Tooltip',
	component: LollipopPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { y: { domain: [70, 85] } },
		data: FEMALE,
		x: 'province',
		y: 'value'
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
		docs: { source: { name: 'LollipopPlot' } }
	}
} satisfies Meta<typeof LollipopPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default text: the hovered lollipop's value. */
export const DefaultTooltip: Story = {
	args: {
		tooltip: { sync: false }
	}
};

/** The `format` callback gets the hovered row and returns its label. */
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
