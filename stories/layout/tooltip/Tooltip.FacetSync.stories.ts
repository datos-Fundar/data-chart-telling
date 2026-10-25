import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import TooltipSyncDemo, { pyramidData } from './TooltipSyncDemo.svelte';
import FacetSyncBarBySeriesDemo from './FacetSyncBarBySeriesDemo.svelte';
import FacetSyncBarUnrelatedOrderDemo, {
	UNRELATED_SORT_DATA,
	type GroupValue
} from './FacetSyncBarUnrelatedOrderDemo.svelte';
import { renderSource } from '../../common/docsSource';
import {
	ARGENTINA_CHILE_TRENDS,
	type CountryTrendRow,
	AGE_GROUPS,
	AGE_SHARES,
	PENGUIN_COUNTS_BY_SEX,
	POPULATION_BY_BROAD_AGE,
	type AgeRow
} from '$datasets';

/** `tooltip.sync: true` broadcasts the hover to every faceted panel with a match. */
const meta = {
	title: 'Layout/Tooltip/FacetSync',
	component: LinePlot,
	tags: ['autodocs'],
	args: { width: 680, height: 400, data: ARGENTINA_CHILE_TRENDS, x: 'year', y: 'value' },
	argTypes: {
		width: { control: false },
		height: { control: false },
		data: { control: false },
		x: { control: false },
		y: { control: false },
		color: { control: false },
		facet: { control: false },
		tooltip: { control: false }
	},
	parameters: {
		docs: { source: { name: 'LinePlot' } }
	}
} satisfies Meta<typeof LinePlot>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * With `sync: true`, hovering one facet shows the tooltip in every synced
 * facet with a match. A non-cursor facet reprojects the cursor's relative
 * position onto its own box.
 */
export const MultiFacetBroadcast: Story = {
	args: {
		title: 'Tooltip on every synced facet',
		subtitle: 'Hover over one country - the other also shows its tooltip',
		color: 'metric' as keyof CountryTrendRow,
		facet: { by: 'country' as keyof CountryTrendRow, columns: 2 },
		tooltip: { strategy: 'x', sync: true },
		markers: [{ type: 'hover' }]
	}
};

/** Faceted line chart - switch strategy and sync, hover across panels. */
export const FacetSyncLine: StoryObj = {
	render: () => ({ Component: TooltipSyncDemo, props: { kind: 'line' } }),
	parameters: {
		docs: {
			source: {
				code: renderSource('LinePlot', {
					title: 'GDP per capita vs. population by country',
					subtitle: 'Strategy: x · Sync: on',
					data: ARGENTINA_CHILE_TRENDS,
					x: 'year',
					y: 'value',
					color: 'metric',
					legend: [
						{
							type: 'discrete',
							title: 'Indicator',
							columns: 2,
							items: [
								{ name: 'GDP per capita', symbol: 'line' },
								{ name: 'Population', symbol: 'line' }
							]
						}
					],
					facet: { by: 'country', columns: 2 },
					tooltip: { strategy: 'x', sync: true },
					markers: [{ type: 'hover' }]
				})
			}
		}
	}
};

/** Faceted bar chart - `x` strategy highlights the same age group across years. */
export const FacetSyncBar: StoryObj = {
	render: () => ({ Component: TooltipSyncDemo, props: { kind: 'bar' } }),
	parameters: {
		docs: {
			source: {
				code: renderSource('BarPlot', {
					title: 'Population share by age group and year',
					subtitle: 'Strategy: x · Sync: on',
					data: AGE_SHARES,
					x: 'ageGroup',
					y: 'share',
					facet: { by: 'year', columns: 2 },
					tooltip: { strategy: 'x', sync: true },
					markers: [{ type: 'hover' }]
				})
			}
		}
	}
};

/**
 * Faceted by census - `'series'` syncs by sex instead of
 * x/y. Toggle layout (stacked/grouped) and orientation to try every combo.
 */
export const FacetSyncBarBySeries: StoryObj = {
	render: () => ({ Component: FacetSyncBarBySeriesDemo }),
	parameters: {
		docs: {
			source: {
				code: renderSource('BarPlot', {
					title: 'Population share by sex, faceted by census',
					subtitle: 'Strategy: series · Sync: on',
					data: POPULATION_BY_BROAD_AGE.filter((d) => d.year === 1991 || d.year === 2022),
					x: 'ageGroup',
					y: 'share',
					color: 'sex',
					transforms: [{ type: 'stackY' as const }],
					facet: { by: 'year', columns: 2 },
					tooltip: {
						strategy: 'series',
						sync: true,
						format: (row: AgeRow) => `${row.sex}: ${row.share}%`
					},
					markers: [{ type: 'hover' }]
				})
			}
		}
	}
};

/** Faceted heatmap - `punctual` strategy highlights the same cell in every sex. */
export const FacetSyncHeatmap: StoryObj = {
	render: () => ({ Component: TooltipSyncDemo, props: { kind: 'heatmap' } }),
	parameters: {
		docs: {
			source: {
				code: renderSource('HeatmapPlot', {
					title: 'Penguins by island and species',
					subtitle: 'Strategy: punctual · Sync: on',
					data: PENGUIN_COUNTS_BY_SEX,
					x: 'island',
					y: 'species',
					color: 'count',
					scales: { x: { label: 'Island' }, y: { label: 'Species' } },
					styles: { values: { show: false, format: (v: number) => `${v}` } },
					facet: { by: 'sex', columns: 2 },
					tooltip: { strategy: 'punctual', sync: true },
					markers: [{ type: 'hover' }]
				})
			}
		}
	}
};

/**
 * Faceted bar chart where each facet sorts its own bars by value, giving
 * `Group 1`/`Group 2` two unrelated orderings. The tooltip lands on the row
 * that actually matched in the other facet, wherever it sits there.
 */
export const FacetSyncBarUnrelatedOrder: StoryObj = {
	render: () => ({ Component: FacetSyncBarUnrelatedOrderDemo }),
	parameters: {
		docs: {
			source: {
				code: renderSource('BarPlot', {
					title: 'Value by category, two unrelated groups',
					subtitle: 'Strategy: y · Sync: on - each facet sorted by its own value',
					data: UNRELATED_SORT_DATA,
					x: 'value',
					y: 'category',
					scales: {
						y: { sort: (a: GroupValue, b: GroupValue) => a.value - b.value }
					},
					facet: { by: 'group', columns: 2, scales: 'free-y' },
					tooltip: {
						strategy: 'y',
						sync: true,
						format: (row: GroupValue) => `${row.category}: ${row.value}`
					},
					markers: [{ type: 'hover' }]
				})
			}
		}
	}
};

/** Faceted pyramid - `y` strategy highlights the same age group across years. */
export const FacetSyncPyramid: StoryObj = {
	render: () => ({ Component: TooltipSyncDemo, props: { kind: 'pyramid' } }),
	parameters: {
		docs: {
			source: {
				code: renderSource('PyramidPlot', {
					title: 'Population pyramid by year',
					subtitle: 'Strategy: y · Sync: on',
					data: pyramidData,
					y: 'ageGroup',
					x: 'share',
					color: 'sex',
					scales: {
						y: { domain: AGE_GROUPS },
						color: { scheme: { Female: '#d6336c', Male: '#1971c2' } }
					},
					styles: {
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
