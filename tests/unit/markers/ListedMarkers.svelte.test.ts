import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import ListedMarkersProbe from './ListedMarkersProbe.svelte';

const BETWEEN = {
	axis: 'x',
	from: { type: 'series', series: 'a' },
	to: { type: 'series', series: 'b' }
} as const;

/** What the plot draws for the markers in `markers`. */
async function draw(markers: unknown[]) {
	const { container } = await render(ListedMarkersProbe, { markers: markers as never });
	return {
		rules: [...container.querySelectorAll('g[class^="rule-y"] line')],
		deltaLabels: [...container.querySelectorAll('g[class^="text"] text')].map((t) => t.textContent),
		deltaDots: container.querySelectorAll('g[class^="dot"]').length
	};
}

describe('rule marker with a list of values', () => {
	test('draws a line at each value, all with the same style', async () => {
		const { rules } = await draw([
			{ type: 'rule', axis: 'y', value: [10, 20], styles: { stroke: 'crimson' } }
		]);
		expect(rules).toHaveLength(2);
		expect(new Set(rules.map((line) => Math.round(line.getBoundingClientRect().top))).size).toBe(2);
		expect(rules.map((line) => getComputedStyle(line).stroke)).toEqual([
			'rgb(220, 20, 60)',
			'rgb(220, 20, 60)'
		]);
	});

	test('a single value still draws one line', async () => {
		const { rules } = await draw([
			{ type: 'rule', axis: 'y', value: 10, styles: { stroke: 'crimson' } }
		]);
		expect(rules).toHaveLength(1);
	});

	test('an empty list draws none', async () => {
		const { rules } = await draw([
			{ type: 'rule', axis: 'y', value: [], styles: { stroke: 'red' } }
		]);
		expect(rules).toHaveLength(0);
	});
});

describe('delta marker with a list of positions', () => {
	test('draws a delta at each position, in order, between the same two series', async () => {
		const { deltaLabels } = await draw([{ type: 'delta', at: [2005, 2015], ...BETWEEN }]);
		expect(deltaLabels).toEqual(['7.5', '12.5']);
	});

	test('a single position still draws one delta', async () => {
		const { deltaLabels, deltaDots } = await draw([{ type: 'delta', at: 2005, ...BETWEEN }]);
		expect(deltaLabels).toEqual(['7.5']);
		expect(deltaDots).toBeGreaterThanOrEqual(2);
	});

	test('a list has as many deltas as one marker per position', async () => {
		const listed = await draw([{ type: 'delta', at: [2005, 2015], ...BETWEEN }]);
		const separate = await draw([
			{ type: 'delta', at: 2005, ...BETWEEN },
			{ type: 'delta', at: 2015, ...BETWEEN }
		]);
		expect(listed.deltaLabels).toEqual(separate.deltaLabels);
		expect(listed.deltaDots).toBe(separate.deltaDots);
	});

	test('a text style that is a function of the position styles each delta on its own', async () => {
		const { container } = await render(ListedMarkersProbe, {
			markers: [
				{
					type: 'delta',
					at: [2005, 2015],
					...BETWEEN,
					text: (at: unknown) => (at === 2015 ? { textAnchor: 'end' } : { textAnchor: 'start' })
				}
			] as never
		});
		const anchors = [...container.querySelectorAll('g[class^="text"] text')].map(
			(t) => getComputedStyle(t).textAnchor
		);
		expect(anchors).toEqual(['start', 'end']);
	});
});
