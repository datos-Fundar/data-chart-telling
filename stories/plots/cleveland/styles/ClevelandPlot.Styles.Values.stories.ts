import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ClevelandPlot from '$lib/plots/cleveland/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_SHARES } from '$examples/data';

/** Only the first and last census, so every category has two dots and its labels fit. */
const ENDS = AGE_SHARES.filter((row) => row.year === 1991 || row.year === 2022);

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.values` writes each dot's value: past the highest and the lowest of its
// category, and beside the ones between.

const meta = {
	title: 'Plots/ClevelandPlot/Styles/Values',
	component: ClevelandPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
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
		styles: { values: { show: true } } satisfies AxisBasedStylesConfig
	}
};

/** `format` turns the number into text; sideways rows put the labels to the right of the highest dot. */
export const Sideways: Story = {
	args: {
		x: 'share',
		y: 'ageGroup',
		scales: { x: { domain: [14, 26] } },
		styles: {
			values: { show: true, format: (value: number) => `${value} %` }
		} satisfies AxisBasedStylesConfig
	}
};
