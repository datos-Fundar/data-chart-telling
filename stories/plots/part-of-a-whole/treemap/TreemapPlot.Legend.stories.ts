import type { Meta, StoryObj } from '@storybook/svelte-vite';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import { ACTIVITY_BRANCHES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Part of a whole/TreemapPlot/Legend',
	component: TreemapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 540
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		data: { control: false },
		legend: { control: false }
	},
	parameters: {
		docs: { source: { name: 'TreemapPlot' } }
	}
} satisfies Meta<typeof TreemapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every story draws the same branches of activity: a tile each, sized by its value and colored by its sector. */
const BASE = {
	data: ACTIVITY_BRANCHES,
	value: 'value',
	grouping: 'sector.branch'
} as const;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The automatic legend lists the sectors, one entry per outermost group. */
export const Default: Story = {
	args: { ...BASE }
};

/** `legend: false` draws none. */
export const NoLegend: Story = {
	args: { ...BASE, legend: false }
};

/** `legend.series.labels` rewrites each entry without touching the names the series are known by. */
export const LabelledEntries: Story = {
	args: {
		...BASE,
		legend: { series: { title: 'Sector', labels: { suffix: ' activities' } } }
	}
};

/** A series turned off from code dims its tiles and their labels, like a toggled-off legend entry. */
export const SectorOff: Story = {
	args: {
		...BASE,
		legend: { off: { Tertiary: 0.15 } }
	}
};

/**
 * The automatic legend made interactive: click a sector to turn it off. By default it dims - its tiles stay where
 * they are, faded, with their labels.
 */
export const InteractiveDim: Story = {
	args: {
		...BASE,
		legend: { series: { interactive: { enabled: true } } }
	}
};

/**
 * `disabled: { mode: 'omit' }` takes a sector out: its tiles are gone, and the rest keep their place and their
 * share of the whole economy - the room it took stays empty.
 */
export const InteractiveOmit: Story = {
	args: {
		...BASE,
		legend: { series: { interactive: { enabled: true, disabled: { mode: 'omit' } } } }
	}
};

/**
 * `disabled: { mode: 'rescale' }` takes a sector out and makes the rest the new whole: the tiles fill the plot
 * again, and each share is of what is left - turn Tertiary off and Chemicals goes from 3.8% to 29.2%.
 */
export const InteractiveRescale: Story = {
	args: {
		...BASE,
		legend: { series: { interactive: { enabled: true, disabled: { mode: 'rescale' } } } }
	}
};

/**
 * `disabled: { mode: 'hide' }` makes a sector's tiles fully transparent, labels included. The other tiles keep their
 * place and their share, as with `'omit'`.
 */
export const InteractiveHide: Story = {
	args: {
		...BASE,
		legend: { series: { interactive: { enabled: true, disabled: { mode: 'hide' } } } }
	}
};
