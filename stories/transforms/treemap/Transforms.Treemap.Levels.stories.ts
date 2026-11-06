import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { treemapArgs, treemapArgTypes, tiles } from './treemapStory';

const meta = {
	title: 'Transforms/Treemap/Levels',
	component: LinePlot,
	tags: ['autodocs'],
	args: treemapArgs,
	argTypes: treemapArgTypes,
	parameters: { docs: { source: { name: 'LinePlot' } } }
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One level: a tile per sector, the branches in it added together. */
export const OneLevel: Story = {
	args: { markers: tiles({ levels: ['sector'] }) }
};

/** Two levels: the tiles of each sector's kinds of activity, grouped inside it. */
export const TwoLevels: Story = {
	args: { markers: tiles({ levels: ['sector', 'kind'] }) }
};

/** Three levels: a tile per branch, grouped by its kind and its sector. Rows with the same path are one tile and add up. */
export const ThreeLevels: Story = {
	args: { markers: tiles({ levels: ['sector', 'kind', 'branch'] }) }
};
