import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/dumbbell/Plot.svelte';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import { PROVINCE_VALUES } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `segments` restyles some of a series' dots: each segment's `areas` selects the
// categories it covers, and its `dots` style just those dots. Ungrouped rows form
// the `default` series.

const meta = {
	title: 'Plots/DumbbellPlot/Segments',
	component: DumbbellPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: PROVINCE_VALUES,
		x: 'province',
		y: 'value',
		color: 'sex'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		segments: { control: false }
	},
	parameters: {
		docs: { source: { name: 'DumbbellPlot' } }
	}
} satisfies Meta<typeof DumbbellPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The dots of one category outlined, to pick it out. */
export const Outlined: Story = {
	args: {
		segments: {
			default: [
				{
					areas: [{ x: { from: 'Chubut', to: 'Chubut' } }],
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
					areas: [
						{ x: { from: 'Córdoba', to: 'Córdoba' } },
						{ x: { from: 'Mendoza', to: 'Mendoza' } }
					],
					styles: { dots: { dotRadius: 9 } }
				}
			]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};
