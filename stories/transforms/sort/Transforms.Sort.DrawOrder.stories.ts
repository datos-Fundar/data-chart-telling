import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { MarkerTransform } from '$lib/types/transforms';
import { MEASUREMENTS } from '../../data/measurements';
import { SURVEY_ANSWERS, type SurveyAnswer } from '../../data/survey-ratings';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Of two overlapping dots, the one drawn later covers the other, and a
// ScatterPlot draws its rows in order. So the plot's own `transforms` decide
// what shows on top: the rows' own order, `reverse`d, `shuffle`d, or `sort`ed.
// Here two groups overlap in the middle, with large dots to make it visible.

const meta = {
	title: 'Transforms/Sort/Draw order',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: MEASUREMENTS,
		x: 'value',
		y: 'weight',
		color: 'group',
		scales: { x: { label: 'Value' }, y: { label: 'Weight' } },
		segments: { default: [{ styles: { dotRadius: 9, dotStroke: 'white', dotStrokeWidth: 1 } }] }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		transforms: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Survey answers as bubbles sized by the respondent's age (above 15, so the
 * sizes spread), jittered into tight clouds — size has nothing to do with
 * position, so big and small bubbles overlap, and the draw order decides which
 * stay visible. `transforms` run after the jitter.
 */
const bubbles = (transforms: MarkerTransform[]): Story['args'] => ({
	data: SURVEY_ANSWERS,
	x: 'rating',
	y: 'recommend',
	color: 'product',
	r: (d: Record<string, unknown>) => (d.age as number) - 15,
	scales: {
		x: { ticks: [1, 2, 3, 4, 5], label: 'Rating (1–5)' },
		y: { label: 'Would recommend (0–10)' }
	},
	segments: { default: [{ styles: { dotStroke: 'white', dotStrokeWidth: 1 } }] },
	transforms: [{ type: 'jitterX', width: 0.2 }, { type: 'jitterY', width: 0.25 }, ...transforms]
});

// ── Stories ───────────────────────────────────────────────────────────────────

/** No transform: every row of group A, then every row of group B — so B covers A wherever they overlap. */
export const DataOrder: Story = {};

/** `reverse`: B's rows come first now, so A covers B in the overlap. */
export const Reverse: Story = {
	args: { transforms: [{ type: 'reverse' }] }
};

/** `shuffle` mixes the rows, so neither group hides the other: the overlap reads as a mix of both. */
export const Shuffle: Story = {
	args: { transforms: [{ type: 'shuffle' }] }
};

/** `shuffle` with another `seed`: a different mix, the same on every render. */
export const ShuffleSeed: Story = {
	args: { transforms: [{ type: 'shuffle', seed: 3 }] }
};

/** `sort: 'age'`: the oldest respondents' bubbles come last, on top, and cover the small ones in each cloud. */
export const BiggestOnTop: Story = {
	args: bubbles([{ type: 'sort', sort: 'age' }])
};

/** A comparator, oldest first: the big bubbles are drawn first, and every small one stays visible on top of them. */
export const SmallestOnTop: Story = {
	args: bubbles([{ type: 'sort', sort: (a: SurveyAnswer, b: SurveyAnswer) => b.age - a.age }])
};
