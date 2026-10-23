import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import SparklinePlot from '$lib/plots/evolution/sparkline/Plot.svelte';
import { buildLineMarkers } from '$lib/plots/evolution/line/markers';
import { buildGroupedSeries } from '$lib/plots/utils/segments';
import type { Series } from '$lib/types/plots/data/common';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { LineMarkerConfig } from '$lib/types/markers/common';
import { FEMALE_LIFE } from '$datasets';
import { waitForSvg } from '../../_helpers/svg';

const SERIES = [{ name: 'female', x: 'year', y: 'value', data: FEMALE_LIFE }];

/** The path of the one series' line. */
async function linePath(props: Record<string, unknown>, Plot: typeof LinePlot = LinePlot) {
	const { container } = await render(Plot, { width: 400, height: 300, ...props } as never);
	const svg = await waitForSvg(container);
	return svg.querySelector('g.lines path')?.getAttribute('d') ?? '';
}

/** d3's step curves lineTo corners, so every stretch of a stair runs along one axis. */
function isStair(d: string) {
	const points = [...d.matchAll(/(-?[\d.]+),(-?[\d.]+)/g)].map(([, x, y]) => [+x, +y]);
	return (
		points.length > 2 &&
		points.slice(1).every(([x, y], i) => x === points[i][0] || y === points[i][1])
	);
}

describe('LinePlot - curve', () => {
	test('draws straight segments by default', async () => {
		expect(isStair(await linePath({ series: SERIES }))).toBe(false);
	});

	test('styles.curve draws every line as steps', async () => {
		const d = await linePath({ series: SERIES, styles: { curve: 'step-after' } });
		expect(isStair(d)).toBe(true);
	});

	test('step-before and step-after draw different stairs', async () => {
		const before = await linePath({ series: SERIES, styles: { curve: 'step-before' } });
		const after = await linePath({ series: SERIES, styles: { curve: 'step-after' } });
		expect(before).not.toBe(after);
	});

	test('a segment curve steps only its own stretch', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: SERIES,
			segments: {
				female: [{ areas: [{ x: { from: 1991 } }], styles: { curve: 'step-after' } }]
			}
		});
		const svg = await waitForSvg(container);
		const paths = [...svg.querySelectorAll('g.lines path')].map((p) => p.getAttribute('d') ?? '');
		expect(paths.some(isStair)).toBe(true);
		expect(paths.some((p) => !isStair(p))).toBe(true);
	});

	test('a segment curve wins over styles.curve', async () => {
		const { container } = await render(LinePlot, {
			width: 400,
			height: 300,
			series: SERIES,
			styles: { curve: 'step-after' },
			segments: { female: [{ styles: { curve: 'linear' } }] }
		});
		const svg = await waitForSvg(container);
		const paths = [...svg.querySelectorAll('g.lines path')].map((p) => p.getAttribute('d') ?? '');
		expect(paths.some(isStair)).toBe(false);
	});

	test('the line family takes styles.curve too', async () => {
		const props = {
			data: FEMALE_LIFE,
			x: 'year',
			y: 'value',
			styles: { curve: 'step' }
		};
		expect(isStair(await linePath(props, SparklinePlot as never))).toBe(true);
		expect(isStair(await linePath(props, SlopePlot as never))).toBe(true);
	});
});

describe('buildLineMarkers - curve', () => {
	type Row = { x: number; y: number };
	const series: Series<Row> = { name: 'a', x: 'x', y: 'y', data: [{ x: 1, y: 10 }] };
	const build = (segments: Record<string, { styles: LineSegmentStyle }[]>, curve?: 'step') =>
		buildLineMarkers<Row>({
			groupedSeries: buildGroupedSeries<Series<Row>, LineSegmentStyle>([series], segments),
			colorFor: () => 'blue',
			disabledStrokeFor: () => undefined,
			disabledDotsFor: () => undefined,
			curve
		}) as LineMarkerConfig[];

	test('has no curve unless one is given', () => {
		expect(build({})[0].curve).toBeUndefined();
	});

	test('takes the plot curve', () => {
		expect(build({}, 'step')[0].curve).toBe('step');
	});

	test('prefers the segment curve', () => {
		expect(build({ default: [{ styles: { curve: 'basis' } }] }, 'step')[0].curve).toBe('basis');
	});
});
