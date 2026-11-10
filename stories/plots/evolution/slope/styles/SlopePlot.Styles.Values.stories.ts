import type { Meta, StoryObj } from '@storybook/svelte-vite';
import type { PlotRowContext } from '$lib';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_SHARES } from '$datasets';

const CENSUSES = AGE_SHARES.filter(({ year }) => year === 1991 || year === 2022);

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.values` labels each series' first and last point. `format` writes their text,
// `series` labels only some of the series and `select` picks other points to label.

const meta = {
	title: 'Plots/Evolution/SlopePlot/Styles/Values',
	component: SlopePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: CENSUSES,
		x: 'year',
		y: 'share',
		color: 'ageGroup',
		styles: { values: { show: true } }
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'SlopePlot' } }
	}
} satisfies Meta<typeof SlopePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `show: true` labels both ends, outside the lines. */
export const Default: Story = {
	args: { styles: { values: { show: true } } satisfies AxisBasedStylesConfig }
};

/** `format` turns the value and the series name into text. */
export const Formatted: Story = {
	args: {
		styles: {
			values: {
				show: true,
				format: (value: number, _number: unknown, context: PlotRowContext) =>
					`${context.series}: ${value}%`
			}
		} satisfies AxisBasedStylesConfig
	}
};

/** `series` labels only the chosen ones. */
export const SomeSeries: Story = {
	args: {
		styles: { values: { show: true, series: ['0-14', '65+'] } } satisfies AxisBasedStylesConfig
	}
};

/** `hoverIsolate: true` dims every other series while the pointer is over a label. */
export const IsolateOnHover: Story = {
	args: {
		styles: { values: { show: true, hoverIsolate: true } } satisfies AxisBasedStylesConfig
	}
};

/**
 * With several series, the labels at both ends fan out into lanes. `layout: 'path'` writes each series' name along
 * its own line instead, so each line says which it is without a legend or a lane.
 */
export const NamesAlongTheLines: Story = {
	args: {
		legend: false,
		styles: { values: { layout: 'path', offset: '50%' } }
	}
};
