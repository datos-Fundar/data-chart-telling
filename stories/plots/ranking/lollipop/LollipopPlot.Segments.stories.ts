import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LollipopPlot from '$lib/plots/ranking/lollipop/Plot.svelte';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import { PROVINCE_VALUES } from '$datasets';

const FEMALE = PROVINCE_VALUES.filter((row) => row.sex === 'female');

// ── Meta ──────────────────────────────────────────────────────────────────────
// `segments` restyles some of a series' lollipops: each segment's `areas`
// selects the categories it covers, and its `stroke` and `dots` style just
// those stems and dots. Ungrouped rows form the `default` series.

const meta = {
	title: 'Plots/Ranking/LollipopPlot/Segments',
	component: LollipopPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { y: { domain: [70, 85] } },
		data: FEMALE,
		x: 'province',
		y: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		segments: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LollipopPlot' } }
	}
} satisfies Meta<typeof LollipopPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The lowest value in a strong red, the rest in the default color. */
export const HighlightOne: Story = {
	args: {
		segments: {
			default: [
				{
					areas: [{ x: { from: 'Salta', to: 'Salta' } }],
					styles: { stroke: { stroke: '#dc2626' }, dots: { dotFill: '#dc2626' } }
				}
			]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};

/** A dashed stem and a hollow dot mark the two Cuyo and Center provinces. `areas` takes one entry per category. */
export const Hollow: Story = {
	args: {
		segments: {
			default: [
				{
					areas: [
						{ x: { from: 'Córdoba', to: 'Córdoba' } },
						{ x: { from: 'Mendoza', to: 'Mendoza' } }
					],
					styles: {
						stroke: { strokeDasharray: '4 3' },
						dots: { dotFill: 'white', dotStroke: '#2563eb', dotStrokeWidth: 2 }
					}
				}
			]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};
