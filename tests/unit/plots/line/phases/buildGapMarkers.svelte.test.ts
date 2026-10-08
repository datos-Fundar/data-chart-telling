import { describe, test, expect } from 'vitest';
import { buildGapMarkers } from '$lib/plots/line/phases/markers';
import type { Series } from '$lib/types/plots/data/common';
import type { GapsConfig } from '$lib/types/plots/gaps';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { LineMarkerConfig, DotMarkerConfig } from '$lib/types/markers/common';

// `buildGapMarkers` pulls `getConfiguration()` from `config.svelte.ts` (a
// module-level `$state`), which needs the Svelte compiler - hence this file's
// `.svelte.test.ts` suffix (routes it into the browser project) even though
// it never renders a component. See the "vitest *.svelte.test.ts suffix" note.

const DATA: { x: number; y: number | null }[] = [
	{ x: 1, y: 10 },
	{ x: 2, y: null },
	{ x: 3, y: 30 }
];
const SERIES: Series<{ x: number; y: number | null }> = {
	name: 'female',
	x: 'x',
	y: 'y',
	data: DATA
};
const GAPS: GapsConfig<LineSegmentStyle> = { default: { middle: { style: { dots: {} } } } };

function build(disabledStroke?: object, disabledDots?: object) {
	return buildGapMarkers({
		seriesList: [SERIES],
		gaps: GAPS,
		colorFor: () => '#111111',
		disabledStrokeFor: () => disabledStroke,
		disabledDotsFor: () => disabledDots
	});
}

describe('buildGapMarkers - disabled overrides (legend/hover-isolate dimming)', () => {
	test('with no override, the bridge line uses the series color and the gap default opacity', () => {
		const markers = build();
		const line = markers.find((m) => m.type === 'line') as LineMarkerConfig;
		expect(line.styles?.stroke).toBe('#111111');
		// cfg.line.gap.stroke.strokeOpacity default.
		expect(line.styles?.strokeOpacity).toBe(0.6);
	});

	test('a disabled-stroke override dims the bridge line, same as it dims the real line', () => {
		const markers = build({ strokeOpacity: 0.12 });
		const line = markers.find((m) => m.type === 'line') as LineMarkerConfig;
		expect(line.styles?.strokeOpacity).toBe(0.12);
		// Only opacity was overridden - color still falls through to the series default.
		expect(line.styles?.stroke).toBe('#111111');
	});

	test("a disabled-stroke override wins over the gap zone's own stroke style", () => {
		const markers = buildGapMarkers({
			seriesList: [SERIES],
			gaps: { default: { middle: { style: { stroke: { stroke: '#16a34a' } } } } },
			colorFor: () => '#111111',
			disabledStrokeFor: () => ({ stroke: '#dc2626', strokeOpacity: 0.12 }),
			disabledDotsFor: () => undefined
		});
		const line = markers.find((m) => m.type === 'line') as LineMarkerConfig;
		expect(line.styles?.stroke).toBe('#dc2626');
		expect(line.styles?.strokeOpacity).toBe(0.12);
	});

	test('with no override, a bridge endpoint dot uses full opacity (the gap dot default)', () => {
		const markers = build();
		const dot = markers.find((m) => m.type === 'dot') as DotMarkerConfig;
		expect(dot.styles?.dotFillOpacity).toBe(1);
		expect(dot.styles?.dotStrokeOpacity).toBe(1);
	});

	test('a disabled-dots override dims a bridge endpoint dot, same as it dims a real dot', () => {
		const markers = build(undefined, { dotFillOpacity: 0.12, dotStrokeOpacity: 0.12 });
		const dot = markers.find((m) => m.type === 'dot') as DotMarkerConfig;
		expect(dot.styles?.dotFillOpacity).toBe(0.12);
		expect(dot.styles?.dotStrokeOpacity).toBe(0.12);
	});

	test("an undisabled series in the same call is unaffected by another series' override", () => {
		const other: Series<{ x: number; y: number | null }> = {
			name: 'male',
			x: 'x',
			y: 'y',
			data: DATA
		};
		const markers = buildGapMarkers({
			seriesList: [SERIES, other],
			gaps: GAPS,
			colorFor: (i) => (i === 0 ? '#111111' : '#222222'),
			disabledStrokeFor: (name) => (name === 'female' ? { strokeOpacity: 0.12 } : undefined),
			disabledDotsFor: () => undefined
		});
		const lines = markers.filter((m) => m.type === 'line') as LineMarkerConfig[];
		expect(lines[0].styles?.strokeOpacity).toBe(0.12);
		expect(lines[1].styles?.strokeOpacity).toBe(0.6);
	});
});
