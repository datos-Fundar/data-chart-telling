import { describe, test, expect } from 'vitest';
import { buildFacetAxesDisplay } from '$lib/layout/facet/axes';

type Row = { g: string; v: number };

const INNER = { top: true, right: true, bottom: false, left: false };
const CORNER = { top: false, right: false, bottom: true, left: true };

describe('buildFacetAxesDisplay', () => {
	test("axes: 'all' (default) changes nothing", () => {
		expect(buildFacetAxesDisplay<Row>({ by: 'g' })({ edges: INNER })).toBeUndefined();
	});

	test("axes: 'outer' hides a shared axis off the left/bottom edge", () => {
		const display = buildFacetAxesDisplay<Row>({ by: 'g', axes: 'outer' });
		expect(display({ edges: INNER })?.x?.axisDisplay).toBe('none');
		expect(display({ edges: INNER })?.y?.axisDisplay).toBe('none');
		expect(display({ edges: CORNER })?.x?.axisDisplay).toBeUndefined();
		expect(display({ edges: CORNER })?.y?.axisDisplay).toBeUndefined();
	});

	test("axes: 'outer' runs a drawn y axis' title vertically, and only there", () => {
		const display = buildFacetAxesDisplay<Row>({ by: 'g', axes: 'outer' });
		const left = display({ edges: { top: true, right: false, bottom: true, left: true } });
		const inner = display({ edges: { top: true, right: true, bottom: true, left: false } });
		expect(left?.y?.labelOrientation).toBe('vertical');
		expect(left?.x?.labelOrientation).toBeUndefined();
		expect(inner?.y?.labelOrientation).toBeUndefined();
	});

	test("axes: 'outer' keeps a free axis on every facet", () => {
		const display = buildFacetAxesDisplay<Row>({ by: 'g', axes: 'outer', scales: 'free-y' });
		expect(display({ edges: INNER })?.y?.axisDisplay).toBeUndefined();
		expect(display({ edges: INNER })?.x?.axisDisplay).toBe('none');
	});
});
