import { describe, test, expect } from 'vitest';
import { FacetScope } from '$lib/layout/facet/scope';

describe('FacetScope.targets', () => {
	const panel = { facetValue: 'North' };

	test('no target applies to every panel, and to a plot with no facet', () => {
		expect(FacetScope.targets(undefined, panel)).toBe(true);
		expect(FacetScope.targets(undefined, undefined)).toBe(true);
	});

	test('a value or a list names panels by their label', () => {
		expect(FacetScope.targets('North', panel)).toBe(true);
		expect(FacetScope.targets('South', panel)).toBe(false);
		expect(FacetScope.targets(['South', 'North'], panel)).toBe(true);
		expect(FacetScope.targets([], panel)).toBe(false);
	});

	test('a number or a boolean matches the text its panel is labelled with', () => {
		expect(FacetScope.targets(2022, { facetValue: '2022' })).toBe(true);
		expect(FacetScope.targets([1991, 2022], { facetValue: '2022' })).toBe(true);
		expect(FacetScope.targets(true, { facetValue: 'true' })).toBe(true);
	});

	test('a target that names a panel applies to no plot without a facet', () => {
		expect(FacetScope.targets('North', undefined)).toBe(false);
		expect(FacetScope.targets({ row: 'a' }, undefined)).toBe(false);
	});

	test('in a rows and cols grid, a side left out matches every value of it', () => {
		const cell = { facetValue: 'a / x', row: 'a', col: 'x' };
		expect(FacetScope.targets({ row: 'a' }, cell)).toBe(true);
		expect(FacetScope.targets({ col: 'x' }, cell)).toBe(true);
		expect(FacetScope.targets({ row: 'a', col: 'x' }, cell)).toBe(true);
		expect(FacetScope.targets({ row: 'b' }, cell)).toBe(false);
		expect(FacetScope.targets({ row: ['a', 'b'], col: 'y' }, cell)).toBe(false);
		expect(FacetScope.targets({}, cell)).toBe(true);
	});

	test('a row or col target needs a panel that has that side', () => {
		expect(FacetScope.targets({ row: 'a' }, { facetValue: 'a' })).toBe(false);
	});
});

describe('FacetScope.scope', () => {
	const items = [
		{ id: 'everywhere' },
		{ id: 'north', facet: 'North' },
		{ id: 'south', facet: ['South'] }
	];

	test('keeps what names no facet or this one, without the `facet` field', () => {
		expect(FacetScope.scope(items, { facetValue: 'North' })).toEqual([
			{ id: 'everywhere' },
			{ id: 'north' }
		]);
		expect(FacetScope.scope(items, { facetValue: 'South' })).toEqual([
			{ id: 'everywhere' },
			{ id: 'south' }
		]);
	});

	test('drops what names a facet from a plot with none', () => {
		expect(FacetScope.scope(items, undefined)).toEqual([{ id: 'everywhere' }]);
	});

	test('does not change the items it was given', () => {
		FacetScope.scope(items, { facetValue: 'North' });
		expect(items[1]).toEqual({ id: 'north', facet: 'North' });
	});

	test('gives back the same list when nothing names a facet', () => {
		const plain = [{ id: 'a' }, { id: 'b' }];
		expect(FacetScope.scope(plain, { facetValue: 'North' })).toBe(plain);
		expect(FacetScope.scope(plain, undefined)).toBe(plain);
		expect(FacetScope.scope(undefined, undefined)).toBeUndefined();
	});
});

describe('FacetScope.scopeSegments', () => {
	const segments = {
		default: [{ styles: 'base' }],
		'75+': [{ styles: 'all' }, { facet: 'Women', styles: 'women only' }]
	};

	test("scopes each series' segments", () => {
		expect(FacetScope.scopeSegments(segments, { facetValue: 'Women' })).toEqual({
			default: [{ styles: 'base' }],
			'75+': [{ styles: 'all' }, { styles: 'women only' }]
		});
		expect(FacetScope.scopeSegments(segments, { facetValue: 'Men' })).toEqual({
			default: [{ styles: 'base' }],
			'75+': [{ styles: 'all' }]
		});
	});

	test('keeps a series whose every segment is scoped away as an empty list', () => {
		const only = { a: [{ facet: 'Women', styles: 'x' }] };
		expect(FacetScope.scopeSegments(only, { facetValue: 'Men' })).toEqual({ a: [] });
	});

	test('gives back the same config when nothing names a facet', () => {
		const plain = { default: [{ styles: 'base' }] };
		expect(FacetScope.scopeSegments(plain, { facetValue: 'Men' })).toBe(plain);
		expect(FacetScope.scopeSegments(undefined, undefined)).toBeUndefined();
	});
});

describe('FacetScope.placeOf', () => {
	test('reads a panel as the place a facet cell sits at', () => {
		expect(FacetScope.placeOf({ key: 'North', label: 'North' })).toEqual({ facetValue: 'North' });
		expect(FacetScope.placeOf({ key: 'a\u0000x', label: 'a · x', row: 'a', col: 'x' })).toEqual({
			facetValue: 'a · x',
			row: 'a',
			col: 'x'
		});
	});
});

describe('FacetScope.distributeSegments', () => {
	const panels = [
		{ key: 'North', label: 'North' },
		{ key: 'South', label: 'South' }
	];
	const at = (panel: string, series: string) => `${panel}\u0000${series}`;

	test("moves a segment that names panels under its series' key in each of them", () => {
		const segments = {
			a: [
				{ styles: 'all' },
				{ facet: ['North', 'South'], styles: 'both' },
				{ facet: 'South', styles: 'south' }
			]
		};
		expect(FacetScope.distributeSegments(segments, panels)).toEqual({
			a: [{ styles: 'all' }],
			[at('North', 'a')]: [{ styles: 'both' }],
			[at('South', 'a')]: [{ styles: 'both' }, { styles: 'south' }]
		});
	});

	test('a `default` segment becomes the default of its panel', () => {
		expect(
			FacetScope.distributeSegments({ default: [{ facet: 'North', styles: 'x' }] }, panels)
		).toEqual({ [at('North', 'default')]: [{ styles: 'x' }] });
	});

	test('a segment that names a panel that is not there is dropped', () => {
		expect(FacetScope.distributeSegments({ a: [{ facet: 'East', styles: 'x' }] }, panels)).toEqual(
			{}
		);
	});

	test('gives back the same config when nothing names a facet', () => {
		const plain = { a: [{ styles: 'x' }] };
		expect(FacetScope.distributeSegments(plain, panels)).toBe(plain);
		expect(FacetScope.distributeSegments(undefined, panels)).toBeUndefined();
	});
});

describe('FacetScope.distributeMarkers', () => {
	const panels = [
		{ key: 'North', label: 'North' },
		{ key: 'South', label: 'South' }
	];

	test('copies a marker that names panels into each, tagged and without its `facet`, in place', () => {
		const markers = [{ id: 'first' }, { id: 'both', facet: ['North', 'South'] }, { id: 'last' }];
		expect(FacetScope.distributeMarkers(markers, panels)).toEqual([
			{ id: 'first' },
			{ id: 'both', __panel: 'North' },
			{ id: 'both', __panel: 'South' },
			{ id: 'last' }
		]);
	});

	test('gives back the same list when nothing names a facet', () => {
		const plain = [{ id: 'a' }];
		expect(FacetScope.distributeMarkers(plain, panels)).toBe(plain);
		expect(FacetScope.distributeMarkers(undefined, panels)).toBeUndefined();
	});
});
