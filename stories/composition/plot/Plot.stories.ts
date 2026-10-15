import type { Meta, StoryObj } from '@storybook/svelte-vite';
import Interchange from './Interchange.svelte';
import Napoleon from './Napoleon.svelte';
import InterchangeSource from './Interchange.svelte?raw';
import NapoleonSource from './Napoleon.svelte?raw';
import { demoSource } from '../../common/docsSource';

/**
 * Every plot kind wraps itself in the same `Plot`: container, timeline,
 * facet and legend are optional props shared by all of them, and `Plot`
 * itself is exported for wrapping anything else.
 */
const meta = {
	title: 'Composition/Plot',
	component: Interchange,
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta<typeof Interchange>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Every plot kind draws its own chrome (title, subtitle, caption, legend,
 * timeline and facet), so swapping kinds swaps the whole plot, chrome
 * included - nothing is shared between them. What stays is the props: the same
 * ones are accepted by a line, bar and heatmap plot, and here they are
 * interchanged next to one external scrubber that drives each one's timeline.
 *
 * To lay several plots out in one figure with a shared chrome, use
 * `PlotComposer`.
 */
export const InterchangeablePlots: Story = {
	parameters: demoSource(InterchangeSource)
};

/**
 * `Plot`'s `cell` snippet doesn't require one of this package's own plot
 * kinds - anything that accepts `{ data, width, height }` fits. Here it's
 * svelteplot's raw `<Plot>`, assembled by hand (marks, a blur-masked `<defs>`
 * glow, custom projection fitting) instead of going through a plot kind, yet
 * it still gets a title/subtitle/caption, a discrete legend and a scrubbable
 * timeline from the same chrome every plot kind uses.
 */
export const SvelteplotCompatibility: Story = {
	render: () => ({ Component: Napoleon }),
	parameters: demoSource(NapoleonSource)
};
