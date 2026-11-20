import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
import type { DiscreteLegendSection, LegendSection } from '$lib/types/layout/legend';

const ITEMS = [
	{ name: 'a', label: 'Santiago del Estero' },
	{ name: 'b', label: 'Tierra del Fuego, Antártida e Islas del Atlántico Sur' },
	{ name: 'c', label: 'Jujuy' }
];

const section = (
	labels: DiscreteLegendSection['labels'],
	interactive?: DiscreteLegendSection['interactive']
): LegendSection[] => [
	{ type: 'discrete', items: ITEMS, layout: { type: 'vertical' }, labels, interactive }
];

const labelsOf = (container: Element) =>
	Array.from(container.querySelectorAll<HTMLElement>('.dct-discrete__label'));

describe('DiscreteSection - labels.maxWidth', () => {
	test.each([
		['swatches', undefined],
		['badges', { enabled: true, legendStyle: 'badge' as const }]
	])('caps the width of each %s label, which an ellipsis then cuts', async (_name, interactive) => {
		const { container } = render(LegendLayout, {
			sections: section({ maxWidth: 80 }, interactive)
		});
		await vi.waitFor(() => expect(labelsOf(container)).toHaveLength(3));
		for (const label of labelsOf(container))
			expect(label.getBoundingClientRect().width).toBeLessThanOrEqual(80.5);
		const [short, long, shortest] = [
			labelsOf(container)[0],
			labelsOf(container)[1],
			labelsOf(container)[2]
		];
		// The long name does not fit its cap, and the short one needs none.
		expect(long.scrollWidth).toBeGreaterThan(long.clientWidth);
		expect(shortest.scrollWidth).toBeLessThanOrEqual(shortest.clientWidth);
		expect(short.textContent).toBe('Santiago del Estero');
	});

	test('leaves the labels as wide as they are without it', async () => {
		const { container } = render(LegendLayout, { sections: section({ suffix: '!' }) });
		await vi.waitFor(() => expect(labelsOf(container)).toHaveLength(3));
		const widest = Math.max(...labelsOf(container).map((el) => el.getBoundingClientRect().width));
		expect(widest).toBeGreaterThan(200);
	});
});
