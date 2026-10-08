import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import { SURVEY_ANSWERS } from '../../data/survey-ratings';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A `jitterX` transform nudges each row's `x` by a small random amount, so dots
// that share a value spread out instead of hiding behind one another; `jitterY`
// does the same on `y`. Survey answers are whole numbers, so 240 answers land
// on a few dozen points. The noise is seeded: the same on every render, until
// `seed` changes. Only numbers and dates are nudged; category values are left alone.

const meta = {
	title: 'Transforms/Jitter/Basics',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 460,
		data: SURVEY_ANSWERS,
		x: 'rating',
		y: 'recommend',
		color: 'product',
		segments: {
			default: [{ styles: { dotRadius: 3, dotFillOpacity: 0.7, dotStroke: 'none' } }]
		},
		scales: { x: { label: 'Rating (1-5)' }, y: { label: 'Would recommend (0-10)' } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		color: { control: false },
		transforms: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** No jitter: 240 answers, but most dots sit exactly on top of others, so the crowded answers look no bigger than the rare ones. */
export const Overplotted: Story = {};

/** `jitterX` spreads each column sideways, by up to 0.3 either way: now how full a column is shows. */
export const JitterX: Story = {
	args: { transforms: [{ type: 'jitterX', width: 0.3 }] }
};

/** `jitterX` and `jitterY` together turn every point into a small cloud, sized by how many answers share it. */
export const BothAxes: Story = {
	args: {
		transforms: [
			{ type: 'jitterX', width: 0.3 },
			{ type: 'jitterY', width: 0.35 }
		]
	}
};

/** `distribution: 'normal'`: the noise clusters near the true value and thins out, instead of spreading evenly. */
export const Normal: Story = {
	args: {
		transforms: [
			{ type: 'jitterX', distribution: 'normal', std: 0.12 },
			{ type: 'jitterY', distribution: 'normal', std: 0.15 }
		]
	}
};

/** A different `seed` draws a different, equally stable set of offsets - compare with `BothAxes`. */
export const Seed: Story = {
	args: {
		transforms: [
			{ type: 'jitterX', width: 0.3, seed: 7 },
			{ type: 'jitterY', width: 0.35, seed: 8 }
		]
	}
};

/** A strip plot: respondents' ages along `x`, one strip per rating, with `jitterY` spreading each strip into a band. */
export const StripPlot: Story = {
	args: {
		x: 'age',
		y: 'rating',
		scales: { x: { label: 'Age' }, y: { label: 'Rating (1-5)' } },
		transforms: [{ type: 'jitterY', width: 0.25 }]
	}
};
