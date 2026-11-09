import { describe, expect, test } from 'vitest';
import { HoverDefaults } from '$lib/layout/hover/HoverDefaults';
import { HoverLayers } from '$lib/layout/hover/HoverLayers';
import { getConfiguration } from '$lib/configuration/config.svelte';
import type { HoverMarkerConfig } from '$lib/types/markers/common';

const cfg = getConfiguration();
const types = (list: { type: string }[] | undefined) => (list ?? []).map((m) => m.type);

describe('HoverDefaults', () => {
	test('a crosshair along each axis the strategy matches along, and a dot and a label in front', () => {
		const axesOf = (strategy: Parameters<typeof HoverDefaults.of>[0]) =>
			(HoverDefaults.of(strategy).back ?? []).map((m) => (m as { axis: string }).axis);
		expect(axesOf('x')).toEqual(['x']);
		expect(axesOf('y')).toEqual(['y']);
		expect(axesOf('punctual')).toEqual(['x', 'y']);
		expect(axesOf('series')).toEqual([]);
		expect(types(HoverDefaults.of('x').front)).toEqual(['dot', 'text']);
	});

	test('no crosshair while the plot turns it off', () => {
		expect(HoverDefaults.of('punctual', false).back).toEqual([]);
	});

	test('a crosshair sits at the point under the pointer only', () => {
		expect(HoverDefaults.rule('x')).toMatchObject({ points: 'active' });
	});

	test("a span reads its ends off the point's row, or off a function of the point", () => {
		const point = { x: 2, y: 5, label: '5', row: { from: 1, to: 3 } };
		const byField = HoverDefaults.span('x', 'from', 'to') as unknown as Record<string, never>;
		expect(byField).toMatchObject({ type: 'rect', points: 'active' });
		expect((byField.x1 as (p: unknown) => unknown)(point)).toBe(1);
		expect((byField.x2 as (p: unknown) => unknown)(point)).toBe(3);
		const byFunction = HoverDefaults.span(
			'y',
			(p) => Number(p.y) - 1,
			(p) => Number(p.y) + 1
		) as unknown as Record<string, never>;
		expect((byFunction.y1 as (p: unknown) => unknown)(point)).toBe(4);
		expect((byFunction.y2 as (p: unknown) => unknown)(point)).toBe(6);
		expect(HoverDefaults.behindSpan('x', 'from', 'to')).toEqual({
			back: [expect.objectContaining({ type: 'rect', points: 'active' })],
			front: []
		});
	});

	test("an author's back and front replace the kind's; an empty list draws nothing", () => {
		const look = HoverDefaults.of('x');
		const merged = HoverDefaults.merge(look, { type: 'hover', back: [] });
		expect(merged.back).toEqual([]);
		expect(merged.front).toBe(look.front);
		const own = HoverDefaults.merge(look, { type: 'hover', front: [{ type: 'dot' }] });
		expect(types(own.front)).toEqual(['dot']);
		expect(own.back).toBe(look.back);
	});

	test("an author's active and others go over the kind's, field by field", () => {
		const look = { active: { fillOpacity: 1, stroke: 'black' }, others: { fillOpacity: 0.4 } };
		const merged = HoverDefaults.merge(look, { type: 'hover', active: { stroke: 'red' } });
		expect(merged.active).toEqual({ fillOpacity: 1, stroke: 'red' });
		expect(merged.others).toEqual({ fillOpacity: 0.4 });
		expect(HoverDefaults.merge({}, { type: 'hover' }).active).toBeUndefined();
	});

	test('keeps the rest of the author marker', () => {
		const merged = HoverDefaults.merge(
			{},
			{ type: 'hover', series: 'a', strategy: 'y', decimals: 2 }
		);
		expect(merged).toMatchObject({ series: 'a', strategy: 'y', decimals: 2 });
	});
});

