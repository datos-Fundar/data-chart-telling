import { describe, test, expect } from 'vitest';
import * as pkg from '$lib';

describe('the package keeps its color function names', () => {
	test('each one still does what its class method does', () => {
		expect(pkg.contrastRatio('#ffffff', '#000000')).toBeCloseTo(21, 0);
		expect(pkg.contrastTextColor('#111827')).toBe('#ffffff');
		expect(pkg.paletteColor(2, ['#111111', '#222222'])).toBe('#111111');
		expect(pkg.normalize(5, 0, 10)).toBe(0.5);
		expect(pkg.resolveCssColor('#123456')).toBe('#123456');
		expect(pkg.makeColorScale(0, 1, '#000000', '#ffffff')(0)).toMatch(/0, 0, 0/);
		expect(pkg.resolveColorScale({ scheme: ['#000000', '#ffffff'] }, [0, 1], [])(1)).toMatch(
			/255, 255, 255/
		);
	});
});
