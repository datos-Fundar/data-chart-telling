import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import { PROVINCE_LIFE } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `segments` restyle the bars of some categories: each segment's `areas` selects the
// categories it covers, and its `fill` colors just those bars. The ranges and targets
// stay as they are.

const meta = {
	title: 'Plots/Ranking/BulletPlot/Segments',
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
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		segments: { control: false }
	},
	parameters: {
		docs: { source: { name: 'BulletPlot' } }
	}
} satisfies Meta<typeof BulletPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The bars of the provinces below the target in a strong red. */
export const BelowTarget: Story = {
	args: {
		segments: {
			default: [
				{
					areas: [
						{ y: { from: 'Buenos Aires', to: 'Buenos Aires' } },
						{ y: { from: 'Salta', to: 'Salta' } }
					],
					styles: { fill: '#dc2626' }
				}
			]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};