describe('HoverLayers', () => {
	const points = [
		{ x: 'A', y: 10, label: '10', series: 'f', areaInset: { start: 0, end: 0.5 } },
		{ x: 'A', y: 20, label: '20', series: 'm', areaInset: { start: 0.5, end: 0 } }
	];
	const group = { key: '', points, active: points[1] };
	const hover = (layers: Partial<HoverMarkerConfig>): HoverMarkerConfig => ({
		type: 'hover',
		...layers
	});

	test('a marker draws the points, at their x and y unless it sets its own', () => {
		const [first] = HoverLayers.parts(
			hover({ front: [{ type: 'dot' }] }),
			'front',
			{ ...group, points: [points[0]] },
			cfg
		);
		const marker = first.marker as { data: unknown[]; x: (p: unknown) => unknown };
		expect(marker.data).toEqual([points[0]]);
		expect(marker.x(points[0])).toBe('A');
		const own = HoverLayers.parts(
			hover({ front: [{ type: 'dot', x: 'other' }] }),
			'front',
			group,
			cfg
		);
		expect((own[0].marker as { x: unknown }).x).toBe('other');
	});

	test('points picks the one under the pointer, or those a function keeps', () => {
		const rowsOf = (which: 'active' | ((p: { y: unknown }) => boolean)) =>
			HoverLayers.parts(
				hover({ front: [{ type: 'dot', points: which }] }),
				'front',
				group,
				cfg
			).flatMap((part) => (part.marker as { data: unknown[] }).data);
		expect(rowsOf('active')).toEqual([points[1]]);
		expect(rowsOf((p) => Number(p.y) < 15)).toEqual([points[0]]);
	});

	test("a point in a slice of its band is drawn in a part of that slice's; a band takes them all", () => {
		const dots = HoverLayers.parts(hover({ front: [{ type: 'dot' }] }), 'front', group, cfg);
		expect(dots.map((part) => part.slice)).toEqual([points[0].areaInset, points[1].areaInset]);
		const bands = HoverLayers.parts(
			hover({ back: [{ type: 'band', axis: 'x' }] }),
			'back',
			group,
			cfg
		);
		expect(bands).toHaveLength(1);
		expect((bands[0].marker as { data: unknown[] }).data).toEqual(points);
	});

	test("what a marker leaves unset comes from the hover: its place, its text, its look and the series' color", () => {
		const parts = HoverLayers.parts(
			hover({
				back: [
					{ type: 'rule', axis: 'x' },
					{ type: 'band', axis: 'x' }
				],
				front: [{ type: 'text', styles: { fontSize: 20 } }]
			}),
			'back',
			{ ...group, points: [points[0]] },
			cfg
		);
		const [rule, band] = parts.map((part) => part.marker as unknown as Record<string, never>);
		expect((rule.value as (p: unknown) => unknown)(points[0])).toBe('A');
		expect(rule.styles).toEqual(cfg.hover.rule);
		expect((band.slice as (p: unknown) => unknown)(points[0])).toEqual(points[0].areaInset);
		expect(band.styles).toEqual(cfg.hover.area);
		const [text] = HoverLayers.parts(
			hover({ front: [{ type: 'text', styles: { fontSize: 20 } }] }),
			'front',
			{ ...group, points: [{ ...points[0], color: 'red' }] },
			cfg
		).map((part) => part.marker as unknown as Record<string, never>);
		expect((text.text as (p: unknown) => unknown)(points[0])).toBe('10');
		const styles = text.styles as { fontSize: number; fill: (p: unknown) => string; dy: number };
		expect(styles.fontSize).toBe(20);
		expect(styles.dy).toBe(cfg.hover.font.dy);
		expect(styles.fill({ color: 'red' })).toBe('red');
	});

	test("a rect takes the configuration's hover area look under its own styles", () => {
		const [part] = HoverLayers.parts(
			hover({ back: [{ type: 'rect', x1: 'a', x2: 'b', styles: { fill: 'red' } }] }),
			'back',
			group,
			cfg
		);
		expect((part.marker as { styles: object }).styles).toEqual({ ...cfg.hover.area, fill: 'red' });
	});

	test('a marker with data of its own draws it, and nothing is drawn without points', () => {
		const data = [{ v: 1 }];
		const [part] = HoverLayers.parts(
			hover({ back: [{ type: 'rule', axis: 'x', value: 'v', data }] }),
			'back',
			group,
			cfg
		);
		expect((part.marker as { data: unknown[] }).data).toBe(data);
		expect(
			HoverLayers.parts(hover({ front: [{ type: 'dot' }] }), 'front', { ...group, points: [] }, cfg)
		).toEqual([]);
	});

	test("labels are written as the marker's number fields or its format ask", () => {
		expect(
			HoverLayers.labelled(points, { type: 'hover', suffix: '%' }, cfg).map((p) => p.label)
		).toEqual(['10%', '20%']);
		const format = (p: { series?: string }) => `${p.series}!`;
		expect(
			HoverLayers.labelled(points, { type: 'hover', format }, cfg).map((p) => p.label)
		).toEqual(['f!', 'm!']);
		expect(HoverLayers.labelled(points, { type: 'hover' }, cfg)).toEqual(points);
	});
});
