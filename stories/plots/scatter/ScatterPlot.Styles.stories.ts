import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { AMERICAS, COUNTRIES } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/ScatterPlot/Styles',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: AMERICAS,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy'
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

/** No style overrides — the plot uses the configured theme defaults. */
export const Default: Story = {
	args: {}
};

/** Value labels enabled — `styles.values.show: true` labels every point with its raw Y value, positioned to the right of the dot by default. */
export const ShowValues: Story = {
	args: {
		styles: {
			values: { show: true }
		} satisfies AxisBasedStylesConfig
	}
};

/** Custom format — `format(value, seriesName)` receives the Y value (and the series name, empty here since labels aren't grouped) and returns any string. */
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

/** Grouped data with labels — every region's points get a label; `dotFillOpacity` on the plot's own dots isn't touched, only the text styling changes. */
export const GroupedWithLabels: Story = {
	args: {
		data: COUNTRIES,
		color: 'region',
		styles: {
			values: {
				show: true,
				format: (v: number) => v.toFixed(0)
			}
		} satisfies AxisBasedStylesConfig
	}
};

/** Custom font style — `fontStyle` overrides fill/size/weight directly, bypassing the theme defaults. */
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

/** Centered labels — `fontStyle.textAnchor`/`lineAnchor` bypass the default right-of-dot placement to center the text directly on each point instead. */
export const CenteredOnPoint: Story = {
	args: {
		r: 12,
		styles: {
			values: {
				show: true,
				format: (v: number) => v.toFixed(0),
				fontStyle: {
					textAnchor: 'middle',
					lineAnchor: 'middle',
					dx: 0,
					fill: '#ffffff',
					fontSize: 10
				}
			}
		} satisfies AxisBasedStylesConfig
	}
};
