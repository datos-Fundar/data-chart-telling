import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/correlation/scatter/Plot.svelte';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { COUNTRIES, AMERICAS } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Correlation/ScatterPlot/Scales',
	component: ScatterPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500,
		data: COUNTRIES,
		x: 'gdpPerCapita',
		y: 'lifeExpectancy',
		color: 'region'
	},
	argTypes: {
		width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
		height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
		data: { control: false },
		scales: { description: 'Per-axis scale configuration.', control: false }
	},
	parameters: {
		docs: { source: { name: 'ScatterPlot' } }
	}
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** No scale overrides - both axes are auto-fitted to the data extent. */
export const Default: Story = {
	args: {}
};

/**
 * Log-scaled X axis - GDP per capita spans two orders of magnitude (Ethiopia
 * at $0.9k, Norway at $106k), so a linear axis crushes most countries into
 * the left edge. `type: 'log'` spreads them out evenly instead, the
 * conventional choice for this kind of wealth/income scatter.
 */
export const LogScaleX: Story = {
	args: {
		scales: { x: { type: 'log' } } satisfies AxisBasedScalesConfig
	}
};

/** Constrained Y domain - tightens the visible range instead of auto-fitting to the full data extent. */
export const CustomYDomain: Story = {
	args: {
		data: AMERICAS,
		color: undefined,
		scales: { y: { domain: [65, 85] } } satisfies AxisBasedScalesConfig
	}
};

/** Zero-anchored Y axis - `zero: true` forces the domain to include 0 even though every life-expectancy value sits far above it, keeping relative magnitudes honest at the cost of compressing the visible spread. */
export const ZeroAnchoredY: Story = {
	args: {
		scales: { y: { zero: true } } satisfies AxisBasedScalesConfig
	}
};

/** Axis labels - a human-readable string appears alongside each axis, overriding the field-name label svelteplot infers by default. */
export const WithAxisLabels: Story = {
	args: {
		scales: {
			x: { label: 'GDP per capita (USD thousands)' },
			y: { label: 'Life expectancy (years)' }
		} satisfies AxisBasedScalesConfig
	}
};

/** Grid lines on the Y axis - horizontal reference lines at every tick make it easier to read off individual values. */
export const WithGrid: Story = {
	args: {
		scales: { y: { grid: true } } satisfies AxisBasedScalesConfig
	}
};

/** Custom tick formatter - the function receives the raw tick value and returns the display string; here it appends `"k"` to every X tick. */
export const CustomTickFormat: Story = {
	args: {
		scales: {
			x: { tickFormat: (d: unknown) => `${d}k` }
		} satisfies AxisBasedScalesConfig
	}
};

/** Both domains combined with labelled axes and a Y grid - the same overrides layered together on one plot. */
export const CombinedOverrides: Story = {
	args: {
		scales: {
			x: { type: 'log', label: 'GDP per capita (USD thousands)' },
			y: { domain: [50, 90], label: 'Life expectancy (years)', grid: true }
		} satisfies AxisBasedScalesConfig
	}
};
