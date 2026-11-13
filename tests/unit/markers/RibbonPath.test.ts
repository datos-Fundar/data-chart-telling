import { describe, expect, test } from 'vitest';
import { RibbonPath } from '$lib/markers/ribbon/RibbonPath';

describe('RibbonPath', () => {
	test('curves both edges from one end to the other, meeting at the middle by default', () => {
		const d = RibbonPath.horizontal({ at: 0, from: 10, to: 20 }, { at: 100, from: 50, to: 70 });
		expect(d).toBe('M0,10C50,10 50,50 100,50L100,70C50,70 50,20 0,20Z');
	});

	test('a curvature of 0 is a straight band', () => {
		const d = RibbonPath.horizontal({ at: 0, from: 0, to: 10 }, { at: 40, from: 20, to: 30 }, 0);
		expect(d).toBe('M0,0C0,0 40,20 40,20L40,30C40,30 0,10 0,10Z');
	});
});
