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
	grouping: 'sector.branch'
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
 * `grouping` with its levels joined by dots is the whole path of a tile, outermost level first: here sector, kind
 * of activity and branch. The last level names the tile, and the outermost still colors the tiles and fills the
 * legend.
 */
export const NestedLevels: Story = {
	args: { ...BASE, grouping: 'sector.kind.branch' }
};

/**
 * Rows with the same path are one tile, their values added up: grouping by sector alone makes a tile of each
 * sector - three big squares.
 */
export const OnlySectors: Story = {
	args: { ...BASE, grouping: 'sector' }
};

/**
 * `value` and `grouping` can be functions of the row - a function is a single level, which the rows need not
 * have as a field. Here a tile's area is its value in billions of Argentinean pesos, and the branches add up to
 * two tiles: the goods the primary and secondary sectors make, and the services of the tertiary one.
 */
export const UsingFunctions: Story = {
	args: {
		data: ACTIVITY_BRANCHES,
		value: (row) => Number(row.value) / 1000,
		grouping: (row) => (row.sector === 'Tertiary' ? 'Services' : 'Goods')
	}
};
