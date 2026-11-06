import type { Meta, StoryObj } from '@storybook/svelte-vite';
import TreemapPlot from '$lib/plots/part-of-a-whole/treemap/Plot.svelte';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { BarSegmentStyle } from '$lib/types/plots/segments/common';
import { ACTIVITY_BRANCHES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A treemap's segments are keyed by its series - the outermost `grouping` level, here the sector - or `default`
// for every one: they style a group's tiles together. A key can also be the path of a tile, its levels joined by
// dots - `'Tertiary.Finance'`, `'Tertiary.Finance.Insurance'` - and the most specific wins. A segment sets no
// `areas`, as a tile has no axis position.

const meta = {
	title: 'Plots/Part of a whole/TreemapPlot/Segments',
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
		segments: { control: false }
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

/** No segments - every sector at full strength. */
export const Default: Story = {
	args: { ...BASE }
};

/**
 * Highlight one sector: `default` fades every group, and the sector's own segment, which wins over it, keeps
 * its tiles at full strength.
 */
export const HighlightASector: Story = {
	args: {
		...BASE,
		segments: {
			default: [{ styles: { fillOpacity: 0.25 } }],
			Tertiary: [{ styles: { fillOpacity: 1 } }]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};

/** Highlight two. */
export const HighlightTwoSectors: Story = {
	args: {
		...BASE,
		segments: {
			default: [{ styles: { fillOpacity: 0.25 } }],
			Primary: [{ styles: { fillOpacity: 1 } }],
			Secondary: [{ styles: { fillOpacity: 1 } }]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};

/** Outline a sector's tiles. */
export const OutlineASector: Story = {
	args: {
		...BASE,
		segments: {
			Secondary: [{ styles: { stroke: 'gold', strokeWidth: 3 } }]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};

/** Recolor one sector, whatever `scales.color` gives it. */
export const RecolorASector: Story = {
	args: {
		...BASE,
		segments: {
			Primary: [{ styles: { fill: '#d81b60' } }]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};

/** A style for every sector at once: `default`. */
export const StyleEverySector: Story = {
	args: {
		...BASE,
		segments: {
			default: [{ styles: { borderRadius: 8, fillOpacity: 0.85 } }]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};

/**
 * Segments over `styles.area`: the style every tile is drawn with, under each segment, which wins over it
 * field by field.
 */
export const OverStylesArea: Story = {
	args: {
		...BASE,
		styles: { area: { stroke: 'midnightblue', strokeWidth: 2 } },
		segments: {
			Tertiary: [{ styles: { stroke: 'gold', strokeWidth: 4 } }]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};

/**
 * A key is the path of a tile from its outermost level, joined by dots: `'Tertiary.Finance'` styles every tile
 * under that kind of activity, over what `Tertiary` gives them. `grouping` has all three levels here.
 */
export const StyleAKindOfActivity: Story = {
	args: {
		...BASE,
		grouping: 'sector.kind.branch',
		segments: {
			default: [{ styles: { fillOpacity: 0.3 } }],
			Tertiary: [{ styles: { fillOpacity: 0.6 } }],
			'Tertiary.Finance': [{ styles: { fillOpacity: 1, stroke: 'gold', strokeWidth: 3 } }]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};

/** The most specific path wins: one branch of a highlighted kind of activity gets a style of its own. */
export const StyleOneBranch: Story = {
	args: {
		...BASE,
		grouping: 'sector.kind.branch',
		segments: {
			'Tertiary.Finance': [{ styles: { stroke: 'gold', strokeWidth: 3 } }],
			'Tertiary.Finance.Insurance': [{ styles: { stroke: 'midnightblue', strokeWidth: 4 } }]
		} satisfies SegmentsConfig<BarSegmentStyle>
	}
};
