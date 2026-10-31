import { describe, test, expect, vi, afterEach } from 'vitest';
import { buildGroupedSeries, validateSegments } from '$lib/plots/utils/segments';
import type { Series } from '$lib/types/plots/data/common';
import type { LineSegmentStyle } from '$lib/types/plots/segments/common';
import type { SegmentsConfig } from '$lib/types/plots/props';

// ── Shared fixtures ───────────────────────────────────────────────────────────

type P = { x: number; y: number };

const DATA: P[] = [
	{ x: 1, y: 10 },
	{ x: 2, y: 20 },
	{ x: 3, y: 30 },
	{ x: 4, y: 40 },
	{ x: 5, y: 50 }
];

const SERIES: Series<P> = { name: 'a', x: 'x', y: 'y', data: DATA };
const SERIES_B: Series<P> = { name: 'b', x: 'x', y: 'y', data: DATA };

afterEach(() => vi.restoreAllMocks());

// ── No segments ───────────────────────────────────────────────────────────────

describe('buildGroupedSeries - no segments', () => {
	test('returns one group per series', () => {
		const groups = buildGroupedSeries([SERIES], {});
		expect(groups).toHaveLength(1);
		expect(groups[0].series).toBe(SERIES);
	});

	test('whole dataset in a single visual segment', () => {
		const groups = buildGroupedSeries([SERIES], {});
		expect(groups[0].visualSegments).toHaveLength(1);
		expect(groups[0].visualSegments[0].data).toEqual(DATA);
	});

	test('style defaults to empty object', () => {
		const groups = buildGroupedSeries([SERIES], {});
		expect(groups[0].visualSegments[0].styles).toEqual({});
	});

	test('empty series entry behaves as no segments', () => {
		const groups = buildGroupedSeries([SERIES], { a: [] });
		expect(groups[0].visualSegments[0].data).toEqual(DATA);
	});
});

// ── Area filtering ─────────────────────────────────────────────────────────────

describe('buildGroupedSeries - area filtering', () => {
	// Find the user-segment (area match) that contains a given x value.
	const userSegWith = (groups: ReturnType<typeof buildGroupedSeries<Series<P>>>, x: number) =>
		groups[0].visualSegments.find((s) => s.data.some((d) => d.x === x));

	test('open-end range: no `from` matches x ≤ to (inclusive)', () => {
		const groups = buildGroupedSeries([SERIES], { a: [{ areas: [{ x: { to: 3 } }] }] });
		const seg = userSegWith(groups, 1);
		expect(seg?.data.map((d) => d.x)).toEqual([1, 2, 3]);
	});

	test('open-start range: no `to` matches x ≥ from (inclusive)', () => {
		const groups = buildGroupedSeries([SERIES], { a: [{ areas: [{ x: { from: 3 } }] }] });
		const seg = userSegWith(groups, 5);
		expect(seg?.data.map((d) => d.x)).toEqual([3, 4, 5]);
	});

	test('closed range [from, to] filters both ends inclusively', () => {
		const groups = buildGroupedSeries([SERIES], { a: [{ areas: [{ x: { from: 2, to: 4 } }] }] });
		const seg = userSegWith(groups, 3);
		expect(seg?.data.map((d) => d.x)).toEqual([2, 3, 4]);
	});

	test('range wider than data returns all data', () => {
		const groups = buildGroupedSeries([SERIES], { a: [{ areas: [{ x: { from: 0, to: 99 } }] }] });
		const seg = userSegWith(groups, 1);
		expect(seg?.data).toEqual(DATA);
	});

	test('area matching no data: all points fall to default (unmatched) styling', () => {
		const groups = buildGroupedSeries([SERIES], { a: [{ areas: [{ x: { from: 10, to: 20 } }] }] });
		// All data is unmatched → one defaultVisual segment with all points and empty style.
		expect(groups[0].visualSegments).toHaveLength(1);
		expect(groups[0].visualSegments[0].data).toEqual(DATA);
		expect(groups[0].visualSegments[0].styles).toEqual({});
	});
});

// ── Segment continuity ─────────────────────────────────────────────────────────

describe('buildGroupedSeries - segment continuity', () => {
	test('adjacent area segments have a 2-point connector that bridges the gap', () => {
		const segments: SegmentsConfig<LineSegmentStyle> = {
			a: [
				{ areas: [{ x: { to: 3 } }], styles: { stroke: { stroke: 'red' } } },
				{ areas: [{ x: { from: 3 } }], styles: { stroke: { stroke: 'blue' } } }
			]
		};
		const groups = buildGroupedSeries([SERIES], segments);
		// The connector bridges run0.last (x=3) → run1.first (x=4).
		const connector = groups[0].visualSegments.find(
			(s) => s.data.length === 2 && s.data[0].x === 3 && s.data[1].x === 4
		);
		expect(connector).toBeDefined();
	});
});

// ── Style pass-through ─────────────────────────────────────────────────────────

