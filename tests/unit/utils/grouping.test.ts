import { describe, expect, test } from 'vitest';
import { groupingKey } from '$lib/utils/grouping';

type Row = { region: string; sex: string; year: number };
const row: Row = { region: 'CABA', sex: 'F', year: 2020 };

describe('groupingKey', () => {
	test('leaves a single accessor, or nothing, as it is', () => {
		expect(groupingKey<Row>(undefined)).toBeUndefined();
		expect(groupingKey<Row>('region')).toBe('region');
		const read = (r: Row) => r.sex;
		expect(groupingKey<Row>(read)).toBe(read);
	});

	test('takes a list of one as that accessor, and an empty list as none', () => {
		expect(groupingKey<Row>(['region'])).toBe('region');
		expect(groupingKey<Row>([])).toBeUndefined();
	});

	test('makes one key of the levels of a list, outermost first', () => {
		const key = groupingKey<Row>(['region', (r) => r.sex, 'year']) as (r: Row) => string;
		expect(key(row)).toBe('CABA · F · 2020');
	});
});
