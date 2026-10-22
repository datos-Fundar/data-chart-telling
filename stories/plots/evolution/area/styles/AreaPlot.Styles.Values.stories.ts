import type { Meta, StoryObj } from '@storybook/svelte-vite';
import AreaPlot from '$lib/plots/evolution/area/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { AGE_SHARES_BY_YEAR } from '$datasets';

// ── Meta ──────────────────────────────────────────────────────────────────────
// `styles.values` labels the end of every area, the same way a line plot labels
// the end of every line: at each series' last value, in the series' color.
// Labels that would overlap fan out into a shared column, each routed back to
// its own area by a connector.

const meta = {
	title: 'Plots/Evolution/AreaPlot/Styles/Values',
	component: AreaPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400,
		data: AGE_SHARES_BY_YEAR,
		x: 'year',
		y: 'share',
		color: 'ageGroup',
		scales: {
			y: { domain: [0, 100], label: 'Share of the population (%)' }
		}
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 500, step: 50 } },
		styles: { control: false }
	},
	parameters: {
		docs: { source: { name: 'AreaPlot' } }
	}
} satisfies Meta<typeof AreaPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** `values.show: true` labels each area's last value as `"${seriesName} - ${value}"`, right of its end. */
export const ShowValues: Story = {
	args: {
		styles: { values: { show: true } } satisfies AxisBasedStylesConfig
	}
};

/** Stacked with `transforms: [{ type: 'stackY' }]`, each label sits at the top of its own band but still reads the age group's own share, not the running total. */
export const Stacked: Story = {
	args: {
		transforms: [{ type: 'stackY' }],
		styles: {
			values: { show: true, format: (v: number, name: string) => `${name} ${v}%` }
		} satisfies AxisBasedStylesConfig
	}
};

/** `format(value, seriesName)` returns each label's text. */
export const CustomFormat: Story = {
	args: {
		styles: {
			values: { show: true, format: (v: number, name: string) => `${name}: ${v}%` }
		} satisfies AxisBasedStylesConfig
	}
};

/** `strokeStyle` styles the connectors that route moved labels back to their areas. */
export const CustomConnector: Story = {
	args: {
		styles: {
			values: {
				show: true,
				format: (v: number, name: string) => `${name} ${v}%`,
				strokeStyle: { stroke: '#7c3aed', strokeWidth: 1, strokeDasharray: '2 2' }
			}
		} satisfies AxisBasedStylesConfig
	}
};

/** `hoverIsolate: true` dims every other area while the pointer is over one label. */
export const HoverIsolate: Story = {
	args: {
		styles: {
			values: {
				show: true,
				hoverIsolate: true,
				format: (v: number, name: string) => `${name} ${v}%`
			}
		} satisfies AxisBasedStylesConfig
	}
};
