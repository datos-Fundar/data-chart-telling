import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE_EXPECTANCY, LIFE_EXPECTANCY } from '../data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Plots/LinePlot/Markers/Rules',
	component: LinePlot,
	tags: ['autodocs'],
	args: {
		width: 940,
		height: 400
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
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/**
 * Vertical rule markers (ruleX) to highlight specific years.
 */
export const WithRuleXMarkers: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		],
		markers: [
			{
				type: 'rule',
				axis: 'x',
				value: 2014,
				styles: {
					strokeDasharray: '4 4',
					strokeOpacity: 0.7
				}
			},
			{
				type: 'rule',
				axis: 'x',
				value: 2018,
				styles: {
					strokeDasharray: '4 4',
					strokeOpacity: 0.7
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Horizontal rule markers (ruleY) to highlight threshold values.
 */
export const WithRuleYMarkers: Story = {
	args: {
		series: [
			{
				name: 'female',
				x: 'year',
				y: 'value',
				data: FEMALE_LIFE_EXPECTANCY
			}
		],
		markers: [
			{
				type: 'rule',
				axis: 'y',
				value: 81.0,
				styles: {
					strokeDasharray: '6 6',
					strokeOpacity: 0.5
				}
			},
			{
				type: 'rule',
				axis: 'y',
				value: 83.7,
				styles: {
					strokeDasharray: '6 6',
					strokeOpacity: 0.5
				}
			}
		] satisfies AxisBasedMarkersConfig[]
	}
};

/**
 * Mixing vertical and horizontal markers on the same chart.
 */
export const WithMixedMarkers: Story = {
	args: {
		data: LIFE_EXPECTANCY,
		x: 'year',
		y: 'value',
		color: 'sex',
		markers: [
			{
				type: 'rule',
				axis: 'x',
				value: 2018,
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
