import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { treemapArgs, treemapArgTypes, tiles } from './treemapStory';

const meta = {
	title: 'Transforms/Treemap/Basics',
	component: LinePlot,
	tags: ['autodocs'],
	args: treemapArgs,
	argTypes: treemapArgTypes,
	parameters: { docs: { source: { name: 'LinePlot' } } }
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `levels: ['branch']`: a tile per branch of activity, as large as its value, colored by sector. */
export const Basic: Story = {
	args: { markers: tiles({ levels: ['branch'] }) }
};

/**
 * `aspect` is the width over the height of the box the tiles fill, so squarified tiles come out square in a
 * plot that is not.
 */
export const Aspect: Story = {
	args: { markers: tiles({ levels: ['branch'], aspect: 940 / 460 }) }
};
