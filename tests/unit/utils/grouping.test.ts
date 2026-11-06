import { describe, expect, test } from 'vitest';
import { Grouping } from '$lib/utils/grouping';

type Row = { region: string; sex: string; year: number; 'a.b'?: string };
const row: Row = { region: 'CABA', sex: 'F', year: 2020 };

describe('Grouping', () => {
	test('leaves a single accessor, or nothing, as it is', () => {
		expect(Grouping.key<Row>(undefined)).toBeUndefined();
		expect(Grouping.key<Row>('region')).toBe('region');
		const read = (r: Row) => r.sex;
		expect(Grouping.key<Row>(read)).toBe(read);
	});

	test('reads a dotted name as its levels, outermost first', () => {
		expect(Grouping.levels<Row>('region.sex.year', [row])).toEqual(['region', 'sex', 'year']);
	});

	test('makes one dotted key of several levels', () => {
		const key = Grouping.key<Row>('region.sex.year', [row]) as (r: Row) => string;
		expect(key(row)).toBe('CABA.F.2020');
	});

	test('takes the outermost level alone when nested', () => {
		expect(Grouping.key<Row>('region.sex', [row], true)).toBe('region');
	});

	test('reads a dotted name as a field when the rows have one by that name', () => {
		const dotted: Row = { ...row, 'a.b': 'x' };
		expect(Grouping.levels<Row>('a.b', [dotted])).toEqual(['a.b']);
		expect(Grouping.key<Row>('a.b', [dotted])).toBe('a.b');
	});
});
