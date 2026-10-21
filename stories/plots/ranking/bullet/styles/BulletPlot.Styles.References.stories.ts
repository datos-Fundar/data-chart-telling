import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import type { BulletStylesConfig } from '$lib/types/layout/styles';
import { PROVINCE_LIFE } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.bar` sets the thickness of the bar, `styles.ranges` sets the colors and thickness of the bands that grade the value, and
// `styles.target` the color, thickness and length of the tick at each target. Each falls
// back to `bullet` in the configuration.

const meta = {
	title: 'Plots/Ranking/BulletPlot/Styles/References',
	component: BulletPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: PROVINCE_LIFE,
		x: 'female',
		y: 'province',
		target: 80,
		ranges: [76, 80, 85],
		scales: { x: { domain: [70, 85] } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'BulletPlot' } }
	}
} satisfies Meta<typeof BulletPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `ranges.colors` lists the bands' colors from the smallest to the largest: here a traffic light. */
export const RangeColors: Story = {
	args: {
		styles: {
			ranges: { colors: ['#fca5a5', '#fde68a', '#bbf7d0'] }
		} satisfies BulletStylesConfig
	}
};

/** `ranges.width` makes the bands thicker or thinner, in px. */
export const RangeWidth: Story = {
	args: {
		styles: { ranges: { width: 44 } } satisfies BulletStylesConfig
	}
};

/** `bar.thickness` sets how thick the bar is, in px. */
export const BarThickness: Story = {
	args: {
		styles: { bar: { thickness: 20 } } satisfies BulletStylesConfig
	}
};

/** `target` restyles the tick. */
export const TargetTick: Story = {
	args: {
		styles: {
			target: { color: '#dc2626', width: 4, length: 36 }
		} satisfies BulletStylesConfig
	}
};
