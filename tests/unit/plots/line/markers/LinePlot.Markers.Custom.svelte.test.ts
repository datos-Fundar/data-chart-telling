import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { MarkerTransform } from '$lib/types/transforms';
import type { AxisBasedMarkersConfig } from '$lib/types/markers/common';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';
import type { YearPoint } from '../../../../../stories/plots/line/data';
import {
	FEMALE_LIFE_EXPECTANCY,
	MALE_LIFE_EXPECTANCY
} from '../../../../../stories/plots/line/data';
import { waitForSvg, countDotMarks, countTextLabels } from '../../_helpers/svg';

const FEMALE = {
	name: 'female',
	x: 'year' as const,
	y: 'value' as const,
	data: FEMALE_LIFE_EXPECTANCY
};
const MALE = { name: 'male', x: 'year' as const, y: 'value' as const, data: MALE_LIFE_EXPECTANCY };

/** A dot and a label on the series' peak - what a `selectMaxY`/`selectMinY` transform picks. */
function peakMarkers(
	scope: Partial<Pick<AxisBasedMarkersConfig & { type: 'dot' }, 'series' | 'scope'>>,
	select: 'selectMaxY' | 'selectMinY' = 'selectMaxY'
): AxisBasedMarkersConfig[] {
	const transforms: MarkerTransform[] = [{ type: select }];
	const common = { ...scope, x: 'year', y: 'value', transforms };
	return [
		{ type: 'dot', ...common },
		{ type: 'text', ...common, text: select === 'selectMaxY' ? 'Max' : 'Min', styles: { dy: -15 } }
	];
}

const TWO_SEGMENTS: SegmentsConfig<LineSegmentStyle> = {
	female: [
		{ areas: [{ x: { to: 2014 } }], styles: {} },
		{ areas: [{ x: { from: 2014 } }], styles: { stroke: { strokeDasharray: '6 4' } } }
	]
};

describe('LinePlot - markers.custom (component)', () => {
	test('DotMarker places one dot per data point on the target series', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{
					type: 'dot',
					series: 'female',
					x: (d: YearPoint) => d.year,
					y: (d: YearPoint) => d.value
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(FEMALE_LIFE_EXPECTANCY.length);
	});

	test('TextMarker renders one label per data point', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: [
				{
					type: 'text',
					series: 'female',
					x: (d: YearPoint) => d.year,
					y: (d: YearPoint) => d.value,
					text: (d: YearPoint) => String(d.value)
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		expect(countTextLabels(svg)).toBe(FEMALE_LIFE_EXPECTANCY.length);
	});

	test('a component marker scoped to one series does not affect the other', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE, MALE],
			markers: [
				{
					type: 'dot',
					series: 'female',
					x: (d: YearPoint) => d.year,
					y: (d: YearPoint) => d.value
				}
			] satisfies AxisBasedMarkersConfig[]
		});
		const svg = await waitForSvg(container);
		// Only female's points get dots - male has none.
		expect(countDotMarks(svg)).toBe(FEMALE_LIFE_EXPECTANCY.length);
	});

	test('selectMaxY marks the maximum value of the series', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: peakMarkers({ series: 'female' })
		});
		const svg = await waitForSvg(container);
		// One dot + one label for the single peak point.
		expect(countDotMarks(svg)).toBe(1);
		expect(countTextLabels(svg)).toBe(1);
		expect(svg.querySelector('g.text text')?.textContent).toBe('Max');
	});

	test('selectMinY marks the minimum value of the series', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			markers: peakMarkers({ series: 'female' }, 'selectMinY')
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(1);
		expect(svg.querySelector('g.text text')?.textContent).toBe('Min');
	});

	test('scope "segment" marks the peak of each segment', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			segments: TWO_SEGMENTS,
			markers: peakMarkers({ series: 'female', scope: 'segment' })
		});
		const svg = await waitForSvg(container);
		// Two segments → two peaks.
		expect(countDotMarks(svg)).toBe(2);
		expect(countTextLabels(svg)).toBe(2);
	});

	test('a series-scoped peak stays one peak despite the series having segments', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: [FEMALE],
			segments: TWO_SEGMENTS,
			markers: peakMarkers({ series: 'female', scope: 'series' })
		});
		const svg = await waitForSvg(container);
		expect(countDotMarks(svg)).toBe(1);
		expect(countTextLabels(svg)).toBe(1);
	});
});