describe('buildGroupedSeries - style pass-through', () => {
	test('area segment style is passed through to the visual segment', () => {
		const style: LineSegmentStyle = { stroke: { stroke: '#ff0000', strokeWidth: 3 } };
		const groups = buildGroupedSeries([SERIES], {
			a: [{ areas: [{ x: { from: 1, to: 5 } }], styles: style }]
		});
		const seg = groups[0].visualSegments.find((s) => s.data.some((d) => d.x === 3));
		expect(seg?.styles).toEqual(style);
	});

	test('missing style defaults to empty object', () => {
		const groups = buildGroupedSeries([SERIES], { a: [{ areas: [{ x: { from: 2, to: 4 } }] }] });
		const seg = groups[0].visualSegments.find((s) => s.data.some((d) => d.x === 3));
		expect(seg?.styles).toEqual({});
	});

	test('different area segments can have different styles', () => {
		const segments: SegmentsConfig<LineSegmentStyle> = {
			a: [
				{ areas: [{ x: { to: 2 } }], styles: { stroke: { stroke: 'red' } } },
				{ areas: [{ x: { from: 4 } }], styles: { stroke: { stroke: 'blue' } } }
			]
		};
		const groups = buildGroupedSeries([SERIES], segments);
		expect(groups[0].visualSegments.find((s) => s.styles.stroke?.stroke === 'red')).toBeDefined();
		expect(groups[0].visualSegments.find((s) => s.styles.stroke?.stroke === 'blue')).toBeDefined();
	});
});

// ── Multiple series ────────────────────────────────────────────────────────────

describe('buildGroupedSeries - multiple series', () => {
	test('returns one group per series in the same order', () => {
		const groups = buildGroupedSeries([SERIES, SERIES_B], {});
		expect(groups[0].series.name).toBe('a');
		expect(groups[1].series.name).toBe('b');
	});

	test('segments are applied per series independently', () => {
		const groups = buildGroupedSeries([SERIES, SERIES_B], { a: [{ areas: [{ x: { to: 2 } }] }] });
		// series 'a': has a segment for x ≤ 2
		const aSeg = groups[0].visualSegments.find((s) => s.data.every((d) => d.x <= 2));
		expect(aSeg?.data.map((d) => d.x)).toEqual([1, 2]);
		// series 'b': no entry → whole data in one segment
		expect(groups[1].visualSegments[0].data).toEqual(DATA);
	});
});

// ── Function accessor ──────────────────────────────────────────────────────────

describe('buildGroupedSeries - function accessor', () => {
	test('function accessor for x is supported', () => {
		const s: Series<P> = { name: 'fn', x: (d) => d.x, y: (d) => d.y, data: DATA };
		const groups = buildGroupedSeries([s], { fn: [{ areas: [{ x: { from: 3 } }] }] });
		const seg = groups[0].visualSegments.find((s) => s.data.some((d) => d.x === 5));
		expect(seg?.data.map((d) => d.x)).toEqual([3, 4, 5]);
	});
});

// ── Catch-all style merging ────────────────────────────────────────────────────

