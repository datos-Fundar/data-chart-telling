import type { Meta, StoryObj } from '@storybook/svelte-vite';
import SparklinePlot from '$lib/plots/evolution/sparkline/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { REGION_VALUES } from '$datasets';

const GBA = REGION_VALUES.filter(({ region }) => region === 'GBA');

// ── Meta ──────────────────────────────────────────────────────────────────────
// The last point's value is `styles.values`: `format` writes it, `show: false` leaves it out
// and `select` labels other points.

const meta = {
	title: 'Plots/Evolution/SparklinePlot/Styles/Values',
	component: SparklinePlot,
	tags: ['autodocs'],
	args: {
		width: 300,
		height: 80,
		data: GBA,
		x: 'date',
		y: 'value'
	},
	argTypes: {
		width: { control: { type: 'range', min: 100, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 40, max: 400, step: 10 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'SparklinePlot' } }
	}
} satisfies Meta<typeof SparklinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** The default: the last value beside its dot. */
export const Default: Story = {};

/** `format` turns the number into text. */
export const Formatted: Story = {
	args: {
		styles: {
			values: { format: (value: number) => `${value}%` }
		} satisfies AxisBasedStylesConfig
	}
};

/** `show: false` leaves only the line and its dot. */
export const WithoutValue: Story = {
	args: { styles: { values: { show: false } } satisfies AxisBasedStylesConfig }
};

/** `select` labels the highest and the last points. */
export const PeakAndLast: Story = {
	args: {
		width: 400,
		height: 100,
		styles: { values: { select: ['max', 'last'] } } satisfies AxisBasedStylesConfig
	}
};
