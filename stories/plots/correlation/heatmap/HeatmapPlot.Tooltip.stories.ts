import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import RichTooltip from './RichTooltip.svelte';
import { PENGUIN_COUNTS, type PenguinSpeciesCount } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Correlation/HeatmapPlot/Tooltip',
	component: HeatmapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		series: { control: false },
		tooltip: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HeatmapPlot' } }
	}
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

const SERIES = [
	{
		name: 'penguins',
		x: 'island',
		y: 'species',
		color: 'count',
		data: PENGUIN_COUNTS
	} satisfies Series<PenguinSpeciesCount>
];

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Basic tooltip - the `format` callback receives the hovered cell and
 * returns the string shown in the floating box.
 *
 * Hover over any cell to activate.
 */
export const BasicTooltip: Story = {
	args: {
		series: SERIES,
		tooltip: {
			sync: false,
			format: (row) => {
				const { island, species, count } = row as PenguinSpeciesCount;
				return `${island} - ${species}: ${count} penguins`;
			}
		}
	}
};

/**
 * Rich multi-line format - `\n` splits the tooltip string across lines.
 * The first line becomes the heading, the rest the body.
 */
export const RichFormat: Story = {
	args: {
		series: SERIES,
		tooltip: {
			sync: false,
			format: (row) => {
				const { island, species, count } = row as PenguinSpeciesCount;
				return `Island: ${island}\nSpecies: ${species}\nPenguins: ${count}`;
			}
		}
	}
};

/**
 * Computed tooltip - the format function can derive any string from the row.
 * Here it shows the count relative to a 50-penguin threshold.
 */
export const ComputedFormat: Story = {
	args: {
		series: SERIES,
		tooltip: {
			sync: false,
			format: (row) => {
				const { island, species, count } = row as PenguinSpeciesCount;
				const delta = count - 50;
				const sign = count >= 50 ? '+' : '';
				return `${island} - ${species}: ${count} penguins (${sign}${delta} vs 50)`;
			}
		}
	}
};

/**
 * Rounded value format - displays the count as a plain number of penguins
 * for easier interpretation at a glance.
 */
export const RoundedValue: Story = {
	args: {
		series: SERIES,
		tooltip: {
			sync: false,
			format: (row) => {
				const { island, species, count } = row as PenguinSpeciesCount;
				return `${island} - ${species}\n${count} penguins`;
			}
		}
	}
};

/**
 * Fully custom tooltip markup via `content` - replaces the default floating
 * label entirely with an arbitrary snippet: a bold header, a colour swatch
 * matching the hovered cell's own fill, and a footnote. `format` is still
 * required by the type but is ignored once `content` is set.
 *
 * See `RichTooltip.svelte` for the markup - the library automatically drops
 * its default dark tooltip box (background/padding/border) whenever
 * `content` is set, so the custom card fully owns the look.
 */
export const CustomContent: StoryObj = {
	render: () => ({ Component: RichTooltip })
};

/**
 * `anchorX`/`anchorY` override the system default (`'right'`/`'bottom'`).
 * Here it's pinned above-and-to-the-left of the cursor instead - still
 * falls back toward the opposite side (via the centered position) if the
 * cursor gets close enough to an edge that the preferred side would
 * overflow.
 */
export const CustomAnchor: Story = {
	args: {
		series: SERIES,
		tooltip: {
			sync: false,
			anchorX: 'left',
			anchorY: 'top',
			format: (row) => {
				const { island, species, count } = row as PenguinSpeciesCount;
				return `${island} - ${species}: ${count} penguins`;
			}
		}
	}
};