describe('buildGroupedSeries - catch-all style merging', () => {
	test('area segment with dots-only inherits stroke from catch-all', () => {
		const segments: SegmentsConfig<LineSegmentStyle> = {
			a: [
				{ styles: { stroke: { stroke: 'red' } } }, // catch-all
				{ areas: [{ x: { from: 2, to: 4 } }], styles: { dots: { dotRadius: 5 } } } // dots only
			]
		};
		const groups = buildGroupedSeries([SERIES], segments);
		const areaSeg = groups[0].visualSegments.find(
			(s) => s.data.some((d) => d.x === 3) && s.styles.dots !== undefined
		);
		expect(areaSeg?.styles.stroke?.stroke).toBe('red');
		expect(areaSeg?.styles.dots?.dotRadius).toBe(5);
	});

	test('area segment stroke overrides catch-all stroke', () => {
		const segments: SegmentsConfig<LineSegmentStyle> = {
			a: [
				{ styles: { stroke: { stroke: 'yellow' } } }, // catch-all
				{ areas: [{ x: { from: 2, to: 4 } }], styles: { stroke: { stroke: 'blue' } } } // override
			]
		};
		const groups = buildGroupedSeries([SERIES], segments);
		const areaSeg = groups[0].visualSegments.find((s) => s.data.some((d) => d.x === 3));
		expect(areaSeg?.styles.stroke?.stroke).toBe('blue');
	});

	test('catch-all run uses catch-all style directly (no double-merging)', () => {
		const segments: SegmentsConfig<LineSegmentStyle> = {
			a: [
				{ styles: { stroke: { stroke: 'red' } } }, // catch-all
				{ areas: [{ x: { from: 2, to: 4 } }], styles: { dots: { dotRadius: 5 } } }
			]
		};
		const groups = buildGroupedSeries([SERIES], segments);
		// x=1 and x=5 fall outside the area → they match the catch-all directly.
		const catchAllSeg = groups[0].visualSegments.find((s) => s.data.some((d) => d.x === 1));
		expect(catchAllSeg?.styles).toEqual({ stroke: { stroke: 'red' } });
	});

	test('no catch-all → area segment style is used unchanged', () => {
		const segments: SegmentsConfig<LineSegmentStyle> = {
			a: [{ areas: [{ x: { from: 2, to: 4 } }], styles: { dots: { dotRadius: 5 } } }]
		};
		const groups = buildGroupedSeries([SERIES], segments);
		const areaSeg = groups[0].visualSegments.find((s) => s.data.some((d) => d.x === 3));
		expect(areaSeg?.styles).toEqual({ dots: { dotRadius: 5 } });
	});

	test('default key catch-all merges into area segments for all series', () => {
		const segments: SegmentsConfig<LineSegmentStyle> = {
			default: [
				{ styles: { stroke: { stroke: 'green' } } }, // default catch-all
				{ areas: [{ x: { from: 2, to: 4 } }], styles: { dots: { dotRadius: 8 } } }
			]
		};
		const groups = buildGroupedSeries([SERIES, SERIES_B], segments);
		for (const group of groups) {
			const areaSeg = group.visualSegments.find(
				(s) => s.data.some((d) => d.x === 3) && s.styles.dots !== undefined
			);
			expect(areaSeg?.styles.stroke?.stroke).toBe('green');
			expect(areaSeg?.styles.dots?.dotRadius).toBe(8);
		}
	});

	test('series catch-all merges with default area segment', () => {
		const segments: SegmentsConfig<LineSegmentStyle> = {
			a: [{ styles: { stroke: { stroke: 'tomato' } } }],
			default: [{ areas: [{ x: { from: 2, to: 4 } }], styles: { dots: { dotRadius: 6 } } }]
		};
		const groups = buildGroupedSeries([SERIES], segments);
		const areaSeg = groups[0].visualSegments.find(
			(s) => s.data.some((d) => d.x === 3) && s.styles.dots !== undefined
		);
		expect(areaSeg?.styles.stroke?.stroke).toBe('tomato');
		expect(areaSeg?.styles.dots?.dotRadius).toBe(6);
	});

	test('area dots key replaces catch-all dots key entirely', () => {
		const segments: SegmentsConfig<LineSegmentStyle> = {
			a: [
				{ styles: { stroke: { stroke: 'purple' }, dots: { dotRadius: 3 } } }, // catch-all with dots
				{ areas: [{ x: { from: 2, to: 4 } }], styles: { dots: { dotRadius: 10 } } } // override dots
			]
		};
		const groups = buildGroupedSeries([SERIES], segments);
		const areaSeg = groups[0].visualSegments.find(
			(s) => s.data.some((d) => d.x === 3) && s.styles.dots?.dotRadius === 10
		);
		// Area's dots replace catch-all's dots; stroke falls through from catch-all.
		expect(areaSeg?.styles.stroke?.stroke).toBe('purple');
		expect(areaSeg?.styles.dots?.dotRadius).toBe(10);
	});
});

// ── validateSegments ──────────────────────────────────────────────────────────

describe('validateSegments', () => {
	test('does not warn for area-only segments', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		validateSegments({ a: [{ areas: [{ x: { to: 3 } }] }, { areas: [{ x: { from: 3 } }] }] });
		expect(warn).not.toHaveBeenCalled();
	});

	test('does not warn for a single catch-all', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		validateSegments({ a: [{ styles: {} }] });
		expect(warn).not.toHaveBeenCalled();
	});

	test('warns when two catch-alls exist in the same series list', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		validateSegments({ a: [{ styles: { stroke: { stroke: 'red' } } }, { styles: {} }] });
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('no areas'));
	});

	test('does not warn for catch-alls that name different facets, or one facet over the unscoped one', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		validateSegments({
			a: [{ styles: {} }, { facet: 'Mujeres', styles: {} }, { facet: 'Varones', styles: {} }]
		});
		expect(warn).not.toHaveBeenCalled();
	});

	test('warns for two catch-alls that name the same facet', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		validateSegments({
			a: [
				{ facet: 'Mujeres', styles: {} },
				{ facet: 'Mujeres', styles: {} }
			]
		});
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('no areas'));
	});

	test('warning message includes the series name', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		validateSegments({ mySeries: [{ styles: {} }, { styles: {} }] });
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('mySeries'));
	});

	test('validates each series independently', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		validateSegments({
			good: [{ areas: [{ x: { to: 3 } }] }, { areas: [{ x: { from: 3 } }] }],
			bad: [{ styles: {} }, { styles: {} }]
		});
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('bad'));
	});

	test('does not warn for empty segments record', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		validateSegments({});
		expect(warn).not.toHaveBeenCalled();
	});
});
