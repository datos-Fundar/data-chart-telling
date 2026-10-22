import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { HEIGHTS, type HeightRow } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// The group transforms collapse a marker's rows into one row per group and
// reduce each group's values: `groupX` groups by `x` and reduces to `y`,
// `groupY` the other way round, `groupZ` by `z` alone (the marker's
// `grouping`), and `group` by each `x`-`y` pair. The reducer is set on the
// transform (`y: 'count'`, `y: 'mean'`), and reads the marker's own channel of
// the same name. Unlike a bin, the groups are the distinct values themselves.

const meta = {
	title: 'Transforms/Group/Basics',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 440,
		data: [],
		x: 'x',
		y: 'y',
		scales: { x: { label: 'Height (cm)' }, y: { label: 'People' } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		markers: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every person as a faint, jittered dot, for context behind a group's summary. */
const peopleCloud: AxisBasedMarkersConfig = {
	type: 'dot',
	data: HEIGHTS,
	x: 'height',
	y: 'weight',
	color: 'group',
	transforms: [
		{ type: 'jitterX', width: 0.3 },
		{ type: 'jitterY', width: 0.05 }
	],
	styles: { dotRadius: 2.5, dotFillOpacity: 0.3, dotStroke: 'none' }
};

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * `groupX` with `y: 'count'`: how many people have each height, one dot per
 * height and sex, joined per sex by a line. A group's rows come out in
 * the order each value first appears, and a line joins consecutive rows of the
 * same `grouping`, so the line sorts them by sex, then by height.
 */
export const CountPerValue: Story = {
	args: {
		markers: [
			{
				type: 'line',
				data: HEIGHTS,
				x: 'height',
				grouping: 'group',
				transforms: [
					{ type: 'groupX', y: 'count' },
					{
						type: 'sort',
						sort: (a: HeightRow, b: HeightRow) =>
							a.group.localeCompare(b.group) || a.height - b.height
					}
				],
				styles: { stroke: '#cbd5e1', strokeWidth: 2 }
			},
			{
				type: 'dot',
				data: HEIGHTS,
				x: 'height',
				grouping: 'group',
				color: 'group',
				transforms: [{ type: 'groupX', y: 'count' }],
				styles: { dotRadius: 6, dotStroke: 'white' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `groupX` with `y: 'mean'` reduces the marker's own `y`: the average weight at each height, over every person. */
export const MeanPerValue: Story = {
	args: {
		scales: { x: { label: 'Height (cm)' }, y: { label: 'Weight (kg)' } },
		markers: [
			peopleCloud,
			{
				type: 'line',
				data: HEIGHTS,
				x: 'height',
				y: 'weight',
				transforms: [
					{ type: 'groupX', y: 'mean' },
					{ type: 'sort', sort: { channel: 'x' } }
				],
				styles: { stroke: '#111827', strokeWidth: 2.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `groupY` groups by a category on `y` and reduces to `x`: each sex's mean height, a big dot over its people. */
export const GroupY: Story = {
	args: {
		scales: { x: { label: 'Height (cm)' }, y: { label: false } },
		markers: [
			{
				type: 'dot',
				data: HEIGHTS,
				x: 'height',
				y: 'group',
				color: 'group',
				transforms: [{ type: 'jitterX', width: 0.3 }],
				styles: { dotRadius: 2.5, dotFillOpacity: 0.35, dotStroke: 'none' }
			},
			{
				type: 'dot',
				data: HEIGHTS,
				x: 'height',
				y: 'group',
				color: 'group',
				transforms: [{ type: 'groupY', x: 'mean' }],
				styles: { dotRadius: 9, dotStroke: '#111827', dotStrokeWidth: 1.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `groupZ` reduces each `grouping` to one row, both channels at once: `x: 'mean', y: 'mean'` is each sex's centroid. */
export const GroupZ: Story = {
	args: {
		scales: { x: { label: 'Height (cm)' }, y: { label: 'Weight (kg)' } },
		markers: [
			peopleCloud,
			{
				type: 'dot',
				data: HEIGHTS,
				x: 'height',
				y: 'weight',
				grouping: 'group',
				color: 'group',
				transforms: [{ type: 'groupZ', x: 'mean', y: 'mean' }],
				styles: { dotRadius: 10, dotStroke: '#111827', dotStrokeWidth: 1.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `group` with `r: 'count'`: one bubble per height and sex, sized by how many people share it. */
export const Bubbles: Story = {
	args: {
		scales: { x: { label: 'Height (cm)' }, y: { label: false } },
		markers: [
			{
				type: 'dot',
				data: HEIGHTS,
				x: 'height',
				y: 'group',
				transforms: [{ type: 'group', r: 'count' }],
				styles: { dotFill: '#2563eb', dotFillOpacity: 0.6, dotStroke: 'white' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `group` with `fill: 'count'` colors each pair by its count instead - the reducer becomes the marker's `color`. */
export const ColoredByCount: Story = {
	args: {
		scales: { x: { label: 'Height (cm)' }, y: { label: false } },
		markers: [
			{
				type: 'dot',
				data: HEIGHTS,
				x: 'height',
				y: 'group',
				transforms: [{ type: 'group', fill: 'count' }],
				styles: { dotRadius: 8, dotStroke: 'none', dotSymbol: 'square' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
