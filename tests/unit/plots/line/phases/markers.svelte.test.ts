import { describe, test, expect } from 'vitest';
import { buildLineMarkers, buildMarkers } from '$lib/plots/line/phases/markers';
import { buildGroupedSeries } from '$lib/plots/utils/segments';
import type { LinePlotState, LinePlotCtx } from '$lib/types/plots/line/state';
import type { Series } from '$lib/types/plots/data/common';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { LineMarkerConfig } from '$lib/types/markers/common';
import type { ChartConfig } from '$lib/types/configuration/styling';

// ── buildLineMarkers ───────────────────────────────────────────────────────────

type Row = { x: number; y: number };

const DATA: Row[] = [{ x: 1, y: 10 }];
const SERIES: Series<Row> = { name: 'a', x: 'x', y: 'y', data: DATA };

function buildLine(overrides: Partial<Parameters<typeof buildLineMarkers<Row>>[0]> = {}) {
	return buildLineMarkers<Row>({
		groupedSeries: buildGroupedSeries<Series<Row>, LineSegmentStyle>([SERIES], {}),
		colorFor: () => 'blue',
		disabledStrokeFor: () => undefined,
		disabledDotsFor: () => undefined,
		...overrides
	});
}

describe('buildLineMarkers – geometry', () => {
	test('emits one line marker per visual segment', () => {
		const markers = buildLine();
		expect(markers).toHaveLength(1);
		expect(markers[0].type).toBe('line');
	});

	test('emits no dot marker when the segment has no style.dots', () => {
		const markers = buildLine();
		expect(markers.some((m) => m.type === 'dot')).toBe(false);
	});

	test('emits a dot marker right after the line one when style.dots is set', () => {
		const groupedSeries = buildGroupedSeries<Series<{ x: number; y: number }>, LineSegmentStyle>(
			[SERIES],
			{ default: [{ styles: { dots: {} } }] }
		);
		const markers = buildLine({ groupedSeries });
		expect(markers.map((m) => m.type)).toEqual(['line', 'dot']);
	});
});

describe('buildLineMarkers – style resolution', () => {
	test('falls back to the default color when a segment has no stroke of its own', () => {
		const [marker] = buildLine({ colorFor: () => 'green' }) as [LineMarkerConfig];
		expect(marker.styles?.stroke).toBe('green');
	});

	test('a disabled-stroke override wins over the segment/default color', () => {
		const [marker] = buildLine({
			disabledStrokeFor: () => ({ stroke: 'gray', strokeOpacity: 0.3 })
		}) as [LineMarkerConfig];
		expect(marker.styles?.stroke).toBe('gray');
		expect(marker.styles?.strokeOpacity).toBe(0.3);
	});
});

// ── buildMarkers (the real phase, combining line + gap markers) ──────────────

const CTX: LinePlotCtx = { cfg: { line: {} } as ChartConfig, legendInteraction: undefined };

function buildPhase(overrides: Partial<LinePlotState<{ x: number; y: number | null }>> = {}) {
	const groupedSeries = buildGroupedSeries<
		Series<{ x: number; y: number | null }>,
		LineSegmentStyle
	>([SERIES as Series<{ x: number; y: number | null }>], {});
	const state: LinePlotState<{ x: number; y: number | null }> = {
		segments: {},
		gaps: {},
		scales: {},
		width: 400,
		height: 300,
		resolvedSeries: [SERIES as Series<{ x: number; y: number | null }>],
		groupedSeries,
		colorForSeries: () => 'blue',
		...overrides
	};
	return buildMarkers(state, CTX).markers!;
}

describe('buildMarkers – combines line and gap markers', () => {
	test('with no gaps, returns only the real line marker(s)', () => {
		const markers = buildPhase();
		expect(markers).toHaveLength(1);
		expect(markers[0].type).toBe('line');
	});

	test('a configured gap run adds its own bridge line marker on top', () => {
		const withGap = {
			name: 'a',
			x: 'x',
			y: 'y',
			data: [
				{ x: 1, y: 0 },
				{ x: 2, y: null },
				{ x: 3, y: 10 }
			]
		};
		const groupedSeries = buildGroupedSeries<
			Series<{ x: number; y: number | null }>,
			LineSegmentStyle
		>([withGap as Series<{ x: number; y: number | null }>], {});
		const markers = buildPhase({
			resolvedSeries: [withGap as Series<{ x: number; y: number | null }>],
			groupedSeries,
			gaps: { default: { middle: {} } }
		});
		const lines = markers.filter((m): m is LineMarkerConfig => m.type === 'line');
		expect(lines).toHaveLength(2);
	});
});
