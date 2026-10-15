import type { Meta, StoryObj } from '@storybook/svelte-vite';
import UsePlotDemo from './state/UsePlotDemo.svelte';
import UsePlotDemoSource from './state/UsePlotDemo.svelte?raw';
import HoverReadoutSource from './state/HoverReadout.svelte?raw';
import UseFigureDemo from './state/UseFigureDemo.svelte';
import UseFigureDemoSource from './state/UseFigureDemo.svelte?raw';
import FigureReadoutSource from './state/FigureReadout.svelte?raw';
import { demoSource } from '../common/docsSource';

/**
 * A plot's state - its hover, legend, margins, scales, rows and size - is
 * readable from anything drawn with it:
 *
 * - `usePlot()` from a component inside the plot, such as a `component`
 *   marker. It returns the plot's state, with svelteplot's own apart as
 *   `svelteplot`.
 * - `useFigure()` from anywhere inside the figure - its `header` and `footer`
 *   included. It returns the figure's `hover` and `legend`.
 *
 * Both are read-only, but for the legend: its series can be turned on and
 * off. Call them while the component initializes; outside a plot or a figure
 * they throw.
 */
const meta = {
	title: 'Configuration/State',
	component: UsePlotDemo,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded'
	}
} satisfies Meta<typeof UsePlotDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A `component` marker that reads the plot with `usePlot()` and writes the
 * hovered point, plus the plot's rows and size, over its own SVG.
 */
export const UsePlot: Story = {
	parameters: demoSource(
		`${UsePlotDemoSource}\n\n<!-- HoverReadout.svelte -->\n${HoverReadoutSource}`
	)
};

/**
 * A footer that reads the figure with `useFigure()`: the hovered x, and a
 * button per series that turns it off through the legend.
 */
export const UseFigure: Story = {
	render: () => ({ Component: UseFigureDemo }),
	parameters: demoSource(
		`${UseFigureDemoSource}\n\n<!-- FigureReadout.svelte -->\n${FigureReadoutSource}`
	)
};
