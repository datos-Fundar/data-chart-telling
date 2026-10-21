import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { AGE_SHARES } from '$examples/data';

const CENSUSES = AGE_SHARES.filter(({ year }) => year === 1991 || year === 2022);

// ── Meta ──────────────────────────────────────────────────────────────────────
// `segments` restyle series like a line plot's: a segment with no `areas` covers the whole
// series, under its name or under `default` for all of them.

const meta = {
	title: 'Plots/Evolution/SlopePlot/Segments',
	component: SlopePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: CENSUSES,
		x: 'year',
		y: 'share',
		color: 'ageGroup',
		styles: { values: { show: true } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		segments: { description: 'Segment styling rules.', control: false }
	},
	parameters: {
		docs: { source: { name: 'SlopePlot' } }
	}
} satisfies Meta<typeof SlopePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The 65+ group in a thicker line, so it stands out from the others. */
export const Highlighted: Story = {
	args: {
		segments: {
			'65+': [{ styles: { stroke: { strokeWidth: 5 }, dots: { dotRadius: 8 } } }]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};

/** Every series dashed. */
export const Dashed: Story = {
	args: {
		segments: {
			default: [{ styles: { stroke: { strokeDasharray: '6 4' } } }]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};
