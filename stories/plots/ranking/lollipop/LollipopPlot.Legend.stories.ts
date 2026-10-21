import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LollipopPlot from '$lib/plots/ranking/lollipop/Plot.svelte';
import { PROVINCE_VALUES } from '$examples/data';

const FEMALE = PROVINCE_VALUES.filter((row) => row.sex === 'female');
import type { LegendExtension } from '$lib/types/layout/legend';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Each grouped lollipop shows in the automatic legend under its group's name
// and color. Extending its series section with `interactive` makes each entry
// a toggle: by default a toggled-off lollipop dims, `'hide'` makes it
// transparent and `'omit'` removes it entirely.

const meta = {
	title: 'Plots/Ranking/LollipopPlot/Legend',
	component: LollipopPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { y: { domain: [70, 85] } },
		data: FEMALE,
		x: 'province',
		y: 'value',
		color: 'province'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		legend: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LollipopPlot' } }
	}
} satisfies Meta<typeof LollipopPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The automatic legend, its series entries made toggles; `mode` sets what a toggled-off lollipop does. */
function toggles(mode: 'dim' | 'hide' | 'omit'): LegendExtension {
	return {
		series: {
			interactive: { enabled: true, ...(mode !== 'dim' ? { disabled: { mode } } : {}) }
		}
	};
}

/** Clicking a legend entry dims that lollipop: its stem and dot fade while the others keep their color. */
export const LegendDisabledDimsLollipop: Story = {
	args: {
		legend: toggles('dim')
	}
};

/** `interactive.disabled: { mode: 'hide' }` makes a toggled-off lollipop transparent: its band stays empty and the axes keep their range. */
export const LegendHideKeepsBand: Story = {
	args: {
		legend: toggles('hide')
	}
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off lollipop, and the axes close the gap. */
export const LegendOmitRescalesDomain: Story = {
	args: {
		legend: toggles('omit')
	}
};
