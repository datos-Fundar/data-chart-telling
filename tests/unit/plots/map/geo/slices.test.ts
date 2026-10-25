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
