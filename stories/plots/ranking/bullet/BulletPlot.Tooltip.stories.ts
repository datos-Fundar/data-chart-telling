import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import { PROVINCE_LIFE, type ProvinceLifeRow } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Hovering a category reads its row through the same
// `tooltip` prop every other plot kind takes.

const meta = {
	title: 'Plots/Ranking/BulletPlot/Tooltip',
	component: BulletPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: PROVINCE_LIFE,
		x: 'female',
		y: 'province',
		target: 80,
		ranges: [76, 80, 85],
		scales: { x: { domain: [70, 85] } }
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
		docs: { source: { name: 'BulletPlot' } }
	}
} satisfies Meta<typeof BulletPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default text: the hovered category's value. */
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
				const { province, female } = row as ProvinceLifeRow;
				return `${province}: ${female} years`;
			}
		}
	}
};
