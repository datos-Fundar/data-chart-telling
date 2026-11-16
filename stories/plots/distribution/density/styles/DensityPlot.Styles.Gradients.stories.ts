import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import { HEIGHTS } from '$datasets';

// `styles.area.fill` takes a gradient as well as a color: a stop with no color takes each group's own.

const meta = {
	title: 'Plots/Distribution/DensityPlot/Styles/Gradients',
	component: DensityPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: HEIGHTS,
		x: 'height',
		grouping: 'group'
	},
	argTypes: {
		styles: {
			description:
				'`styles.area`: a style, or a function of the series name returning one; its `fill` a color or a gradient.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'DensityPlot' } }
	}
} satisfies Meta<typeof DensityPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Each curve fades out from its peak down, in its own group's color. */
export const FadingCurves: Story = {
	args: {
		styles: { area: { fill: { gradient: [{ opacity: 0.55 }, { opacity: 0 }], axis: 'y' } } }
	}
};

/** With `span: 'plot'`, the fade is measured on the whole plot: the taller curve keeps more of its color. */
export const FadingOnOneScale: Story = {
	args: {
		styles: {
			area: { fill: { gradient: [{ opacity: 0.6 }, { opacity: 0 }], axis: 'y', span: 'plot' } }
		}
	}
};
