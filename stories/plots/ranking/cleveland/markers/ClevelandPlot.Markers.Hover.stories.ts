import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ClevelandPlot from '$lib/plots/ranking/cleveland/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { AGE_SHARES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The hover a ClevelandPlot has of its own: what `markers={[{ type: 'hover' }]}` draws. Every feature of the hover -
// its strategies, labels, scope, `active` and `others`, `back` and `front` - is in `Layout/Hover`.

const meta = {
	title: 'Plots/Ranking/ClevelandPlot/Markers/Hover',
	component: ClevelandPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: AGE_SHARES,
		x: 'ageGroup',
		y: 'share',
		grouping: 'year'
	},
	argTypes: {
		width: { control: { type: 'range', min: 200, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 60, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ClevelandPlot' } }
	}
} satisfies Meta<typeof ClevelandPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: a rule along the value axis at the dot under the pointer, and a dot
 * and the value on each dot of the hovered age group.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};
