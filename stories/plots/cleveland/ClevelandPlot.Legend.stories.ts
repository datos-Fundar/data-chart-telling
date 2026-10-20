import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ClevelandPlot from '$lib/plots/cleveland/Plot.svelte';
import type { LegendExtension } from '$lib/types/layout/legend';
import { AGE_SHARES } from '$examples/data';
import { SEQUENTIAL_COLORS } from './colors';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Each series shows in the automatic legend under its name and color. Extending
// its series section with `interactive` makes each entry a toggle: by default a
// toggled-off series dims, `'hide'` makes it transparent and `'omit'` removes it
// entirely, and the connectors close over the series that is left.

const meta = {
	title: 'Plots/ClevelandPlot/Legend',
	component: ClevelandPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { color: SEQUENTIAL_COLORS },
		data: AGE_SHARES,
		x: 'ageGroup',
		y: 'share',
		grouping: 'year'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		legend: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ClevelandPlot' } }
	}
} satisfies Meta<typeof ClevelandPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The automatic legend, its series entries made toggles; `mode` sets what a toggled-off series does. */
function toggles(mode: 'dim' | 'hide' | 'omit'): LegendExtension {
	return {
		series: {
			interactive: { enabled: true, ...(mode !== 'dim' ? { disabled: { mode } } : {}) }
		}
	};
}

/** Clicking a legend entry dims that series: its dots fade while the others keep their color. */
export const LegendDisabledDimsSeries: Story = {
	args: {
		legend: toggles('dim')
	}
};

/** `interactive.disabled: { mode: 'hide' }` makes a toggled-off series transparent: the axes keep their range. */
export const LegendHideKeepsRange: Story = {
	args: {
		legend: toggles('hide')
	}
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off series, and the axes and connectors follow. */
export const LegendOmitRescalesDomain: Story = {
	args: {
		legend: toggles('omit')
	}
};
