import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/area/Plot.svelte';
import { ENERGY_MIX } from '../../data/energy-mix';
import { HEIGHT_DENSITY } from '../../data/height-density';
import AreaDimLegendDemo from './AreaDimLegendDemo.svelte';
import AreaOmitLegendDemo from './AreaOmitLegendDemo.svelte';
import AreaStackedDimLegendDemo from './AreaStackedDimLegendDemo.svelte';
import AreaStackedOmitLegendDemo from './AreaStackedOmitLegendDemo.svelte';
import { renderSource } from '../../common/docsSource';

// ── Meta ──────────────────────────────────────────────────────────────────────
// Each grouped area shows in the legend under its group's name and color.
// Clicking a legend entry toggles that area on and off: by default it dims,
// or with `interactive.disabled: { mode: 'omit' }` it is removed entirely.

const meta = {
	title: 'Plots/AreaPlot/Legend',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } }
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;

/**
 * Clicking a legend entry dims that area instead of hiding it: its fill fades
 * to the legend's disabled opacity while the other area keeps its color. Here
 * the two sexes overlap, so the dimmed one stays readable behind the other.
 * Composed with `provideLegendInteraction()` + `LegendLayout` around `AreaPlot`
 * directly (no `BaseChart`). See `AreaDimLegendDemo.svelte`.
 */
export const LegendDisabledDimsArea: StoryObj = {
	render: () => ({ Component: AreaDimLegendDemo }),
	parameters: {
		docs: {
			source: {
				code: renderSource('AreaPlot', {
					width: 950,
					height: 400,
					data: HEIGHT_DENSITY,
					x: 'height',
					y: 'density',
					color: 'sex'
				})
			}
		}
	}
};

/** `interactive.disabled: { mode: 'omit' }` removes a toggled-off area from the plot and rescales the y-axis. See `AreaOmitLegendDemo.svelte`. */
export const LegendOmitRescalesDomain: StoryObj = {
	render: () => ({ Component: AreaOmitLegendDemo }),
	parameters: {
		docs: {
			source: {
				code: renderSource('AreaPlot', {
					width: 950,
					height: 400,
					data: HEIGHT_DENSITY,
					x: 'height',
					y: 'density',
					color: 'sex'
				})
			}
		}
	}
};

/**
 * Stacked, a dimmed source keeps its place in the stack: its band fades in
 * position while the others stay where they are, so the total still reads 100%.
 * See `AreaStackedDimLegendDemo.svelte`.
 */
export const LegendDisabledDimsStacked: StoryObj = {
	render: () => ({ Component: AreaStackedDimLegendDemo }),
	parameters: {
		docs: {
			source: {
				code: renderSource('AreaPlot', {
					width: 950,
					height: 400,
					data: ENERGY_MIX,
					x: 'year',
					y: 'share',
					color: 'source',
					transforms: [{ type: 'stackY' }],
				})
			}
		}
	}
};

/**
 * Stacked, `interactive.disabled: { mode: 'omit' }` removes a toggled-off source
 * and the stack closes the gap, with the y-axis rescaled to what remains. See
 * `AreaStackedOmitLegendDemo.svelte`.
 */
export const LegendOmitRescalesStack: StoryObj = {
	render: () => ({ Component: AreaStackedOmitLegendDemo }),
	parameters: {
		docs: {
			source: {
				code: renderSource('AreaPlot', {
					width: 950,
					height: 400,
					data: ENERGY_MIX,
					x: 'year',
					y: 'share',
					color: 'source',
					transforms: [{ type: 'stackY' }]
				})
			}
		}
	}
};
