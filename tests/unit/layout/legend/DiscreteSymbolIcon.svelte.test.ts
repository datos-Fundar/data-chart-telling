import { render } from 'vitest-browser-svelte';
import { describe, test, expect, afterEach } from 'vitest';
import DiscreteSymbolIcon from '$lib/layout/legend/DiscreteSymbolIcon.svelte';
import { setConfiguration, resetConfiguration } from '$lib/configuration/config.svelte';

describe('DiscreteSymbolIcon - icon by mark', () => {
	afterEach(() => resetConfiguration());

	test('draws a line for line series and a square for area series by default', async () => {
		const line = await render(DiscreteSymbolIcon, {
			item: { name: 'A', mark: 'line' },
			color: 'red'
		});
		expect(line.container.querySelector('line')).not.toBeNull();
		const area = await render(DiscreteSymbolIcon, {
			item: { name: 'B', mark: 'area' },
			color: 'red'
		});
		const rect = area.container.querySelector('rect');
		expect(rect).not.toBeNull();
		expect(rect?.getAttribute('rx')).toBeNull();
	});

	test('legend.icon.marks changes the shape of a mark', async () => {
		setConfiguration({ legend: { icon: { marks: { line: 'circle' } } } });
		const { container } = await render(DiscreteSymbolIcon, {
			item: { name: 'A', mark: 'line' },
			color: 'red'
		});
		expect(container.querySelector('line')).toBeNull();
		expect(container.querySelector('path')).not.toBeNull();
	});

	test('an item symbol wins over the mark', async () => {
		const { container } = await render(DiscreteSymbolIcon, {
			item: { name: 'A', mark: 'line', symbol: 'star' },
			color: 'red'
		});
		expect(container.querySelector('line')).toBeNull();
	});

	test('legend.icon.rounded rounds the square and the triangle', async () => {
		setConfiguration({ legend: { icon: { rounded: true } } });
		const square = await render(DiscreteSymbolIcon, {
			item: { name: 'A', mark: 'area' },
			color: 'red'
		});
		expect(square.container.querySelector('rect')?.getAttribute('rx')).toBe('2');
		const tri = await render(DiscreteSymbolIcon, {
			item: { name: 'B', symbol: 'triangle' },
			color: 'red'
		});
		expect(tri.container.querySelector('path')?.getAttribute('d')).toContain('A 1.5');
		const star = await render(DiscreteSymbolIcon, {
			item: { name: 'C', symbol: 'star' },
			color: 'red'
		});
		expect(star.container.querySelector('path')?.getAttribute('stroke-linejoin')).toBe('round');
	});
});
