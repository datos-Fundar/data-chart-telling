import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { PlotRowContext } from '$lib';
import BoxPlot from '$lib/plots/distribution/box/Plot.svelte';
import { IRIS } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// A box's row has several values - its quartiles, its whiskers' ends, the values past them - and `styles.values.parts`
// picks the ones written, each beside its box at its own height. Iris petal lengths, by species (Fisher, 1936).

const meta = {
	title: 'Plots/Distribution/BoxPlot/Styles/Values',
	component: BoxPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: IRIS,
		x: 'species',
		y: 'petalLength',
		color: 'species',
		styles: { area: { fillOpacity: 0.4 } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 100, max: 700, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'BoxPlot' } }
	}
} satisfies Meta<typeof BoxPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `show: true` writes each box's whisker ends and its median, a box plot's default parts. */
export const Default: Story = {
	args: { styles: { area: { fillOpacity: 0.4 }, values: { show: true } } }
};

/** `parts: ['median']` writes only the median of each box. */
export const OnlyTheMedian: Story = {
	args: { styles: { area: { fillOpacity: 0.4 }, values: { parts: ['median'] } } }
};

/** The quartiles and the values past the whiskers: `outliers` writes one label for each of them. */
export const QuartilesAndOutliers: Story = {
	args: {
		styles: {
			area: { fillOpacity: 0.4 },
			values: { parts: ['p25', 'median', 'p75', 'outliers'], decimals: 1 }
		}
	}
};

/** A record gives a part options of its own - its own `format` here, which also reads the part off the `context`. */
export const OwnFormatPerPart: Story = {
	args: {
		styles: {
			area: { fillOpacity: 0.4 },
			values: {
				parts: {
					min: { format: (v: number) => `min ${v}` },
					median: { format: (v: number) => `median ${v} cm` },
					max: true
				},
				format: (v: number, _number: unknown, { part }: PlotRowContext) => `${part} ${v}`
			}
		}
	}
};

/** `series` labels the boxes of one series only: here only the largest flowers. */
export const OneSeries: Story = {
	args: {
		styles: {
			area: { fillOpacity: 0.4 },
			values: { series: 'virginica', parts: ['min', 'p25', 'median', 'p75', 'max'] }
		}
	}
};
