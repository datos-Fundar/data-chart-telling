import { describe, test, expect } from 'vitest';
import { Slice } from '$lib/layout/plot/Slice';
import type { SliceInputs } from '$lib/layout/plot/Slice';
import type { SlicePlace } from '$lib/types/layout/plot';

type Row = Record<string, unknown>;

const keepFor = ({
	place,
	...inputs
}: Partial<Omit<SliceInputs<Row>, 'rows'>> & { place: SlicePlace }) =>
	new Slice<Row>({
		rows: [],
		timeline: undefined,
		facet: undefined,
		filterMode: undefined,
		...inputs
	}).keep(place);

describe('Slice.keep', () => {
	test('keeps a timeline step exactly, or up to it', () => {
		const exact = keepFor({ timeline: { accessor: 'year' }, place: { time: 2020 } });
		expect(exact({ year: 2020 })).toBe(true);
		expect(exact({ year: 2019 })).toBe(false);
		const upTo = keepFor({
			timeline: { accessor: 'year' },
			filterMode: 'upTo',
			place: { time: 2020 }
		});
		expect(upTo({ year: 2019 })).toBe(true);
		expect(upTo({ year: 2021 })).toBe(false);
	});

	test('a row without the slicing field belongs in every slice', () => {
		const keep = keepFor({
			timeline: { accessor: 'year' },
			facet: { by: 'region' },
			place: { time: 2020, facet: { facetValue: 'North' } }
		});
		expect(keep({ name: 'base map' })).toBe(true);
		expect(keep({ region: 'North' })).toBe(true);
		expect(keep({ region: 'South' })).toBe(false);
	});

	test('a rows/cols grid matches both values', () => {
		const keep = keepFor({
			facet: { rows: 'sex', cols: 'region' },
			place: { facet: { facetValue: 'F · North', row: 'F', col: 'North' } }
		});
		expect(keep({ sex: 'F', region: 'North' })).toBe(true);
		expect(keep({ sex: 'M', region: 'North' })).toBe(false);
	});
});

describe('Slice', () => {
	const inputs = { rows: undefined as Row[] | undefined, timeline: undefined, facet: undefined, filterMode: undefined };

	test('is sliced only with rows and a timeline or facet', () => {
		expect(new Slice<Row>({ ...inputs, rows: [{}] }).sliced).toBe(false);
		expect(new Slice<Row>({ ...inputs, facet: { by: 'r' } }).sliced).toBe(false);
		expect(new Slice<Row>({ ...inputs, rows: [{}], facet: { by: 'r' } }).sliced).toBe(true);
	});

	test("the timeline's filter mode wins over the kind's", () => {
		const timeline = { accessor: 'year' };
		expect(new Slice<Row>({ ...inputs, timeline, filterMode: 'upTo' }).filterMode).toBe('upTo');
		const own = { ...timeline, filterMode: 'exact' as const };
		expect(new Slice<Row>({ ...inputs, timeline: own, filterMode: 'upTo' }).filterMode).toBe('exact');
	});

	test('reports slicing that cannot work', () => {
		expect(new Slice<Row>({ ...inputs, facet: {} as never }).problems).toHaveLength(2);
		expect(new Slice<Row>({ ...inputs, rows: [{}], facet: { by: 'r' } }).problems).toEqual([]);
	});

	test('a timeline alone shares the domains of all its rows, unless free', () => {
		const shared = { '': { x: { domain: [0, 1] } } };
		const timeline = { accessor: 'year' };
		expect(new Slice<Row>({ ...inputs, timeline }).timelineScales(shared)).toBe(shared['']);
		expect(new Slice<Row>({ ...inputs, timeline: { ...timeline, scales: 'free' } }).timelineScales(shared)).toBeUndefined();
		expect(new Slice<Row>({ ...inputs, timeline, facet: { by: 'r' } }).timelineScales(shared)).toBeUndefined();
	});
});
