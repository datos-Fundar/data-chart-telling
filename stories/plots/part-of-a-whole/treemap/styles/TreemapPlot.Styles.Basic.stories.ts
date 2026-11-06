import type { Meta, StoryObj } from '@storybook/svelte-vite';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { ACTIVITY_BRANCHES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Part of a whole/TreemapPlot/Styles/Basic',
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

/** A midnightblue outline around every tile: `styles.area`. */
export const TileBorders: Story = {
	args: {
		...BASE,
		styles: { area: { stroke: 'midnightblue', strokeWidth: 3 } } satisfies AxisBasedStylesConfig
	}
};

/** Translucent tiles. */
export const TranslucentTiles: Story = {
	args: { ...BASE, styles: { area: { fillOpacity: 0.6 } } satisfies AxisBasedStylesConfig }
};

/** Rounded tiles. */
export const RoundedTiles: Story = {
	args: { ...BASE, styles: { area: { borderRadius: 6 } } satisfies AxisBasedStylesConfig }
};

/** A dashed outline. */
export const DashedBorders: Story = {
	args: {
		...BASE,
		styles: {
			area: { stroke: 'white', strokeWidth: 2, strokeDasharray: 'dashed' }
		} satisfies AxisBasedStylesConfig
	}
};
