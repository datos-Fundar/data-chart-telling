import type { Meta, StoryObj } from '@storybook/svelte-vite';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE_EXPECTANCY_BY_PROVINCE, LIFE_EXPECTANCY_BY_PROVINCE } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/Ranking/BarPlot/Markers/Rules',
	component: BarPlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 500
	},
	argTypes: {
		width: {
			description: 'Plot width in pixels.',
			control: { type: 'range', min: 300, max: 940, step: 50 }
		},
		height: {
			description: 'Plot height in pixels.',
			control: { type: 'range', min: 200, max: 700, step: 50 }
		},
		series: {
			description: 'Data series to render.',
			control: false,
			table: { type: { summary: 'Series<TData>[]' }, category: 'Data' }
		},
		markers: {
			description: 'Marker annotations.',
			control: false
		}
	},
	parameters: {
		docs: { source: { name: 'BarPlot' } }
	}
} satisfies Meta<typeof BarPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Vertical rule markers (ruleX) to highlight specific provinces on the
 * categorical x axis.
 */
export const WithRuleXMarkers: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			}
		],
		markers: [
			{
				type: 'rule',
				axis: 'x',
				value: 'Córdoba',
				styles: {
					strokeDasharray: '4 4',
					strokeOpacity: 0.7
				}
			},
			{
				type: 'rule',
				axis: 'x',
				value: 'Tucumán',
				styles: {
					strokeDasharray: '4 4',
					strokeOpacity: 0.7
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Horizontal rule markers (ruleY) to highlight threshold values, such as a
 * national average or a policy target.
 */
export const WithRuleYMarkers: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'province',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY_BY_PROVINCE
			}
		],
		markers: [
			{
				type: 'rule',
				axis: 'y',
				value: 82.0,
				styles: {
					strokeDasharray: '6 6',
					strokeOpacity: 0.5
				}
			},
			{
				type: 'rule',
				axis: 'y',
				value: 84.0,
				styles: {
					strokeDasharray: '6 6',
					strokeOpacity: 0.5
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Mixing a vertical and a horizontal marker on the same chart, on grouped
 * data with both sexes.
 */
export const WithMixedMarkers: Story = {
	args: {
		data: LIFE_EXPECTANCY_BY_PROVINCE,
		x: 'province',
		y: 'value',
		color: 'sex',
		markers: [
			{
				type: 'rule',
				axis: 'x',
				value: 'Buenos Aires',
				styles: {
					strokeDasharray: '4 4',
					strokeOpacity: 0.6
				}
			},
			{
				type: 'rule',
				axis: 'y',
				value: 78.7,
				styles: {
					strokeDasharray: '6 6',
					strokeOpacity: 0.5
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};
