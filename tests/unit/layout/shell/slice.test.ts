import { describe, test, expect } from 'vitest';
import { buildSliceFilter } from '$lib/layout/shell/slice';

type Row = Record<string, unknown>;

describe('buildSliceFilter', () => {
	test('keeps a timeline step exactly, or up to it', () => {
		const exact = buildSliceFilter<Row>({ timeline: { accessor: 'year' }, place: { time: 2020 } });
		expect(exact({ year: 2020 })).toBe(true);
		expect(exact({ year: 2019 })).toBe(false);
		const upTo = buildSliceFilter<Row>({
			timeline: { accessor: 'year' },
			filterMode: 'upTo',
			place: { time: 2020 }
		});
		expect(upTo({ year: 2019 })).toBe(true);
		expect(upTo({ year: 2021 })).toBe(false);
	});

	test('a row without the slicing field belongs in every slice', () => {
		const keep = buildSliceFilter<Row>({
			timeline: { accessor: 'year' },
			facet: { by: 'region' },
			place: { time: 2020, facet: { facetValue: 'North' } }
		});
		expect(keep({ name: 'base map' })).toBe(true);
		expect(keep({ region: 'North' })).toBe(true);
		expect(keep({ region: 'South' })).toBe(false);
	});

	test('a rows/cols grid matches both values', () => {
		const keep = buildSliceFilter<Row>({
			facet: { rows: 'sex', cols: 'region' },
			place: { facet: { facetValue: 'F · North', row: 'F', col: 'North' } }
		});
		expect(keep({ sex: 'F', region: 'North' })).toBe(true);
		expect(keep({ sex: 'M', region: 'North' })).toBe(false);
	});
});
