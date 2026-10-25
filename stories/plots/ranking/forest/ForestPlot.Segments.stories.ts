import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ForestPlot from '$lib/plots/ranking/forest/Plot.svelte';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import { INFLATION_RANGES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `segments` restyles some of a series' dots: each segment's `areas` selects the
// categories it covers, and its `dots` style just those dots. Ungrouped rows form
// the `default` series.

const meta = {
	title: 'Plots/Ranking/ForestPlot/Segments',
	component: ForestPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 480,
		data: INFLATION_RANGES,
		x: 'mean',
		y: 'period',
		lower: 'min',
		upper: 'max',
		color: 'region'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		segments: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ForestPlot' } }
	}
} satisfies Meta<typeof ForestPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The dot of one row outlined, to pick it out. */
export const Outlined: Story = {
	args: {
		segments: {
			default: [
				{
					areas: [{ y: { from: 'GBA 2023', to: 'GBA 2023' } }],
					styles: { dots: { dotStroke: '#111827', dotStrokeWidth: 2 } }
				}
			]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};

/** Larger dots for two rows. `areas` takes one entry per row. */
export const Larger: Story = {
	args: {
		segments: {
			default: [
				{
					areas: [
						{ y: { from: 'GBA 2026', to: 'GBA 2026' } },
						{ y: { from: 'Cuyo 2026', to: 'Cuyo 2026' } }
					],
					styles: { dots: { dotRadius: 9 } }
				}
			]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};
