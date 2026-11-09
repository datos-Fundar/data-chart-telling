import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { PROVINCE_LIFE } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The hover a BulletPlot has of its own: what `markers={[{ type: 'hover' }]}` draws. Every feature of the hover -
// its strategies, labels, scope, `active` and `others`, `back` and `front` - is in `Layout/Hover`.

const meta = {
	title: 'Plots/Ranking/BulletPlot/Markers/Hover',
	component: BulletPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: PROVINCE_LIFE,
		x: 'female',
		y: 'province',
		target: 80,
		ranges: [76, 80, 85],
		scales: { x: { domain: [70, 85] } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 200, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 60, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'BulletPlot' } }
	}
} satisfies Meta<typeof BulletPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * The plot's own hover, with a tooltip: a bar plot's band behind the hovered province's bar, its ranges and
 * its target.
 */
export const Basic: Story = {
	args: {
		tooltip: true,
		markers: [{ type: 'hover' }] satisfies AxisBasedMarkersConfig[]
	}
};
