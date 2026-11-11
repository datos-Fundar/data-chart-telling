import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { PlotRowContext } from '$lib';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { COUNTRIES_AT_2007 } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Correlation/ScatterPlot/Styles/Values',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES_AT_2007,
		x: 'gdp',
		y: 'life'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		data: { control: false },
		styles: { description: 'Rendering style overrides.', control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** No style overrides - the plot uses the configured theme defaults. */
export const Default: Story = {
	args: {}
};

/** Value labels enabled - `styles.values.show: true` labels every point with its raw Y value, above its dot by default, or on the next free spot clockwise around it. */
export const ShowValues: Story = {
	args: {
		styles: {
			values: { show: true }
		} satisfies AxisBasedStylesConfig
	}
};

/** Custom format - `format(value, seriesName)` receives the Y value (and the series name, empty here since labels aren't grouped) and returns any string. */
export const CustomFormat: Story = {
	args: {
		styles: {
			values: {
				show: true,
				format: (v: number) => `${v.toFixed(1)} yr`
			}
		} satisfies AxisBasedStylesConfig
	}
};

/** Grouped data with labels - every continent's points get a label; `dotFillOpacity` on the plot's own dots isn't touched, only the text styling changes. */
export const GroupedWithLabels: Story = {
	args: {
		data: COUNTRIES_AT_2007,
		color: 'continent',
		styles: {
			values: {
				show: true,
				format: (v: number) => v.toFixed(0)
			}
		} satisfies AxisBasedStylesConfig
	}
};

/** Custom font style - `fontStyle` overrides fill/size/weight directly, bypassing the theme defaults. */
export const CustomFontStyle: Story = {
	args: {
		styles: {
			values: {
				show: true,
				format: (v: number) => `${v.toFixed(1)} yr`,
				fontStyle: { fill: '#7f1d1d', fontWeight: 'bold', fontSize: 13 }
			}
		} satisfies AxisBasedStylesConfig
	}
};

/** Centered labels - `side: 'on'` writes each value on its own dot instead of beside it; a label on its point is never moved aside. */
export const CenteredOnPoint: Story = {
	args: {
		r: 12,
		styles: {
			values: {
				side: 'on',
				format: (v: number) => v.toFixed(0),
				fontStyle: {
					fill: '#ffffff',
					fontSize: 10
				}
			}
		} satisfies AxisBasedStylesConfig
	}
};

/**
 * Bubbles sized by population, each country's name written around its rim (`layout: 'path'`) - a label beside a
 * big bubble would sit far from its center, one inside would not fit.
 */
export const AroundTheBubbles: Story = {
	args: {
		data: COUNTRIES_AT_2007.filter((row) => row.population > 120),
		r: 'population',
		scales: {
			x: {
				type: 'log',
				domain: [1500, 50_000],
				ticks: [1500, 2000, 3000, 4000, 5000, 10_000, 20_000, 30_000, 40_000, 50_000]
			},
			y: { domain: [40, 90] },
			r: { range: [8, 20] }
		},
		styles: {
			values: {
				layout: 'path',
				format: (_value: number, _number: unknown, { row }: PlotRowContext) =>
					String((row as { country: string }).country)
			}
		},
		legend: {
			r: { suffix: ' (M)' }
		}
	}
};
