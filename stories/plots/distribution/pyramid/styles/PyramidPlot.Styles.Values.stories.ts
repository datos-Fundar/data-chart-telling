import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../../../data/population-pyramid';

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

const DATA = POPULATION_PYRAMID.filter((d) => d.year === 2022);

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Value labels enabled - displays the population percentage at each bar.
 * `styles.values.show: true` renders the numeric value at the end of each bar.
 */
export const WithValueLabels: Story = {
	args: {
		data: DATA,
		x: 'pct',
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
		x: 'pct',
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
 * Value labels anchored inside - displays values at the end of bars but
 * positioned inside rather than outside, useful for dense pyramids.
 */
export const LabelsInside: Story = {
	args: {
		data: DATA,
		x: 'pct',
		y: 'ageGroup',
		color: 'sex',
		scales: { y: { domain: AGE_GROUPS } },
		styles: {
			values: {
				show: true,
				anchor: 'end',
				format: (v: number) => `${v.toFixed(1)}%`,
				fontStyle: { fill: '#ffffff', fontWeight: 'bold' }
			}
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Labels with custom offset - uses `dy` to nudge labels vertically away from
 * the bars for better readability.
 */
export const LabelsWithOffset: Story = {
	args: {
		data: DATA,
		x: 'pct',
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
				fontStyle: { dy: 8 }
			}
		} satisfies AxisBasedStylesConfig
	}
};
