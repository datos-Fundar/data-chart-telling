import type { Meta, StoryObj } from '@storybook/svelte-vite';
import RaincloudPlot from '$lib/plots/distribution/raincloud/Plot.svelte';
import { IRIS } from '$datasets';
import type { LegendExtension } from '$lib/types/layout/legend';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Each grouped raincloud shows in the automatic legend under its group's name
// and color. Extending its series section with `interactive` makes each entry a
// toggle: by default a toggled-off raincloud dims - its cloud, dots and box -,
// `'hide'` makes it transparent and `'omit'` removes it entirely.

const meta = {
	title: 'Plots/Distribution/RaincloudPlot/Legend',
	component: RaincloudPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: IRIS,
		x: 'species',
		y: 'sepalLength',
		color: 'species'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		legend: { control: false }
	},
	parameters: {
		docs: { source: { name: 'RaincloudPlot' } }
	}
} satisfies Meta<typeof RaincloudPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The automatic legend, its series entries made toggles; `mode` sets what a toggled-off raincloud does. */
function toggles(mode: 'dim' | 'hide' | 'omit'): LegendExtension {
	return {
		series: {
			interactive: { enabled: true, ...(mode !== 'dim' ? { disabled: { mode } } : {}) }
		}
	};
}

/** Clicking a legend entry dims that raincloud: its cloud, dots and box fade while the others keep theirs. */
export const LegendDisabledDims: Story = {
	args: {
		legend: toggles('dim')
	}
};

/** `interactive.disabled: { mode: 'hide' }` makes a toggled-off raincloud transparent: its band stays empty and the axes keep their range. */
export const LegendHideKeepsBand: Story = {
	args: {
		legend: toggles('hide')
	}
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off raincloud, and the axes close the gap. */
export const LegendOmitRescalesDomain: Story = {
	args: {
		legend: toggles('omit')
	}
};
