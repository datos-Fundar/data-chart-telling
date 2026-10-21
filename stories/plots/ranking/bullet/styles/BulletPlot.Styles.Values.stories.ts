import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BulletPlot from '$lib/plots/ranking/bullet/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { PROVINCE_LIFE } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.values` writes each bar's value, with the same `anchor` and `format` as a bar
// plot's.

const meta = {
	title: 'Plots/Ranking/BulletPlot/Styles/Values',
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

/** `show: true` writes each value past the end of its bar. */
export const Default: Story = {
	args: { styles: { values: { show: true } } satisfies AxisBasedStylesConfig }
};

/** `format` turns the number into text. */
export const Formatted: Story = {
	args: {
		styles: {
			values: { show: true, format: (value: number) => `${value} years` }
		} satisfies AxisBasedStylesConfig
	}
};
