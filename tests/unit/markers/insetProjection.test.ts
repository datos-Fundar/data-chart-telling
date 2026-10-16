import { describe, test, expect } from 'vitest';
import { buildInsetProjection } from '$lib/markers/inset/insetProjection';

describe('buildInsetProjection', () => {
	test('defaults to mercator when no config is given', () => {
		const projection = buildInsetProjection();
		// A fresh, un-rotated mercator projects [0, 0] to its own translate origin.
		expect(projection([0, 0])).toEqual(projection.translate());
	});

	test('resolves a bare projection name', () => {
		const projection = buildInsetProjection('azimuthal-equidistant');
		expect(projection.rotate()).toEqual([0, 0, 0]);
	});

	test('applies rotate from a config object', () => {
		const projection = buildInsetProjection({ type: 'azimuthal-equidistant', rotate: [49.5, 90] });
		expect(projection.rotate()).toEqual([49.5, 90, 0]);
	});

	test('applies parallels to a conic projection', () => {
		const projection = buildInsetProjection({
			type: 'conic-conformal',
			parallels: [-30, -50]
		}) as unknown as {
			parallels(): [number, number];
		};
		const [p0, p1] = projection.parallels();
		expect(p0).toBeCloseTo(-30);
		expect(p1).toBeCloseTo(-50);
	});

	test('applies a numeric clip as clipAngle', () => {
		const projection = buildInsetProjection({ type: 'orthographic', clip: 45 });
		expect(projection.clipAngle()).toBe(45);
	});
});
