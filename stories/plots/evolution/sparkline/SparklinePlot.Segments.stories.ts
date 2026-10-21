import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SparklinePlot from '$lib/plots/evolution/sparkline/Plot.svelte';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { REGION_VALUES } from '$datasets';

const GBA = REGION_VALUES.filter(({ region }) => region === 'GBA');

// ── Meta ──────────────────────────────────────────────────────────────────────
// `segments` restyle the line like a line plot's: here the last year in a stronger color.

const meta = {
	title: 'Plots/Evolution/SparklinePlot/Segments',
	component: SparklinePlot,
	tags: ['autodocs'],
	args: {
		width: 300,
		height: 80,
		data: GBA,
		x: 'date',
		y: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 100, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 40, max: 400, step: 10 } },
		segments: { description: 'Segment styling rules.', control: false }
	},
	parameters: {
		docs: { source: { name: 'SparklinePlot' } }
	}
} satisfies Meta<typeof SparklinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The last year of the series in red. */
export const Highlighted: Story = {
	args: {
		width: 400,
		segments: {
			default: [
				{
					areas: [{ x: { from: new Date(Date.UTC(2025, 8, 1)) } }],
					styles: { stroke: { stroke: '#dc2626', strokeWidth: 2.5 } }
				}
			]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};
