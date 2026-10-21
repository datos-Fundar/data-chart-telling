import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import { AGE_SHARES } from '$examples/data';

const CENSUSES = AGE_SHARES.filter(({ year }) => year === 1991 || year === 2022);

// ── Meta ──────────────────────────────────────────────────────────────────────
// A vertical `rule` marker at each position stands for its axis, the way a slope chart
// is usually drawn: the dots hang on two guide lines. `segments` set the highlighted
// series apart from the rest, which fade.

const meta = {
	title: 'Plots/Evolution/SlopePlot/Markers/Rules',
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
		markers: { description: 'Marker annotations.', control: false },
		segments: { description: 'Segment styling rules.', control: false }
	},
	parameters: {
		docs: { source: { name: 'SlopePlot' } }
	}
} satisfies Meta<typeof SlopePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

const GUIDES = [1991, 2022].map((year) => ({
	type: 'rule' as const,
	axis: 'x' as const,
	value: year,
	styles: { stroke: '#9ca3af', strokeDasharray: '2 3', strokeOpacity: 0.8 }
})) satisfies AxisBasedMarkersConfig[];

/** A dotted guide at each position. */
export const Guides: Story = {
	args: { markers: GUIDES }
};

/** The guides with two series highlighted and the rest faded. */
export const HighlightedSeries: Story = {
	args: {
		markers: GUIDES,
		segments: {
			'0-14': [{ styles: { stroke: { strokeWidth: 3 } } }],
			'65+': [{ styles: { stroke: { strokeWidth: 3 } } }],
			default: [
				{
					styles: {
						stroke: { strokeOpacity: 0.25 },
						dots: { dotFillOpacity: 0.25, dotStrokeOpacity: 0.25 }
					}
				}
			]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};
