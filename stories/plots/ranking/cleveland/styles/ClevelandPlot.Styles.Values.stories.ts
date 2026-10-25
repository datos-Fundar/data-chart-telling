import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ClevelandPlot from '$lib/plots/ranking/cleveland/Plot.svelte';
import type { ConnectorBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_SHARES } from '$datasets';
import { SEQUENTIAL_COLORS } from '../colors';

/** Only the first and last census, so every category has two dots and its labels fit. */
const ENDS = AGE_SHARES.filter((row) => row.year === 1991 || row.year === 2022);

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.values` writes each dot's value: past the highest and the lowest of its
// category, and beside the ones between. `select` picks which dots of each category are written
// (`'first'`, `'last'`, `'min'`, `'max'`, or a list of those), `series` which series, and
// `color: 'series'` colors each label like its dot.

const meta = {
	title: 'Plots/Ranking/ClevelandPlot/Styles/Values',
	component: ClevelandPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		scales: { color: SEQUENTIAL_COLORS },
		data: ENDS,
		x: 'ageGroup',
		y: 'share',
		grouping: 'year'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'ClevelandPlot' } }
	}
} satisfies Meta<typeof ClevelandPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `show: true` labels every dot with its value. */
export const Default: Story = {
	args: {
		styles: { values: { show: true } } satisfies ConnectorBasedStylesConfig
	}
};

/** `format` turns the number into text; sideways rows put the labels to the right of the highest dot. */
export const Sideways: Story = {
	args: {
		x: 'share',
		y: 'ageGroup',
		scales: { color: SEQUENTIAL_COLORS, x: { domain: [14, 26] } },
		styles: {
			values: { show: true, format: (value: number) => `${value} %` }
		} satisfies ConnectorBasedStylesConfig
	}
};

/** With four censuses, `select: ['min', 'max']` writes only the lowest and the highest share of each age group. */
export const OnlyTheEnds: Story = {
	args: {
		data: AGE_SHARES,
		scales: { color: SEQUENTIAL_COLORS, y: { domain: [14, 26] } },
		styles: {
			values: { show: true, select: ['min', 'max'], color: 'series' }
		} satisfies ConnectorBasedStylesConfig
	}
};

/** `select` takes a list: the first and the last census of each age group here. */
export const FirstAndLast: Story = {
	args: {
		data: AGE_SHARES,
		scales: { color: SEQUENTIAL_COLORS, y: { domain: [14, 26] } },
		styles: {
			values: {
				show: true,
				select: ['first', 'last'],
				color: 'series',
				format: (value: number) => `${value}%`
			}
		} satisfies ConnectorBasedStylesConfig
	}
};
