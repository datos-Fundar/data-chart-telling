import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { CurveName } from '$lib/types/layout/styles/curve';
import { LIFE_EXPECTANCY } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const CURVES: CurveName[] = [
	'linear',
	'step',
	'step-after',
	'step-before',
	'monotone-x',
	'basis',
	'cardinal',
	'catmull-rom',
	'natural',
	'bump-x'
];

const meta = {
	title: 'Plots/Evolution/LinePlot/Curves',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: LIFE_EXPECTANCY,
		x: 'year',
		y: 'value',
		color: 'sex'
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 700, step: 50 }
		}
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Whole plot: styles.curve ──────────────────────────────────────────────────

/**
 * `styles.curve` joins the points of every line. Pick any curve in the panel;
 * `'linear'` (straight segments) is the default.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AnyCurve: any = {
	args: { styles: { curve: 'monotone-x' } },
	argTypes: {
		curve: {
			control: { type: 'select' },
			options: CURVES,
			description: 'Story control: it sets `styles.curve`, the curve of every line.',
			table: { category: 'Styles' }
		}
	},
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	render: ({ curve, ...props }: any) => ({
		Component: LinePlot,
		props: { ...props, styles: { curve: curve as CurveName } }
	})
};

/** Straight segments between points, what a line plot draws without a `curve`. */
export const Linear: Story = {
	args: { styles: { curve: 'linear' } }
};

/**
 * `'step-after'` holds each value until the next point: the usual step plot,
 * for a value that stays as it is until something changes it.
 */
export const StepAfter: Story = {
	args: { styles: { curve: 'step-after' } }
};

/** `'step-before'` jumps to each value at the previous point and holds it back to there. */
export const StepBefore: Story = {
	args: { styles: { curve: 'step-before' } }
};

/** `'step'` changes halfway between two points. */
export const StepMiddle: Story = {
	args: { styles: { curve: 'step' } }
};

/** `'monotone-x'` smooths the line without overshooting the data. */
export const Monotone: Story = {
	args: { styles: { curve: 'monotone-x' } }
};

/** `'basis'` smooths the line past the data: it does not go through every point. */
export const Basis: Story = {
	args: { styles: { curve: 'basis' } }
};

/** `'catmull-rom'` passes through every point; it can overshoot between them. */
export const CatmullRom: Story = {
	args: { styles: { curve: 'catmull-rom' } }
};

// ── One segment: segments[...].styles.curve ───────────────────────────────────

/**
 * A segment sets its own `curve`: the female line is straight until 2012 and
 * steps from then on. A segment's curve wins over `styles.curve`.
 */
export const StepOnlyInASegment: Story = {
	args: {
		segments: {
			female: [{ areas: [{ x: { from: 2012 } }], styles: { curve: 'step-after' } }]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};

/** A curve per series: `segments` keyed by series name, each with its own `curve`. */
export const CurvePerSeries: Story = {
	args: {
		segments: {
			female: [{ styles: { curve: 'step-after' } }],
			male: [{ styles: { curve: 'monotone-x' } }]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};

/** `styles.curve` for the whole plot, with one segment going back to straight segments. */
export const StepExceptASegment: Story = {
	args: {
		styles: { curve: 'step-after' },
		segments: {
			default: [{ areas: [{ x: { from: 2012, to: 2016 } }], styles: { curve: 'linear' } }]
		} satisfies SegmentsConfig<LineSegmentStyle>
	}
};
