import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { MarkerTransform } from '$lib/types/transforms';
import { HEIGHTS, type HeightRow } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Of two overlapping dots, the one drawn later covers the other, and a
// ScatterPlot draws its rows in order. So the plot's own `transforms` decide
// what shows on top: the rows' own order, `reverse`d, `shuffle`d, or `sort`ed.
// Here two groups overlap in the middle, with large dots to make it visible.

const meta = {
	title: 'Transforms/Sort/Draw order',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: HEIGHTS,
		x: 'height',
		y: 'weight',
		color: 'group',
		scales: { x: { label: 'Height (cm)' }, y: { label: 'Weight (kg)' } },
		segments: { default: [{ styles: { dotRadius: 9, dotStroke: 'white', dotStrokeWidth: 1 } }] }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		transforms: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Weight per centimeter of height: the bubbles' size, which is not a position on either axis. Passed by name, so the size legend is titled with it. */
const weightPerCentimeter = (row: HeightRow) => row.weight / row.height;

/**
 * People as bubbles sized by their weight per centimeter of height, jittered
 * into tight columns - size has nothing to do with position, so big and small
 * bubbles overlap, and the draw order decides which stay visible. `transforms`
 * run after the jitter.
 */
const bubbles = (transforms: MarkerTransform[]): Story['args'] => ({
	data: HEIGHTS,
	x: 'height',
	y: 'weight',
	color: 'group',
	r: weightPerCentimeter as (row: Record<string, unknown>) => number,
	scales: {
		x: { label: 'Height (cm)' },
		y: { label: 'Weight (kg)' }
	},
	segments: { default: [{ styles: { dotStroke: 'white', dotStrokeWidth: 1 } }] },
	transforms: [{ type: 'jitterX', width: 0.3 }, ...transforms]
});

// ── Stories ───────────────────────────────────────────────────────────────────

/** No transform: every female row, then every male row - so males cover females wherever they overlap. */
export const DataOrder: Story = {};

/** `reverse`: the male rows come first now, so females cover males in the overlap. */
export const Reverse: Story = {
	args: { transforms: [{ type: 'reverse' }] }
};

/** `shuffle` mixes the rows, so neither group hides the other: the overlap reads as a mix of both. */
export const Shuffle: Story = {
	args: { transforms: [{ type: 'shuffle' }] }
};

/** `shuffle` with another `seed`: a different mix, the same on every render. */
export const ShuffleSeed: Story = {
	args: { transforms: [{ type: 'shuffle', seed: 3 }] }
};

/** `sort` by weight per centimeter: the biggest bubbles come last, on top, and cover the small ones in each column. */
export const BiggestOnTop: Story = {
	args: bubbles([
		{
			type: 'sort',
			sort: (a: HeightRow, b: HeightRow) => weightPerCentimeter(a) - weightPerCentimeter(b)
		}
	])
};

/** A comparator, biggest first: the big bubbles are drawn first, and every small one stays visible on top of them. */
export const SmallestOnTop: Story = {
	args: bubbles([
		{
			type: 'sort',
			sort: (a: HeightRow, b: HeightRow) => weightPerCentimeter(b) - weightPerCentimeter(a)
		}
	])
};
