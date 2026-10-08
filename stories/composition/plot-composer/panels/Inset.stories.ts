import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ComposerInset from './ComposerInset.svelte';
import ComposerInsetZoom from './ComposerInsetZoom.svelte';
import ComposerInsetLegend from './ComposerInsetLegend.svelte';
import ComposerInsetSource from './ComposerInset.svelte?raw';
import ComposerInsetZoomSource from './ComposerInsetZoom.svelte?raw';
import ComposerInsetLegendSource from './ComposerInsetLegend.svelte?raw';
import { demoSource } from '../../../common/docsSource';

/**
 * A `PlotPanel` with `inset` floats over another instead of taking a cell of
 * the grid - patchwork's `inset_element`. The box is given as fractions of the
 * composition, from its left and bottom edges.
 */
const meta = {
	title: 'Composition/PlotComposer/Panels/Inset',
	component: ComposerInset,
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta<typeof ComposerInset>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A small chart in a free corner of a larger one, adding a view the main plot has no room for. */
export const SmallChartInACorner: Story = {
	parameters: demoSource(ComposerInsetSource)
};

/** The inset repeats the data over a narrower range, zooming into the part the main plot compresses. */
export const Zoom: StoryObj = {
	render: () => ({ Component: ComposerInsetZoom }),
	parameters: demoSource(ComposerInsetZoomSource)
};

/** The panel's content isn't limited to plots: here it holds a `LegendLayout` placed inside the plot area. */
export const LegendInsidePlot: StoryObj = {
	render: () => ({ Component: ComposerInsetLegend }),
	parameters: demoSource(ComposerInsetLegendSource)
};
