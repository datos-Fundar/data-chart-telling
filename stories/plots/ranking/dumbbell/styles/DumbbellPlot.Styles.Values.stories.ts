import type { Meta, StoryObj } from '@storybook/svelte-vite';
import DumbbellPlot from '$lib/plots/ranking/dumbbell/Plot.svelte';
import type { ConnectorBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_SHARES, PROVINCE_VALUES } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.values` writes each dot's value: past the highest and the lowest of its
// category, and beside the ones between. `select` picks which dots of each category
// are written (`'first'`, `'last'`, `'min'`, `'max'`, or a list of those), `series`
// which series, `format` also gets the row, `color: 'series'` colors each label like
// its dot, and `fontStyle` styles the text.

const meta = {
	title: 'Plots/Ranking/DumbbellPlot/Styles/Values',
	component: DumbbellPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'DumbbellPlot' } }
	}
} satisfies Meta<typeof DumbbellPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Life expectancy by province: a dot per sex. */
const PROVINCES = {
	data: PROVINCE_VALUES,
	x: 'province',
	y: 'value',
	color: 'sex'
};

/** The first and the last census: a dot per year in each age group. */
const CENSUSES = AGE_SHARES.filter((row) => row.year === 1991 || row.year === 2022);

// ── Stories ───────────────────────────────────────────────────────────────────

/** `show: true` labels every dot with its value. */
export const Default: Story = {
	args: {
		...PROVINCES,
		styles: { values: { show: true } } satisfies ConnectorBasedStylesConfig
	}
};

/** `format` turns the number into text; sideways rows put the labels to the right of the highest dot. */
export const Sideways: Story = {
	args: {
		...PROVINCES,
		x: 'value',
		y: 'province',
		scales: { x: { domain: [70, 85] } },
		styles: {
			values: { show: true, format: (value: number) => `${value} years` }
		} satisfies ConnectorBasedStylesConfig
	}
};

/** `select: 'max'` writes only the higher value of each province. */
export const OnlyTheHigher: Story = {
	args: {
		...PROVINCES,
		styles: { values: { show: true, select: 'max' } } satisfies ConnectorBasedStylesConfig
	}
};

/**
 * Between the first and the last census, each age group's share moved up or down.
 * `select: 'last'` writes only the 2022 dots, so the label reads the share today and
 * the dot's side of its connector, the direction of the change; `color: 'series'`
 * colors the label like its dot.
 */
export const LastSeriesLabelled: Story = {
	args: {
		data: CENSUSES,
		x: 'share',
		y: 'ageGroup',
		grouping: 'year',
		scales: { x: { domain: [14, 26] } },
		styles: {
			values: {
				show: true,
				select: 'last',
				color: 'series',
				format: (value: number) => `${value}%`,
				fontStyle: { fontWeight: 600 }
			}
		} satisfies ConnectorBasedStylesConfig
	}
};
