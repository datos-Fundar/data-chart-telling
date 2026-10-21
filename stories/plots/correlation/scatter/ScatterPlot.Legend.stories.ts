import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import type { LegendSection } from '$lib/types/layout/legend';
import { AMERICAS, COUNTRIES, EUROPE } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// An interactive `legend` toggles each region: by default a toggled-off region
// dims, or with `interactive.disabled: { mode: 'omit' }` it's removed.

const meta = {
	title: 'Plots/Correlation/ScatterPlot/Legend',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: AMERICAS,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy'
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

/** One interactive item per region; `mode` sets what a toggled-off region does. */
function regionLegend(mode: 'dim' | 'hide' | 'omit'): LegendSection[] {
	return [
		{
			type: 'discrete',
			title: 'Region',
			interactive: { enabled: true, ...(mode !== 'dim' ? { disabled: { mode } } : {}) },
			items: [
				{ name: 'Americas', symbol: 'circle' },
				{ name: 'Europe', symbol: 'circle' }
			]
		}
	];
}

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * A legend-disabled series dims its value labels too, not just its dots.
 * Toggling "Americas" or "Europe" off in the legend above fades that
 * region's point labels along with its dots, instead of leaving the labels
 * at full opacity while the dots fade.
 */
export const LegendDisabledDimsLabels: Story = {
	args: {
		data: [...AMERICAS, ...EUROPE],
		color: 'region',
		legend: regionLegend('dim'),
		styles: {
			values: { show: true, format: (v: number) => v.toFixed(0) }
		} satisfies AxisBasedStylesConfig
	}
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off region from the plot and rescales both axes. */
export const LegendOmitRescalesDomain: Story = {
	args: {
		data: [...AMERICAS, ...EUROPE],
		color: 'region',
		legend: regionLegend('omit')
	}
};

/**
 * `styles.values.hoverIsolate: true` dims every other series while the
 * pointer rests over a value label, exactly like toggling that series off
 * in the legend would - reverting on mouse-leave. Hover a country's label
 * to see every other region's dots and labels fade.
 */
export const HoverIsolate: Story = {
	args: {
		data: COUNTRIES,
		color: 'region',
		styles: {
			values: {
				show: true,
				hoverIsolate: true,
				format: (v: number) => v.toFixed(0)
			}
		} satisfies AxisBasedStylesConfig
	}
};
