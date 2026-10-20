import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ClevelandPlot from '$lib/plots/cleveland/Plot.svelte';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import { AGE_SHARES } from '$examples/data';
import { SEQUENTIAL_COLORS } from './colors';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `segments` restyles some of a series' dots: each segment's `areas` selects the
// categories it covers, and its `dots` style just those dots. Ungrouped rows form
// the `default` series.

const meta = {
	title: 'Plots/ClevelandPlot/Segments',
	component: ClevelandPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { color: SEQUENTIAL_COLORS },
		data: AGE_SHARES,
		x: 'ageGroup',
		y: 'share',
		grouping: 'year'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		segments: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ClevelandPlot' } }
	}
} satisfies Meta<typeof ClevelandPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The dots of one category outlined, to pick it out. */
export const Outlined: Story = {
	args: {
		segments: {
			default: [
				{
					areas: [{ x: { from: '65+', to: '65+' } }],
					styles: { dots: { dotStroke: '#111827', dotStrokeWidth: 2 } }
				}
			]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};

/** Larger dots for two categories. `areas` takes one entry per category. */
export const Larger: Story = {
	args: {
		segments: {
			default: [
				{
					areas: [{ x: { from: '0-14', to: '0-14' } }, { x: { from: '15-29', to: '15-29' } }],
					styles: { dots: { dotRadius: 9 } }
				}
			]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};
