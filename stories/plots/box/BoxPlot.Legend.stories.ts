import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BoxPlot from '$lib/plots/box/Plot.svelte';
import { BUENOS_AIRES_TRIPS } from '../../data/commute-times';
import type { LegendExtension } from '$lib/types/layout/legend';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Each grouped box shows in the automatic legend under its group's name and
// color. Extending its series section with `interactive` makes each entry a
// toggle: by default a toggled-off box dims, `'hide'` makes it transparent and
// `'omit'` removes it entirely.

const meta = {
	title: 'Plots/BoxPlot/Legend',
	component: BoxPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: BUENOS_AIRES_TRIPS,
		x: 'mode',
		y: 'minutes',
		color: 'mode'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		legend: { control: false }
	},
	parameters: {
		docs: { source: { name: 'BoxPlot' } }
	}
} satisfies Meta<typeof BoxPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The automatic legend, its series entries made toggles; `mode` sets what a toggled-off box does. */
function toggles(mode: 'dim' | 'hide' | 'omit'): LegendExtension {
	return {
		series: {
			interactive: { enabled: true, ...(mode !== 'dim' ? { disabled: { mode } } : {}) }
		}
	};
}

/** Clicking a legend entry dims that box: its fill fades while the others keep their color. */
export const LegendDisabledDimsBox: Story = {
	args: {
		legend: toggles('dim')
	}
};

/** `interactive.disabled: { mode: 'hide' }` makes a toggled-off box transparent: its band stays empty and the axes keep their range. */
export const LegendHideKeepsBand: Story = {
	args: {
		legend: toggles('hide')
	}
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off box, and the axes close the gap. */
export const LegendOmitRescalesDomain: Story = {
	args: {
		legend: toggles('omit')
	}
};
