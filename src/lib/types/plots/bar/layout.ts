import type { AxisValue } from '$lib/types/layout/scales';

export type BarSeriesLayout = 'overlap' | 'grouped' | 'stacked';

export type BarLayout = {
	layout: BarSeriesLayout;
	valueBaseline: number;
	estimatedBandwidth: number;
	seriesCount: number;
	seriesStep: number;
	seriesGap: number;
	stackedBaseline: (category: AxisValue, seriesIndex: number) => number;
	groupOffset: (seriesIndex: number) => { dx: number; dy: number };
	groupInsetFraction: (seriesIndex: number) => { start: number; end: number };
};
