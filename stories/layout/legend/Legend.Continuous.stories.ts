import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
import type { LegendSection } from '$lib/types/layout/legend';

/** A single continuous section: a gradient bar with min/max labels and ticks. */
const meta = {
	title: 'Layout/Legend/Continuous',
	component: LegendLayout,
	tags: ['autodocs'],
	parameters: {
		docs: { source: { name: 'LegendLayout' } }
	}
} satisfies Meta<typeof LegendLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One continuous section: a gradient bar with min/max labels and ticks. */
export const SingleContinuous: Story = {
	args: {
		sections: [
			{
				type: 'continuous',
				title: 'Percentage',
				min: 0,
				max: 0.2,
				colorMin: '#e0e7ff',
				colorMax: '#4f46e5',
				ticks: [0.05, 0.1, 0.15],
				format: (v) => `${(v * 100).toFixed(0)}%`,
				width: 220
			}
		] satisfies LegendSection[]
	}
};
