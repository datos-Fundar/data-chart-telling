import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import SymbolSection from '$lib/layout/legend/SymbolSection.svelte';
import { SymbolPath } from '$lib/utils/symbol';

describe('SymbolSection - each category next to its shape', () => {
	test('one item per category, in the section color, outlined when not filled', async () => {
		const { container } = await render(SymbolSection, {
			section: {
				type: 'symbol',
				items: [
					{ name: 'A', symbol: 'circle' },
					{ name: 'B', symbol: 'star' }
				],
				color: 'teal',
				filled: false
			}
		});
		const labels = [...container.querySelectorAll('.dct-discrete__label')].map((l) =>
			l.textContent?.trim()
		);
		expect(labels).toContain('A');
		expect(labels).toContain('B');
		const [circle, star] = container.querySelectorAll('.dct-discrete__swatch path');
		expect(circle?.getAttribute('d')).toBe(SymbolPath.fitted('circle', 7));
		expect(star?.getAttribute('d')).toBe(SymbolPath.fitted('star', 7));
		expect(star?.getAttribute('fill')).toBe('none');
		expect(star?.getAttribute('stroke')).toBe('teal');
	});
});

describe('SymbolPath - the shape a dot draws', () => {
	test('a circle is two arcs of the radius; other shapes close their path', () => {
		expect(SymbolPath.of('circle', 4)).toBe('M4,0A4,4,0,1,1,-4,0A4,4,0,1,1,4,0');
		expect(SymbolPath.of('diamond', 4)).toMatch(/^M.*Z$/);
	});

	test('fitted scales a shape to fill a square, centred in it', () => {
		expect(SymbolPath.fitted('circle', 8)).toBe('M8,4A4,4,0,1,1,0,4A4,4,0,1,1,8,4');
		const ys = [...SymbolPath.fitted('triangle', 8).matchAll(/[ML][\d.e-]+,([\d.e-]+)/g)].map((m) =>
			Number(m[1])
		);
		// Wider than tall: fitted by its width, centred on its height.
		expect(Math.min(...ys) + Math.max(...ys)).toBeCloseTo(8);
		expect(Math.min(...ys)).toBeGreaterThan(0);
	});
});
