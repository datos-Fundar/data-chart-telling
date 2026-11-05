import type { Meta, StoryObj } from '@storybook/svelte-vite';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { ACTIVITY_BRANCHES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Part of a whole/TreemapPlot/Styles/Values',
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
	grouping: ['sector', 'branch']
} as const;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No style overrides - each tile is labelled with its name over its share of the whole, fitted to
 * the tile: at a smaller size first, then cut short, then the share alone, then nothing.
 */
export const Default: Story = {
	args: { ...BASE }
};

/** Hide the labels - `styles.values.show: false` leaves the tiles bare. */
export const NoValueLabels: Story = {
	args: {
		...BASE,
		styles: { values: { show: false } } satisfies AxisBasedStylesConfig,
		tooltip: true
	}
};

/**
 * The share reads as `styles.values` asks: `decimals`, `prefix`, `suffix` and `signDisplay`. The suffix is a
 * percent sign unless it is set.
 */
export const ShareFormat: Story = {
	args: {
		...BASE,
		styles: { values: { show: true, decimals: 0, suffix: ' %' } } satisfies AxisBasedStylesConfig
	}
};

/** One decimal. */
export const OneDecimal: Story = {
	args: {
		...BASE,
		styles: { values: { show: true, decimals: 1 } } satisfies AxisBasedStylesConfig
	}
};

/** `format(share, group, row, number)` writes a tile's whole label. */
export const CustomFormat: Story = {
	args: {
		...BASE,
		styles: {
			values: {
				show: true,
				format: (share: number, group: string, _row, number) =>
					`${group.slice(0, 3)} ${number!(share)}`
			}
		} satisfies AxisBasedStylesConfig
	}
};

/** `fontStyle.fontSize` is the biggest a label takes: it shrinks to fit a smaller tile. */
export const LargerFont: Story = {
	args: {
		...BASE,
		styles: {
			values: { show: true, fontStyle: { fontSize: 16, fontWeight: 700 } }
		} satisfies AxisBasedStylesConfig
	}
};

/** A label's color, from `fontStyle.fill`. */
export const DarkLabels: Story = {
	args: {
		...BASE,
		styles: { values: { show: true, fontStyle: { fill: '#111' } } } satisfies AxisBasedStylesConfig,
		scales: { color: { scheme: ['#ffe082', '#80cbc4', '#ef9a9a'] } }
	}
};
