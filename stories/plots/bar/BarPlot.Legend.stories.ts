import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import {
	FEMALE_LIFE_EXPECTANCY_BY_PROVINCE,
	MALE_LIFE_EXPECTANCY_BY_PROVINCE,
	type ProvincePoint
} from './data';
import type { LegendSection } from '$lib/types/layout/legend';

// ── Meta ──────────────────────────────────────────────────────────────────────
// An interactive `legend` toggles each series: by default a toggled-off series
// dims, or with `interactive.disabled: { mode: 'omit' }` it's removed.

const meta = {
	title: 'Plots/BarPlot/Legend',
	component: BarPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		series: { control: false },
		styles: { control: false },
		legend: { control: false }
	},
	parameters: {
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const FEMALE = {
	name: 'female',
	x: 'province',
	y: 'value',
	data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
} satisfies Series<ProvincePoint>;

const MALE = {
	name: 'male',
	x: 'province',
	y: 'value',
	data: MALE_LIFE_EXPECTANCY_BY_PROVINCE
} satisfies Series<ProvincePoint>;

/** One interactive item per sex; `mode` sets what a toggled-off series does. */
function sexLegend(mode: 'dim' | 'hide' | 'omit'): LegendSection[] {
	return [
		{
			type: 'discrete',
			title: 'Sex',
			interactive: { enabled: true, ...(mode !== 'dim' ? { disabled: { mode } } : {}) },
			items: [
				{ name: 'female', label: 'Female', symbol: 'square' },
				{ name: 'male', label: 'Male', symbol: 'square' }
			]
		}
	];
}

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * A legend-disabled series dims its value labels too, not just its bars.
 * Toggling "Female" or "Male" off in the legend above fades that
 * series' labels along with its bars, instead of leaving the labels at full
 * opacity while the bars fade.
 */
export const LegendDisabledDimsLabels: Story = {
	args: {
		series: [FEMALE, MALE],
		legend: sexLegend('dim'),
		styles: {
			values: {
				show: true,
				format: (v: number, name: string) => `${name} (${v.toFixed(1)})`
			}
		} satisfies AxisBasedStylesConfig
	}
};

/** `interactive.disabled: { mode: 'omit' }` with side-by-side series - omitted series' bars reflow the group. */
export const LegendOmitReflowsGroups: Story = {
	args: {
		series: [FEMALE, MALE],
		legend: sexLegend('omit')
	}
};

/**
 * `interactive.disabled: { mode: 'hide' }` makes a toggled-off series fully
 * transparent but leaves everything else where it was: the other series'
 * bars keep their slot in each group and the value axis keeps its range.
 * Compare with `LegendOmitReflowsGroups`.
 */
export const LegendHideKeepsLayout: Story = {
	args: {
		series: [FEMALE, MALE],
		legend: sexLegend('hide')
	}
};

/** Same `interactive.disabled: { mode: 'omit' }` idea, with series stacked by a plot-level `stackY`. */
export const LegendOmitReflowsStack: Story = {
	args: {
		series: [FEMALE, MALE],
		legend: sexLegend('omit'),
		transforms: [{ type: 'stackY' }]
	}
};

/**
 * `styles.values.hoverIsolate: true` dims every other series while the
 * pointer rests over a value label, exactly like toggling that series off
 * in the legend would - reverting on mouse-leave. Hover a "female" or
 * "male" label to see the other series' bars and labels fade.
 */
export const HoverIsolate: Story = {
	args: {
		series: [FEMALE, MALE],
		styles: {
			values: {
				show: true,
				hoverIsolate: true,
				format: (v: number, name: string) => `${name} (${v.toFixed(1)})`
			}
		} satisfies AxisBasedStylesConfig
	}
};

/** `interactive.disabled: { mode: 'omit' }` combined with value labels and `styles.values.hoverIsolate`. */
export const LegendOmitDropsLabelsHoverIsolatesRest: Story = {
	args: {
		series: [FEMALE, MALE],
		legend: sexLegend('omit'),
		styles: {
			values: {
				show: true,
				hoverIsolate: true,
				format: (v: number, name: string) => `${name} (${v.toFixed(1)})`
			}
		} satisfies AxisBasedStylesConfig
	}
};
