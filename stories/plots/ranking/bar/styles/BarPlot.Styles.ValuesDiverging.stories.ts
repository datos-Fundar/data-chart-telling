import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Ranking/BarPlot/Styles/Values (diverging)',
	component: BarPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 700, step: 50 }
		},
		series: { description: 'Data series to render.', control: false },
		styles: { description: 'Rendering style overrides.', control: false }
	},
	parameters: {
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

type ChangeRow = { jurisdiction: string; change: number };

const CHANGES: ChangeRow[] = [
	{ jurisdiction: 'A', change: -0.88 },
	{ jurisdiction: 'B', change: -0.44 },
	{ jurisdiction: 'C', change: -0.06 },
	{ jurisdiction: 'D', change: 0.02 },
	{ jurisdiction: 'E', change: 0.33 },
	{ jurisdiction: 'F', change: 1.13 }
];

/** Bars that go left of zero (or below it) and bars that go right of it (or above it). */
const HORIZONTAL = {
	name: 'change',
	x: 'change',
	y: 'jurisdiction',
	data: CHANGES
} satisfies Series<ChangeRow>;

const VERTICAL = {
	name: 'change',
	x: 'jurisdiction',
	y: 'change',
	data: CHANGES
} satisfies Series<ChangeRow>;

const values = (anchor: 'outside' | 'start' | 'middle' | 'end') =>
	({
		values: { show: true, anchor, decimals: 2, signDisplay: 'always' }
	}) satisfies AxisBasedStylesConfig;

// ── Horizontal ────────────────────────────────────────────────────────────────

/**
 * Horizontal bars, anchor `'outside'` - each label sits beyond its bar's tip: to the right of a bar
 * from zero up, to the left of one from zero down.
 */
export const HorizontalOutside: Story = {
	args: { series: [HORIZONTAL], styles: values('outside') }
};

/** Horizontal bars, anchor `'start'` - inside each bar, at its left end. */
export const HorizontalStart: Story = {
	args: { series: [HORIZONTAL], styles: values('start') }
};

/** Horizontal bars, anchor `'middle'` - centred on each bar. */
export const HorizontalMiddle: Story = {
	args: { series: [HORIZONTAL], styles: values('middle') }
};

/** Horizontal bars, anchor `'end'` - inside each bar, at its right end. */
export const HorizontalEnd: Story = {
	args: { series: [HORIZONTAL], styles: values('end') }
};

// ── Vertical ──────────────────────────────────────────────────────────────────

/**
 * Vertical bars, anchor `'outside'` - each label sits beyond its bar's tip: above a bar from zero up,
 * under one from zero down.
 */
export const VerticalOutside: Story = {
	args: { series: [VERTICAL], styles: values('outside') }
};

/** Vertical bars, anchor `'start'` - inside each bar, at its top end. */
export const VerticalStart: Story = {
	args: { series: [VERTICAL], styles: values('start') }
};

/** Vertical bars, anchor `'middle'` - centred on each bar. */
export const VerticalMiddle: Story = {
	args: { series: [VERTICAL], styles: values('middle') }
};

/** Vertical bars, anchor `'end'` - inside each bar, at its bottom end. */
export const VerticalEnd: Story = {
	args: { series: [VERTICAL], styles: values('end') }
};
