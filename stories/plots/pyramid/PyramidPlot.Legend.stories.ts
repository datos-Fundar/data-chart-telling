import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PyramidPlot from '$lib/plots/pyramid/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_GROUPS, POPULATION_PYRAMID } from '../../data/population-pyramid';
import type { LegendSection } from '$lib/types/layout/legend';

// ── Meta ──────────────────────────────────────────────────────────────────────
// An interactive `legend` toggles each side: a toggled-off side dims.

const meta = {
	title: 'Plots/PyramidPlot/Legend',
	component: PyramidPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 520
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 320, max: 800, step: 20 } },
		styles: { control: false },
		legend: { control: false }
	},
	parameters: {
		docs: { source: { name: 'PyramidPlot' } }
	}
} satisfies Meta<typeof PyramidPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const DATA = POPULATION_PYRAMID.filter((d) => d.year === 2022);

const SEX_LEGEND: LegendSection[] = [
	{
		type: 'discrete',
		title: 'Sex',
		interactive: { enabled: true },
		items: [
			{ name: 'Female', symbol: 'square' },
			{ name: 'Male', symbol: 'square' }
		]
	}
];

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * A legend-disabled side dims its value labels too, not just its bars.
 * Toggling "Female" or "Male" off in the legend above fades that
 * side's labels along with its bars, instead of leaving the labels at full
 * opacity while the bars fade.
 */
export const LegendDisabledDimsLabels: Story = {
	args: {
		data: DATA,
		x: 'pct',
		y: 'ageGroup',
		color: 'sex',
		legend: SEX_LEGEND,
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
 * `styles.values.hoverIsolate: true` dims every other series while the
 * pointer rests over a value label, exactly like toggling that side off in
 * the legend would - reverting on mouse-leave. Hover a "Female" or
 * "Male" label to see the other side's bars and labels fade.
 */
export const HoverIsolate: Story = {
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
			values: { show: true, hoverIsolate: true, format: (v: number) => `${v.toFixed(1)}%` }
		} satisfies AxisBasedStylesConfig
	}
};
