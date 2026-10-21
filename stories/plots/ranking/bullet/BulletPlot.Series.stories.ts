import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import { PROVINCE_LIFE } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A bullet plot measures each category - here the life expectancy of women in five
// provinces - against a `target`, a tick across its band, and over `ranges`, the bands
// that grade it. A target is a field of the row, a function of it, or a number the same
// for every category; `ranges` lists the upper bounds of the bands, each running from the
// baseline, the smallest darkest. Categories on `y` lie sideways; on `x` they stand upright.

const meta = {
	title: 'Plots/Ranking/BulletPlot/Series',
	component: BulletPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: PROVINCE_LIFE,
		x: 'female',
		y: 'province',
		scales: { x: { domain: [70, 85] } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } }
	},
	parameters: {
		docs: { source: { name: 'BulletPlot' } }
	}
} satisfies Meta<typeof BulletPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** A target of 80 years over bands for under 76, 76 to 80 and over 80. */
export const Default: Story = {
	args: {
		target: 80,
		ranges: [76, 80, 85]
	}
};

/** Upright: the categories on `x`, the values on `y`. */
export const Upright: Story = {
	args: {
		x: 'province',
		y: 'female',
		scales: { y: { domain: [70, 85] } },
		target: 80,
		ranges: [76, 80, 85]
	}
};

/** A `target` that is a field gives each category its own: here the life expectancy of men. */
export const TargetFromField: Story = {
	args: {
		target: 80,
		ranges: [76, 80, 85]
	}
};

/** `ranges` as fields give each category its own bands; here two, around each province's men and women. */
export const RangesFromFields: Story = {
	args: {
		data: PROVINCE_LIFE.map((row) => ({ ...row, low: row.male - 2, high: row.female + 2 })),
		target: 'male',
		ranges: ['low', 'high', 85]
	}
};

/** Without `ranges` or `target`, only the bars remain: a plain bar plot. */
export const BarsOnly: Story = {
	args: {}
};
