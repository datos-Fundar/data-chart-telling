import type { Meta, StoryObj } from '@storybook/svelte-vite';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';

import { ACTIVITY_BRANCHES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Part of a whole/TreemapPlot/Tooltip',
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
		tooltip: { control: false }
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

/** The same branches with their value as a percentage of the whole already. */
const TOTAL = ACTIVITY_BRANCHES.reduce((sum, row) => sum + row.value, 0);
const PERCENTAGES = ACTIVITY_BRANCHES.map((row) => ({ ...row, value: (row.value / TOTAL) * 100 }));

// ── Stories ───────────────────────────────────────────────────────────────────

/** A tooltip names the hovered tile and gives its share of the whole. Hover over any tile to activate. */
export const BasicTooltip: Story = {
	args: { ...BASE, tooltip: true }
};

/**
 * `format` receives the hovered row, `number` - which writes a value as the tooltip's `decimals`, `prefix`,
 * `suffix` and `signDisplay` ask - and the `tile`: its `name`, its `path` through the `grouping` levels, its
 * summed `value` and its `share` of the whole, from 0 to 100.
 */
export const CustomFormat: Story = {
	args: {
		...BASE,
		tooltip: {
			decimals: 0,
			suffix: ' %',
			format: (_row, number, tile) =>
				`${tile.path.join(' › ')}\n${tile.value.toLocaleString()} M - ${number(tile.share)} of the whole`
		}
	}
};

/**
 * The share of each tile is worked out by the library, from whatever unit `value` is in - here millions of pesos -
 * so there is nothing to compute in `format`.
 */
export const ShareIsComputed: Story = {
	args: {
		...BASE,
		tooltip: {
			format: (_row, _number, tile) => `${tile.name}: ${tile.share.toFixed(1)}% of the economy`
		}
	}
};

/**
 * A dataset whose `value` is a percentage already works the same: the shares are those of the whole they add
 * up to, so a whole of 100 gives back the values it was given.
 */
export const PrecomputedPercentages: Story = {
	args: {
		...BASE,
		data: PERCENTAGES,
		tooltip: { format: (_row, _number, tile) => `${tile.name}: ${tile.share.toFixed(1)}%` }
	}
};

/** Every row is its own tooltip, so a nested treemap reads the same, with the path of the tile. */
export const NestedTooltip: Story = {
	args: {
		...BASE,
		grouping: ['sector', 'kind', 'branch'],
		tooltip: {
			format: (_row, _number, tile) => `${tile.path.slice(0, -1).join(' › ')}\n${tile.name}`
		}
	}
};
