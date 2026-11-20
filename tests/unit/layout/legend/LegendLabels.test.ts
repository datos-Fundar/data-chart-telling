import { describe, test, expect } from 'vitest';
import { LegendLabels } from '$lib/layout/legend/LegendLabels';
import type { DiscreteLegendSection, LegendSection } from '$lib/types/layout/legend';

const cfg = { legend: { pretty: true } } as Parameters<typeof LegendLabels.apply>[1];

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
