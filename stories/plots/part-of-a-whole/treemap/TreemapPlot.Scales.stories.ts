import type { Meta, StoryObj } from '@storybook/svelte-vite';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { ACTIVITY_BRANCHES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Part of a whole/TreemapPlot/Scales',
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
		scales: { control: false }
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

/** No scale overrides - the sectors take the configuration's palette in the order they appear. */
export const Default: Story = {
	args: { ...BASE }
};

/** A color for each group, by name: `scales.color.scheme` as an object. */
export const ColorPerGroup: Story = {
	args: {
		...BASE,
		scales: {
			color: {
				scheme: { Primary: '#7cb342', Secondary: '#5c6bc0', Tertiary: '#ef6c00' }
			}
		} satisfies AxisBasedScalesConfig
	}
};

/** The colors as a list, taken in the order of `scales.color.domain`. */
export const ColorPalette: Story = {
	args: {
		...BASE,
		scales: {
			color: {
				domain: ['Tertiary', 'Secondary', 'Primary'],
				scheme: ['#264653', '#2a9d8f', '#e9c46a']
			}
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * `scales.color.depth: 2` colors down to the second level: every sector keeps its color, and each kind of activity
 * under it takes a tone of that color, so the tiles of one kind read together inside their sector.
 */
export const ColorsByKind: Story = {
	args: {
		...BASE,
		grouping: 'sector.kind.branch',
		scales: { color: { depth: 2 } } satisfies AxisBasedScalesConfig
	}
};

/**
 * `scales.color.depth: 3` reaches the leaves: every branch takes its own tone of its sector's color, the tones of
 * one kind next to each other. The legend still lists the sectors, in their own colors.
 */
export const ColorsByBranch: Story = {
	args: {
		...BASE,
		grouping: 'sector.kind.branch',
		scales: { color: { depth: 3 } } satisfies AxisBasedScalesConfig
	}
};

/** The tones follow the sectors' own colors, whatever `scheme` gives them. */
export const TonesOfAScheme: Story = {
	args: {
		...BASE,
		grouping: 'sector.kind.branch',
		scales: {
			color: {
				depth: 3,
				scheme: { Primary: '#7cb342', Secondary: '#5c6bc0', Tertiary: '#ef6c00' }
			}
		} satisfies AxisBasedScalesConfig
	}
};
