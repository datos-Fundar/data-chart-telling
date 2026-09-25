import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
import type { LegendSection } from '$lib/types/layout/legend';

/** Multiple sections rendered side by side — discrete, continuous, or a mix. */
const meta = {
	title: 'Layout/Legend/Composition',
	component: LegendLayout,
	tags: ['autodocs'],
	parameters: {
		docs: { source: { name: 'LegendLayout' } }
	}
} satisfies Meta<typeof LegendLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Two discrete sections side by side — e.g. one per encoding dimension. Defaults to `layout: { type: 'vertical' }` per section. */
export const MultipleDiscrete: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Region',
				items: [
					{ name: 'North', color: '#4f46e5', symbol: 'square' },
					{ name: 'South', color: '#e6580d', symbol: 'square' }
				]
			},
			{
				type: 'discrete',
				title: 'Scenario',
				items: [
					{ name: 'Baseline', color: '#16a34a', symbol: 'line' },
					{ name: 'Projected', color: '#dc2626', symbol: 'line' }
				]
			}
		] satisfies LegendSection[]
	}
};

/** Same two sections as `MultipleDiscrete`, both with `layout: { type: 'horizontal' }` set explicitly. */
export const MultipleDiscreteHorizontal: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Region',
				layout: { type: 'horizontal' },
				items: [
					{ name: 'North', color: '#4f46e5', symbol: 'square' },
					{ name: 'South', color: '#e6580d', symbol: 'square' }
				]
			},
			{
				type: 'discrete',
				title: 'Scenario',
				layout: { type: 'horizontal' },
				items: [
					{ name: 'Baseline', color: '#16a34a', symbol: 'line' },
					{ name: 'Projected', color: '#dc2626', symbol: 'line' }
				]
			}
		] satisfies LegendSection[]
	}
};

/** A discrete and a continuous section mixed in the same legend. */
export const DiscreteAndContinuous: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Indicator',
				items: [
					{ name: 'GDP', color: '#4f46e5', symbol: 'line' },
					{ name: 'Employment', color: '#e6580d', symbol: 'line' }
				]
			},
			{
				type: 'continuous',
				title: 'Percentage',
				min: 0,
				max: 0.2,
				ticks: [0.1],
				format: (v) => `${(v * 100).toFixed(0)}%`,
				width: 180
			}
		] satisfies LegendSection[]
	}
};
