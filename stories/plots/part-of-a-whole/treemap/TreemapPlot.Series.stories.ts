import type { Meta, StoryObj } from '@storybook/svelte-vite';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';

import { ACTIVITY_BRANCHES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Part of a whole/TreemapPlot/Series',
	component: TreemapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 540
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		value: { control: false },
		grouping: { control: false }
	},
	parameters: {
		docs: { source: { name: 'TreemapPlot' } }
	}
} satisfies Meta<typeof TreemapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story draws the same branches of activity: a tile each, sized by its value and colored by its sector. */
const BASE = {
	data: ACTIVITY_BRANCHES,
	value: 'value',
	grouping: ['sector', 'branch']
} as const;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * One tile per row: its area is its `value`, its color its sector (the outermost `grouping` level), and
 * each tile is labelled with its name - its value at the last level - over its share of the whole. A tile too small for its name has the share
 * alone, and one too small for that has none.
 */
export const Default: Story = {
	args: { ...BASE }
};

/**
 * `grouping` as a list is the whole path of a tile, outermost level first: here sector, kind of activity and
 * branch. The last level names the tile, and the outermost still colors the tiles and fills the legend.
 */
export const GroupingAsAList: Story = {
	args: { ...BASE, grouping: ['sector', 'kind', 'branch'] }
};

/**
 * Rows with the same path are one tile, their values added up: grouping by sector alone makes a tile of each
 * sector - three big squares.
 */
export const OnlySectors: Story = {
	args: { ...BASE, grouping: 'sector' }
};

/** `value` and the levels of `grouping` can be functions of the row. Here a tile's area is its value in billions of Argentinean pesos. */
export const UsingFunctions: Story = {
	args: {
		data: ACTIVITY_BRANCHES,
		value: (row) => Number(row.value) / 1000,
		grouping: [(row) => String(row.sector).toUpperCase(), (row) => String(row.branch).toUpperCase()]
	}
};

/** `tile: 'squarify'` (the default) keeps tiles close to squares. */
export const SquarifiedTiling: Story = {
	args: { ...BASE, tile: 'squarify' }
};

/** `tile: 'slice'` stacks a rectangle's tiles in rows. */
export const SliceTiling: Story = {
	args: { ...BASE, tile: 'slice' }
};

/** `tile: 'dice'` sets them side by side. */
export const DiceTiling: Story = {
	args: { ...BASE, tile: 'dice' }
};

/** `tile: 'sliceDice'` alternates rows and columns by level. */
export const SliceDiceTiling: Story = {
	args: { ...BASE, grouping: ['sector', 'kind', 'branch'], tile: 'sliceDice' }
};

/** `tile: 'binary'` splits each rectangle in two halves of about the same value. */
export const BinaryTiling: Story = {
	args: { ...BASE, tile: 'binary' }
};
