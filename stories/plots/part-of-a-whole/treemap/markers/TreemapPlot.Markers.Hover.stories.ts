import type { Meta, StoryObj } from '@storybook/svelte-vite';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { ACTIVITY_BRANCHES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The hover a TreemapPlot has of its own: what `markers={[{ type: 'hover' }]}` draws. Every feature of the hover -
// its strategies, labels, scope, `active` and `others`, `back` and `front` - is in `Layout/Hover`.

const meta = {
	title: 'Plots/Part of a whole/TreemapPlot/Markers/Hover',
	component: TreemapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: ACTIVITY_BRANCHES,
		value: 'value',
		grouping: 'sector.branch'
	},
	argTypes: {
		width: { control: { type: 'range', min: 200, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 60, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'TreemapPlot' } }
	}
} satisfies Meta<typeof TreemapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: the hovered tile outlined, in the configuration's `hover.active`. A
 * tile writes its own label, so the hover draws no crosshair, dot or label - `active` and `others` restyle the
 * tiles (see `Layout/Hover/Active and others`).
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};
