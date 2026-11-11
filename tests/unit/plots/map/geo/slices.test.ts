import { describe, test, expect } from 'vitest';
import { buildGeoSlicing } from '$lib/plots/map/geo/slices';
import { Slice } from '$lib/layout/plot/Slice';
import { resolveAccessor } from '$lib/utils/accessors';

const feature = (name: string, year?: number) => ({
	type: 'Feature',
	geometry: null,
	properties: { name, ...(year === undefined ? {} : { year }) }
});

describe('buildGeoSlicing', () => {
	const rows = [
		feature('a', 2020),
		feature('a', 2021),
		feature('base'),
		{ lon: 0, lat: 0, year: 2022 }
	];
	const slicing = buildGeoSlicing({ rows, timeline: { accessor: 'year' } });

	test('one stand-in row per value found, in features and marker rows alike', () => {
		const get = resolveAccessor(slicing.timeline!.accessor as never) as (r: unknown) => unknown;
		expect(slicing.rows.map(get)).toEqual([2020, 2021, 2022]);
	});

	test("its accessor reads a feature's properties and a marker row's own fields", () => {
		const keep = new Slice({
			rows: [],
			timeline: slicing.timeline,
			facet: undefined,
			filterMode: undefined
		}).keep({ time: 2021 });
		expect(
			rows.filter(keep).map((r) => ('properties' in r ? r.properties.name : 'marker'))
		).toEqual(['a', 'base']);
	});
});

describe('buildGeoSlicing - values the facet or timeline names', () => {
	const bare = [feature('a'), feature('b')];
	const withSex = (sex: string) => ({ type: 'Feature', geometry: null, properties: { sex } });
	/** What each stand-in row reads on the first slicing field the config has. */
	const valuesOf = (
		slicing: ReturnType<typeof buildGeoSlicing>,
		config: 'facet' | 'timeline'
	): unknown[] => {
		const c = slicing[config] as { accessor?: unknown; by?: unknown; rows?: unknown };
		const get = resolveAccessor((c.accessor ?? c.by ?? c.rows) as never) as (r: unknown) => unknown;
		return slicing.rows.map(get);
	};

	test('wrap: `values` make the panels though no feature has the field', () => {
		const slicing = buildGeoSlicing({
			rows: bare,
			facet: { by: 'sex', values: ['Women', 'Men'] }
		});
		expect(valuesOf(slicing, 'facet')).toEqual(['Women', 'Men']);
		expect(slicing.slices.map((s) => s.context)).toEqual([
			{ facet: { value: 'Women' } },
			{ facet: { value: 'Men' } }
		]);
	});

	test('wrap: named values come first, then the ones found, with none twice', () => {
		const slicing = buildGeoSlicing({
			rows: [feature('a'), withSex('Men'), withSex('Other')],
			facet: { by: 'sex', values: ['Women', 'Men'] }
		});
		expect(valuesOf(slicing, 'facet')).toEqual(['Women', 'Men', 'Other']);
	});

	test('grid: `rowValues` and `colValues` make every combination, with its row and col in the context', () => {
		const slicing = buildGeoSlicing({
			rows: bare,
			facet: { rows: 'sex', cols: 'age', rowValues: ['W', 'M'], colValues: ['young', 'old'] }
		});
		expect(slicing.slices.map((s) => s.context.facet)).toEqual([
			{ value: 'W · young', row: 'W', col: 'young' },
			{ value: 'W · old', row: 'W', col: 'old' },
			{ value: 'M · young', row: 'M', col: 'young' },
			{ value: 'M · old', row: 'M', col: 'old' }
		]);
	});

	test('timeline: its `values` are the steps, with the time in the context', () => {
		const slicing = buildGeoSlicing({
			rows: bare,
			timeline: { accessor: 'year', values: [2020, 2021] }
		});
		expect(slicing.slices.map((s) => s.context)).toEqual([{ time: 2020 }, { time: 2021 }]);
	});

	test('a facet and a timeline cross: every panel at every step', () => {
		const slicing = buildGeoSlicing({
			rows: bare,
			facet: { by: 'sex', values: ['W', 'M'] },
			timeline: { accessor: 'year', values: [2020, 2021] }
		});
		expect(slicing.slices).toHaveLength(4);
		// Steps are the outer dimension, panels the inner.
		expect(slicing.slices[2].context).toEqual({ time: 2021, facet: { value: 'W' } });
	});

	test('without a facet or a timeline there is one empty context to read in', () => {
		expect(buildGeoSlicing({ rows: bare }).slices.map((s) => s.context)).toEqual([{}]);
	});

	test('features lacking the field stay in every panel', () => {
		const slicing = buildGeoSlicing({ rows: bare, facet: { by: 'sex', values: ['W', 'M'] } });
		const keep = new Slice({
			rows: [],
			timeline: undefined,
			facet: slicing.facet,
			filterMode: undefined
		}).keep(slicing.slices[1].place);
		expect(bare.filter(keep)).toEqual(bare);
	});
});
