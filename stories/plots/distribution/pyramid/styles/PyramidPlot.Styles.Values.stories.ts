import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import type { AxisBasedStylesConfig, BarValueLabel, WithValues } from '$lib/types/layout/styles';
import { AGE_GROUPS, POPULATION_BY_AGE } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Distribution/PyramidPlot/Styles/Values',
	component: PyramidPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 520
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'PyramidPlot' } }
	}
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const DATA = POPULATION_BY_AGE.filter((d) => d.year === 2022);

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Value labels enabled - displays the population percentage at each bar.
 * `styles.values.show: true` renders the numeric value at the end of each bar.
 */
export const WithValueLabels: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: {
			x: { domain: [-6, 6] },
			y: { domain: AGE_GROUPS }
		},
		styles: {
			values: { show: true }
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Value labels with custom format - shows percentages with one decimal place
 * and the % symbol for clarity.
 */
export const CustomValueFormat: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: {
			x: { domain: [-6, 6] },
			y: { domain: AGE_GROUPS }
		},
		styles: {
			values: { show: true, format: (v: number) => `${v.toFixed(1)}%` }
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Value labels inside their bars - `layout: 'path'` along each bar's `base`, `side: 'inside'`, writes each value at
 * the baseline; `edge: 'tip'` would write it at the bar's end, and `side: 'outside'` there (the default) beyond it.
 * Useful for dense pyramids.
 */
export const LabelsInside: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: { y: { domain: AGE_GROUPS } },
		styles: {
			values: {
				layout: 'path',
				edge: 'base',
				side: 'inside',
				format: (v: number) => `${v.toFixed(1)}%`,
				fontStyle: { fill: '#ffffff', fontWeight: 'bold' }
			}
		} satisfies WithValues<AxisBasedStylesConfig, BarValueLabel>
	}
};

/**
 * Labels with a custom gap - `gap` sets how far past each bar's tip its label sits.
 */
export const LabelsWithOffset: Story = {
	args: {
		data: DATA,
		x: 'share',
		y: 'ageGroup',
		color: 'sex',
		scales: {
			x: { domain: [-6, 6] },
			y: { domain: AGE_GROUPS }
		},
		styles: {
			values: {
				show: true,
				format: (v: number) => `${v.toFixed(1)}%`,
				gap: 12
			}
		} satisfies AxisBasedStylesConfig
	}
};
