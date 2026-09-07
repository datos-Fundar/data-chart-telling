import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LineChart from '$lib/charts/line/Chart.svelte';
import TooltipSyncDemo, { heatData, pyramidData } from './TooltipSyncDemo.svelte';
import { renderSource } from '../../common/docsSource';
import { TIME_SERIES, type SeriesPoint } from '../../data/time-series';
import { REGION_BARS } from '../../data/region-bars';
import { AGE_GROUPS } from '../../data/population-pyramid';

/** `tooltip.sync: true` broadcasts the hover to every faceted panel with a match. */
const meta = {
	title: 'Layout/Tooltip/FacetSync',
	component: LineChart,
	tags: ['autodocs'],
	args: { width: 680, height: 440, data: TIME_SERIES, x: 'year', y: 'value' },
	argTypes: {
		width: { control: false },
		height: { control: false },
		data: { control: false },
		x: { control: false },
		y: { control: false },
		z: { control: false },
		facet: { control: false },
		tooltip: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LineChart' } }
	}
} satisfies Meta<typeof LineChart>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * With `sync: true`, hovering one facet shows the tooltip in every synced
 * facet with a match. A non-cursor facet reprojects the cursor's relative
 * position onto its own box.
 */
export const MultiFacetBroadcast: Story = {
	args: {
		title: 'Tooltip en cada faceta sincronizada',
		subtitle: 'Pasá el cursor por una región — la otra también muestra su tooltip',
		z: 'metric' as keyof SeriesPoint,
		facet: { by: 'region' as keyof SeriesPoint, columns: 2 },
		tooltip: { strategy: 'x', sync: true },
		markers: [{ type: 'hover' }]
	}
};

/** Faceted line chart — switch strategy and sync, hover across panels. */
export const FacetSyncLine: StoryObj = {
	render: () => ({ Component: TooltipSyncDemo, props: { kind: 'line' } }),
	parameters: {
		docs: {
			source: {
				code: renderSource('LineChart', {
					title: 'PBI vs. Empleo por región',
					subtitle: 'Strategy: x · Sync: on',
					data: TIME_SERIES,
					x: 'year',
					y: 'value',
					z: 'metric',
					legend: [
						{
							type: 'discrete',
							title: 'Indicador',
							columns: 2,
							items: [
								{ name: 'PBI', symbol: 'line' },
								{ name: 'Empleo', symbol: 'line' }
							]
						}
					],
					facet: { by: 'region', columns: 2 },
					tooltip: { strategy: 'x', sync: true },
					markers: [{ type: 'hover' }]
				})
			}
		}
	}
};

/** Faceted bar chart — `x` strategy highlights the same region across years. */
export const FacetSyncBar: StoryObj = {
	render: () => ({ Component: TooltipSyncDemo, props: { kind: 'bar' } }),
	parameters: {
		docs: {
			source: {
				code: renderSource('BarChart', {
					title: 'Valor por región y año',
					subtitle: 'Strategy: x · Sync: on',
					data: REGION_BARS,
					x: 'region',
					y: 'value',
					facet: { by: 'year', columns: 3 },
					tooltip: { strategy: 'x', sync: true },
					markers: [{ type: 'hover' }]
				})
			}
		}
	}
};

/** Faceted heatmap — `punctual` strategy highlights the same cell in every scenario. */
export const FacetSyncHeatmap: StoryObj = {
	render: () => ({ Component: TooltipSyncDemo, props: { kind: 'heatmap' } }),
	parameters: {
		docs: {
			source: {
				code: renderSource('HeatmapChart', {
					title: 'Hogares por ambientes (2022)',
					subtitle: 'Strategy: punctual · Sync: on',
					data: heatData,
					x: 'rooms',
					y: 'people',
					z: 'pct',
					scales: { x: { label: 'Ambientes' }, y: { label: 'Personas' } },
					styles: { values: { show: false, format: (v: number) => `${(v * 100).toFixed(0)}%` } },
					facet: { by: 'scenario', columns: 2 },
					tooltip: { strategy: 'punctual', sync: true },
					markers: [{ type: 'hover' }]
				})
			}
		}
	}
};

/** Faceted pyramid — `y` strategy highlights the same age group across years. */
export const FacetSyncPyramid: StoryObj = {
	render: () => ({ Component: TooltipSyncDemo, props: { kind: 'pyramid' } }),
	parameters: {
		docs: {
			source: {
				code: renderSource('PyramidChart', {
					title: 'Pirámide poblacional por año',
					subtitle: 'Strategy: y · Sync: on',
					data: pyramidData,
					y: 'ageGroup',
					x: 'pct',
					z: 'sex',
					scales: { y: { domain: AGE_GROUPS } },
					styles: {
						colors: { left: '#d6336c', right: '#1971c2' },
						values: { format: (v: number) => `${v.toFixed(1)}%` }
					},
					facet: { by: 'year', columns: 2 },
					tooltip: { strategy: 'y', sync: true },
					markers: [{ type: 'hover' }]
				})
			}
		}
	}
};
