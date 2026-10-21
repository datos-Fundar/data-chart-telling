import type { Meta, StoryObj } from '@storybook/svelte-vite';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import type { Series } from '$lib/types/plots/data/common';
import type { AxisBasedScalesConfig } from '$lib/types/layout/scales';
import { LIFE_EXPECTANCY_BY_PROVINCE_SEX, PROVINCES, SEXES, type ProvinceSexCell } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Correlation/HeatmapPlot/Scales',
	component: HeatmapPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 420
	},
	argTypes: {
		width: { control: { type: 'range', min: 320, max: 940, step: 20 } },
		height: { control: { type: 'range', min: 280, max: 700, step: 20 } },
		series: { control: false },
		scales: { control: false }
	},
	parameters: {
		docs: { source: { name: 'HeatmapPlot' } }
	}
} satisfies Meta<typeof HeatmapPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * No scale overrides - both X and Y axes are auto-fitted to the data extent.
 */
export const Default: Story = {
	args: {
		series: [
			{
				name: 'life_expectancy',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
			} satisfies Series<ProvinceSexCell>
		]
	}
};

/**
 * With axis labels - human-readable strings appear alongside each axis,
 * making the heatmap more interpretable.
 */
export const WithAxisLabels: Story = {
	args: {
		series: [
			{
				name: 'life_expectancy',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
			} satisfies Series<ProvinceSexCell>
		],
		scales: {
			x: { label: 'Province' },
			y: { label: 'Sex' }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Explicit domain ordering for X axis - ensures provinces appear in the
 * desired order rather than alphabetically. The `domain` array pins the
 * exact order and set of values shown.
 */
export const ExplicitXDomain: Story = {
	args: {
		series: [
			{
				name: 'life_expectancy',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
			} satisfies Series<ProvinceSexCell>
		],
		scales: {
			x: { domain: PROVINCES, label: 'Province' },
			y: { domain: SEXES, label: 'Sex' }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Explicit color domain - pins the colour scale to a fixed `[70, 85]` range
 * instead of auto-fitting to the visible data's min/max. Spreads the colour
 * ramp across the full plausible life-expectancy range, making it easier to
 * read the gradient at a glance rather than always stretching to whichever
 * values happen to be shown.
 */
export const ExplicitColorDomain: Story = {
	args: {
		series: [
			{
				name: 'life_expectancy',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
			} satisfies Series<ProvinceSexCell>
		],
		scales: {
			color: { domain: [70, 85] }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Reversed Y axis - sexes appear bottom-to-top instead of top-to-bottom.
 * Useful for matching reading direction or presentation conventions.
 */
export const ReversedY: Story = {
	args: {
		series: [
			{
				name: 'life_expectancy',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
			} satisfies Series<ProvinceSexCell>
		],
		scales: {
			y: { reverse: true },
			color: { domain: [70, 85] }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Rotated X tick labels - makes province labels more readable when they
 * might otherwise overlap on narrow charts.
 */
export const RotatedXTicks: Story = {
	args: {
		series: [
			{
				name: 'life_expectancy',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
			} satisfies Series<ProvinceSexCell>
		],
		scales: {
			x: { tickRotate: -45 },
			color: { domain: [70, 85] }
		} satisfies AxisBasedScalesConfig
	}
};

/**
 * Combined overrides - labelled axes and explicit domain ordering for both axes.
 */
export const CombinedOverrides: Story = {
	args: {
		series: [
			{
				name: 'life_expectancy',
				x: 'province',
				y: 'sex',
				color: 'value',
				data: LIFE_EXPECTANCY_BY_PROVINCE_SEX
			} satisfies Series<ProvinceSexCell>
		],
		scales: {
			x: { domain: PROVINCES, label: 'Province', tickRotate: -45 },
			y: { domain: SEXES, label: 'Sex' },
			color: { domain: [70, 85] }
		} satisfies AxisBasedScalesConfig
	}
};
