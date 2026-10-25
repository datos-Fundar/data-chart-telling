import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { LegendSection } from '$lib/types/layout/legend';
import { COUNTRIES_AT_2007 } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// An interactive `legend` toggles each continent: by default a toggled-off continent
// dims, or with `interactive.disabled: { mode: 'omit' }` it's removed.

const meta = {
	title: 'Plots/Correlation/ScatterPlot/Legend',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES_AT_2007,
		x: 'gdp',
		y: 'life'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		data: { control: false },
		styles: { description: 'Rendering style overrides.', control: false },
		legend: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One interactive item per continent; `mode` sets what a toggled-off continent does. */
function continentLegend(mode: 'dim' | 'hide' | 'omit'): LegendSection[] {
	return [
		{
			type: 'discrete',
			title: 'Continent',
			interactive: { enabled: true, ...(mode !== 'dim' ? { disabled: { mode } } : {}) },
			items: ['Americas', 'Europe', 'Asia', 'Africa'].map((name) => ({
				name,
				symbol: 'circle' as const
			}))
		}
	];
}

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * A legend-disabled series dims its value labels too, not just its dots.
 * Toggling a continent off in the legend above fades that
 * continent's point labels along with its dots, instead of leaving the labels
 * at full opacity while the dots fade.
 */
export const LegendDisabledDimsLabels: Story = {
	args: {
		data: COUNTRIES_AT_2007,
		color: 'continent',
		legend: continentLegend('dim'),
		styles: {
			values: { show: true, format: (v: number) => v.toFixed(0) }
		} satisfies AxisBasedStylesConfig
	}
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off continent from the plot and rescales both axes. */
export const LegendOmitRescalesDomain: Story = {
	args: {
		data: COUNTRIES_AT_2007,
		color: 'continent',
		legend: continentLegend('omit')
	}
};

/**
 * `styles.values.hoverIsolate: true` dims every other series while the
 * pointer rests over a value label, exactly like toggling that series off
 * in the legend would - reverting on mouse-leave. Hover a country's label
 * to see every other continent's dots and labels fade.
 */
export const HoverIsolate: Story = {
	args: {
		data: COUNTRIES_AT_2007,
		color: 'continent',
		styles: {
			values: {
				show: true,
				hoverIsolate: true,
				format: (v: number) => v.toFixed(0)
			}
		} satisfies AxisBasedStylesConfig
	}
};
