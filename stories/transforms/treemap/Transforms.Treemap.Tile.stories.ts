import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { treemapArgs, treemapArgTypes, tiles } from './treemapStory';

const meta = {
	title: 'Transforms/Treemap/Tile',
	component: LinePlot,
	tags: ['autodocs'],
	args: treemapArgs,
	argTypes: treemapArgTypes,
	parameters: { docs: { source: { name: 'LinePlot' } } }
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const levels = ['sector', 'kind'];

/** `tile: 'squarify'`, the default: tiles as close to squares as they can be. */
export const Squarify: Story = {
	args: { markers: tiles({ levels, tile: 'squarify' }) }
};

/** `tile: 'binary'` splits each group in two halves of about the same value, again and again. */
export const Binary: Story = {
	args: { markers: tiles({ levels, tile: 'binary' }) }
};

/** `tile: 'slice'` stacks the tiles of each group from top to bottom. */
export const Slice: Story = {
	args: { markers: tiles({ levels, tile: 'slice' }) }
};

/** `tile: 'dice'` lines the tiles of each group up from left to right. */
export const Dice: Story = {
	args: { markers: tiles({ levels, tile: 'dice' }) }
};

/** `tile: 'sliceDice'` alternates between the two, a level at a time. */
export const SliceDice: Story = {
	args: { markers: tiles({ levels, tile: 'sliceDice' }) }
};
