import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ForestPlot from '$lib/plots/forest/Plot.svelte';
import type { LegendExtension } from '$lib/types/layout/legend';
import { INFLATION_RANGES } from '$examples/data';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Each region shows in the automatic legend under its name and color. Extending
// its series section with `interactive` makes each entry a toggle: by default a
// toggled-off region dims, `'hide'` makes it transparent and `'omit'` removes it
// entirely, and the connectors close over the regions that are left.

const meta = {
	title: 'Plots/ForestPlot/Legend',
	component: ForestPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 480,
		data: INFLATION_RANGES,
		x: 'mean',
		y: 'period',
		lower: 'min',
		upper: 'max',
		color: 'region'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		legend: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ForestPlot' } }
	}
} satisfies Meta<typeof ForestPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The automatic legend, its series entries made toggles; `mode` sets what a toggled-off region does. */
function toggles(mode: 'dim' | 'hide' | 'omit'): LegendExtension {
	return {
		series: {
			interactive: { enabled: true, ...(mode !== 'dim' ? { disabled: { mode } } : {}) }
		}
	};
}

/** Clicking a legend entry dims that region: its stems and dots fade while the others keep their color. */
export const LegendDisabledDimsRegion: Story = {
	args: {
		legend: toggles('dim')
	}
};

/** `interactive.disabled: { mode: 'hide' }` makes a toggled-off region transparent: the axes keep their range. */
export const LegendHideKeepsRange: Story = {
	args: {
		legend: toggles('hide')
	}
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off region, and the axes and connectors follow. */
export const LegendOmitRescalesDomain: Story = {
	args: {
		legend: toggles('omit')
	}
};
