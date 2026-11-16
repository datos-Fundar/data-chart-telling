import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { FEMALE_PROVINCE_VALUES, MALE_PROVINCE_VALUES } from '$datasets';

// `styles.area.fill` takes a gradient as well as a color: a stop with no color takes each series' own.

const meta = {
	title: 'Plots/Ranking/BarPlot/Styles/Gradients',
	component: BarPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		series: [
			{ name: 'female', x: 'province', y: 'value', data: FEMALE_PROVINCE_VALUES },
			{ name: 'male', x: 'province', y: 'value', data: MALE_PROVINCE_VALUES }
		]
	},
	argTypes: {
		styles: {
			description:
				'`styles.area`: a style, or a function of the series name returning one; its `fill` a color or a gradient.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Each bar fades from its tip toward its base, in its own series' color. */
export const FadingBars: Story = {
	args: {
		styles: { area: { fill: { gradient: [{ opacity: 1 }, { opacity: 0.25 }], axis: 'y' } } }
	}
};

/**
 * With `span: 'plot'`, one gradient runs across the whole plot: every bar shows its own stretch of it, so a
 * longer bar reaches further into the darker end.
 */
export const OneScaleForAll: Story = {
	args: {
		series: [{ name: 'female', x: 'province', y: 'value', data: FEMALE_PROVINCE_VALUES }],
		legend: false,
		styles: {
			area: { fill: { gradient: ['#1e3a8a', '#60a5fa', '#dbeafe'], axis: 'y', span: 'plot' } }
		}
	}
};
