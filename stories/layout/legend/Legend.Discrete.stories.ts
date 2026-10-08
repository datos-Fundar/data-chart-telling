import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
import type { LegendSection } from '$lib/types/layout/legend';

/** A single discrete section: swatch/badge + label per category, shaped by its `layout`/`columns` knobs. */
const meta = {
	title: 'Layout/Legend/Discrete',
	component: LegendLayout,
	tags: ['autodocs'],
	parameters: {
		docs: { source: { name: 'LegendLayout' } }
	}
} satisfies Meta<typeof LegendLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One discrete section: a swatch + label per category. Defaults to `layout: { type: 'horizontal' }`, the only-section default. */
export const SingleDiscrete: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Indicator',
				items: [
					{ name: 'GDP', label: 'GDP', color: '#4f46e5', symbol: 'line' },
					{ name: 'Employment', label: 'Employment', color: '#e6580d', symbol: 'line' }
				]
			}
		] satisfies LegendSection[]
	}
};

/** Same lone section as `SingleDiscrete`, with `layout: { type: 'vertical' }` set explicitly. */
export const SingleDiscreteVertical: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Indicator',
				layout: { type: 'vertical' },
				items: [
					{ name: 'GDP', label: 'GDP', color: '#4f46e5', symbol: 'line' },
					{ name: 'Employment', label: 'Employment', color: '#e6580d', symbol: 'line' }
				]
			}
		] satisfies LegendSection[]
	}
};

/** Same lone section as `SingleDiscrete`, with `layout: { type: 'flex' }` - flows left to right and wraps onto as many rows as it takes, with no pagination. */
export const SingleDiscreteFlex: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Indicator',
				layout: { type: 'flex' },
				items: [
					{ name: 'GDP', label: 'GDP', color: '#4f46e5', symbol: 'line' },
					{ name: 'Employment', label: 'Employment', color: '#e6580d', symbol: 'line' },
					{ name: 'Inflation', label: 'Inflation', color: '#16a34a', symbol: 'line' },
					{ name: 'Exports', label: 'Exports', color: '#0ea5e9', symbol: 'line' },
					{ name: 'Reserves', label: 'Reserves', color: '#f59e0b', symbol: 'line' }
				]
			}
		] satisfies LegendSection[]
	}
};

/** Four discrete items in two columns, via `columns: 2` (vertical grid only). */
export const ManyItemsInColumns: Story = {
	args: {
		sections: [
			{
				type: 'discrete',
				title: 'Rooms',
				layout: { type: 'vertical' },
				columns: 2,
				items: [
					{ name: '1', color: '#e0e7ff', symbol: 'square' },
					{ name: '2', color: '#a5b4fc', symbol: 'square' },
					{ name: '3', color: '#6366f1', symbol: 'square' },
					{ name: '4', color: '#4f46e5', symbol: 'square' }
				]
			}
		] satisfies LegendSection[]
	}
};
