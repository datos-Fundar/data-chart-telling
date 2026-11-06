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
