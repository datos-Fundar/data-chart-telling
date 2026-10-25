import { describe, test, expect } from 'vitest';
import { GeoFeatures } from '$lib/plots/map/geo/GeoFeatures.svelte';

const feature = (id: string | number | undefined, properties: Record<string, unknown> | null) =>
	({ type: 'Feature', id, properties, geometry: null }) as never;

describe('GeoFeatures.defaultId', () => {
	test('prefers the feature id, then properties.id, then properties.name', () => {
		expect(GeoFeatures.defaultId(feature('a', { id: 'b', name: 'c' }))).toBe('a');
		expect(GeoFeatures.defaultId(feature(undefined, { id: 'b', name: 'c' }))).toBe('b');
		expect(GeoFeatures.defaultId(feature(undefined, { name: 'c' }))).toBe('c');
	});

	test('is empty when nothing names the feature', () => {
		expect(GeoFeatures.defaultId(feature(undefined, null))).toBe('');
	});
});
