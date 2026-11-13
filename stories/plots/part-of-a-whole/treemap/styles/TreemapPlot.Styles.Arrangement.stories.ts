import type { Meta, StoryObj } from '@storybook/svelte-vite';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import type { ArrangementAwarePlotStylesConfig } from '$lib/types/layout/styles';
import type { TreemapArrangementOptions } from '$lib/types/arrangements/treemap';

type Styles = ArrangementAwarePlotStylesConfig<TreemapArrangementOptions>;
import { ACTIVITY_BRANCHES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// How a rectangle is split among its tiles: `styles.arrangement.tile`.

const meta = {
	title: 'Plots/Part of a whole/TreemapPlot/Styles/Arrangement',
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
		styles: { control: false }
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

/** `tile: 'squarify'` (the default) keeps tiles close to squares. */
export const Squarify: Story = {
	args: {
		...BASE,
		styles: { arrangement: { tile: 'squarify' } } satisfies Styles
	}
};

/** `tile: 'slice'` stacks a rectangle's tiles in rows. */
export const Slice: Story = {
	args: { ...BASE, styles: { arrangement: { tile: 'slice' } } satisfies Styles }
};

/** `tile: 'dice'` sets them side by side. */
export const Dice: Story = {
	args: { ...BASE, styles: { arrangement: { tile: 'dice' } } satisfies Styles }
};

/** `tile: 'sliceDice'` alternates rows and columns by level. */
export const SliceDice: Story = {
	args: {
		...BASE,
		grouping: 'sector.kind.branch',
		styles: { arrangement: { tile: 'sliceDice' } } satisfies Styles
	}
};

/** `tile: 'binary'` splits each rectangle in two halves of about the same value. */
export const Binary: Story = {
	args: { ...BASE, styles: { arrangement: { tile: 'binary' } } satisfies Styles }
};
