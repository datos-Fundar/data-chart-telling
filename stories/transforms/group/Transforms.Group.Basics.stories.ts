import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { SURVEY_ANSWERS, type SurveyAnswer } from '../../data/survey-ratings';

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
		scales: { x: { label: 'Rating (1-5)' }, y: { label: 'Answers' } }
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

/** Every answer as a faint, jittered dot, for context behind a group's summary. */
const answerCloud: AxisBasedMarkersConfig = {
	type: 'dot',
	data: SURVEY_ANSWERS,
	x: 'rating',
	y: 'recommend',
	color: 'product',
	transforms: [
		{ type: 'jitterX', width: 0.3 },
		{ type: 'jitterY', width: 0.35 }
	],
	styles: { dotRadius: 2.5, dotFillOpacity: 0.3, dotStroke: 'none' }
};

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * `groupX` with `y: 'count'`: how many answers gave each rating, one dot per
 * rating and product, joined per product by a line. A group's rows come out in
 * the order each value first appears, and a line joins consecutive rows of the
 * same `grouping`, so the line sorts them by product, then by rating.
 */
export const CountPerValue: Story = {
	args: {
		markers: [
			{
				type: 'line',
				data: SURVEY_ANSWERS,
				x: 'rating',
				grouping: 'product',
				transforms: [
					{ type: 'groupX', y: 'count' },
					{
						type: 'sort',
						sort: (a: SurveyAnswer, b: SurveyAnswer) =>
							a.product.localeCompare(b.product) || a.rating - b.rating
					}
				],
				styles: { stroke: '#cbd5e1', strokeWidth: 2 }
			},
			{
				type: 'dot',
				data: SURVEY_ANSWERS,
				x: 'rating',
				grouping: 'product',
				color: 'product',
				transforms: [{ type: 'groupX', y: 'count' }],
				styles: { dotRadius: 6, dotStroke: 'white' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `groupX` with `y: 'mean'` reduces the marker's own `y`: the average "would recommend" score at each rating, over every answer. */
export const MeanPerValue: Story = {
	args: {
		scales: { x: { label: 'Rating (1-5)' }, y: { label: 'Would recommend (0-10)' } },
		markers: [
			answerCloud,
			{
				type: 'line',
				data: SURVEY_ANSWERS,
				x: 'rating',
				y: 'recommend',
				transforms: [
					{ type: 'groupX', y: 'mean' },
					{ type: 'sort', sort: { channel: 'x' } }
				],
				styles: { stroke: '#111827', strokeWidth: 2.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `groupY` groups by a category on `y` and reduces to `x`: each product's mean rating, a big dot over its answers. */
export const GroupY: Story = {
	args: {
		scales: { x: { label: 'Rating (1-5)' }, y: { label: false } },
		markers: [
			{
				type: 'dot',
				data: SURVEY_ANSWERS,
				x: 'rating',
				y: 'product',
				color: 'product',
				transforms: [{ type: 'jitterX', width: 0.3 }],
				styles: { dotRadius: 2.5, dotFillOpacity: 0.35, dotStroke: 'none' }
			},
			{
				type: 'dot',
				data: SURVEY_ANSWERS,
				x: 'rating',
				y: 'product',
				color: 'product',
				transforms: [{ type: 'groupY', x: 'mean' }],
				styles: { dotRadius: 9, dotStroke: '#111827', dotStrokeWidth: 1.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `groupZ` reduces each `grouping` to one row, both channels at once: `x: 'mean', y: 'mean'` is each product's centroid. */
export const GroupZ: Story = {
	args: {
		scales: { x: { label: 'Rating (1-5)' }, y: { label: 'Would recommend (0-10)' } },
		markers: [
			answerCloud,
			{
				type: 'dot',
				data: SURVEY_ANSWERS,
				x: 'rating',
				y: 'recommend',
				grouping: 'product',
				color: 'product',
				transforms: [{ type: 'groupZ', x: 'mean', y: 'mean' }],
				styles: { dotRadius: 10, dotStroke: '#111827', dotStrokeWidth: 1.5 }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `group` with `r: 'count'`: one bubble per rating-score pair, sized by how many answers share it. */
export const Bubbles: Story = {
	args: {
		scales: { x: { label: 'Rating (1-5)' }, y: { label: 'Would recommend (0-10)' } },
		markers: [
			{
				type: 'dot',
				data: SURVEY_ANSWERS,
				x: 'rating',
				y: 'recommend',
				transforms: [{ type: 'group', r: 'count' }],
				styles: { dotFill: '#2563eb', dotFillOpacity: 0.6, dotStroke: 'white' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/** `group` with `fill: 'count'` colors each pair by its count instead - the reducer becomes the marker's `color`. */
export const ColoredByCount: Story = {
	args: {
		scales: { x: { label: 'Rating (1-5)' }, y: { label: 'Would recommend (0-10)' } },
		markers: [
			{
				type: 'dot',
				data: SURVEY_ANSWERS,
				x: 'rating',
				y: 'recommend',
				transforms: [{ type: 'group', fill: 'count' }],
				styles: { dotRadius: 9, dotStroke: 'none', dotSymbol: 'square' }
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
