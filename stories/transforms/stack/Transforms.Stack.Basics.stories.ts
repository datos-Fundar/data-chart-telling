import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/area/Plot.svelte';
import { ENERGY_MIX } from '../../data/energy-mix';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `stackY` stacks a plot's series on the y axis: each group starts where the one
// before it ends, so the top edge is the running total. `stackX` does the same on
// the x axis. Both leave the rows' own values alone and add the `y1`/`y2` (or
// `x1`/`x2`) channels that the areas are drawn from.

const meta = {
	title: 'Transforms/Stack/Basics',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: ENERGY_MIX,
		x: 'year',
		y: 'share',
		color: 'source',
		segments: { default: [{ styles: { fillOpacity: 0.85 } }] }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		color: { control: false },
		transforms: { control: false }
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Without a stack, every area starts from zero, so they overlap and each one reads on its own against the axis. */
export const Unstacked: Story = {
	args: {
		segments: { default: [{ styles: { fillOpacity: 0.5 } }] }
	}
};

/** `stackY` puts each area on top of the one before: the top edge is the total, here 100% in every year. */
export const StackY: Story = {
	args: {
		transforms: [{ type: 'stackY' }]
	}
};
