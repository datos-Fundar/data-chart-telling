import { describe, test, expect } from 'vitest';
import { LegendLabels } from '$lib/layout/legend/LegendLabels';
import type { DiscreteLegendSection, LegendSection } from '$lib/types/layout/legend';

const cfg = { legend: { pretty: true } } as Parameters<typeof LegendLabels.apply>[1];

describe('LegendLabels.rewrite', () => {
	test('a prefix and a suffix go around the label', () => {
		expect(LegendLabels.rewrite('25-29', { suffix: ' years' })).toBe('25-29 years');
		expect(LegendLabels.rewrite('1', { prefix: 'Q: ' })).toBe('Q: 1');
		expect(LegendLabels.rewrite('b', { prefix: '<', suffix: '>' })).toBe('<b>');
	});

	test('a record swaps a text for another, every match', () => {
		expect(LegendLabels.rewrite('Quintile 1 de Quintile', { replace: { Quintile: 'Q' } })).toBe(
			'Q 1 de Q'
		);
	});

	test('a list swaps in order, a pattern as an expression', () => {
		expect(LegendLabels.rewrite('Quartile 3', { replace: [[/^Quartile /, 'Q: ']] })).toBe('Q: 3');
		expect(
			LegendLabels.rewrite('a b', {
				replace: [
					['a', 'b'],
					['b', 'c']
				]
			})
		).toBe('c c');
	});

	test('a replacement is written as it is, not read as a pattern', () => {
		expect(LegendLabels.rewrite('a', { replace: { a: '$&$&' } })).toBe('$&$&');
	});

	test('the swaps go before the prefix and suffix', () => {
		expect(
			LegendLabels.rewrite('Quintile 1', { replace: { Quintile: 'Q' }, suffix: 'Quintile' })
		).toBe('Q 1Quintile');
	});

	test('nothing set leaves the label as it is', () => {
		expect(LegendLabels.rewrite('x', {})).toBe('x');
	});
});

describe('LegendLabels.apply', () => {
	const discrete = (labels?: DiscreteLegendSection['labels']): LegendSection[] => [
		{
			type: 'discrete',
			labels,
			items: [{ name: 'quintile_1' }, { name: 'b', label: 'Bee' }]
		}
	];

	test('rewrites the label an item shows: its own, or its name as the legend writes it', () => {
		const [section] = LegendLabels.apply(discrete({ suffix: '!' }), cfg) as DiscreteLegendSection[];
		expect(section.items.map((item) => item.label)).toEqual(['Quintile 1!', 'Bee!']);
	});

	test('keeps the names, which turning series off goes by', () => {
		const [section] = LegendLabels.apply(discrete({ suffix: '!' }), cfg) as DiscreteLegendSection[];
		expect(section.items.map((item) => item.name)).toEqual(['quintile_1', 'b']);
	});

	test('a section with no labels is left as it is', () => {
		const sections = discrete();
		expect(LegendLabels.apply(sections, cfg)).toEqual(sections);
	});

	test('a section that is not discrete is left as it is', () => {
		const sections: LegendSection[] = [{ type: 'continuous', min: 0, max: 1 }];
		expect(LegendLabels.apply(sections, cfg)).toEqual(sections);
	});
});
