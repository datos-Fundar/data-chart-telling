import { afterEach, describe, test, expect } from 'vitest';
import {
	DEFAULT_CONFIG,
	getConfiguration,
	resetConfiguration,
	setConfiguration
} from '$lib/configuration/config.svelte';

afterEach(() => resetConfiguration());

describe('setConfiguration - palette', () => {
	test('a scheme name becomes the list of colors the plots read', () => {
		setConfiguration({ palette: 'tableau10' });
		const palette = getConfiguration().palette;
		expect(palette).toHaveLength(10);
		expect(palette.every((color) => /^#[0-9a-f]{6}$/i.test(color))).toBe(true);
	});

	test('a ramp name with its own count', () => {
		setConfiguration({ palette: { scheme: 'viridis', count: 5 } });
		expect(getConfiguration().palette).toHaveLength(5);
	});

	test('a list of colors still works', () => {
		setConfiguration({ palette: ['#111111', '#222222'] });
		expect(getConfiguration().palette).toEqual(['#111111', '#222222']);
	});
});

describe('setConfiguration - continuous ramp', () => {
	test('a scheme name sits beside min and max', () => {
		setConfiguration({ continuous: { scheme: 'viridis', schemeRange: [0.1, 0.9] } });
		const { continuous } = getConfiguration();
		expect(continuous.scheme).toBe('viridis');
		expect(continuous.schemeRange).toEqual([0.1, 0.9]);
		expect(continuous.min).toBe(DEFAULT_CONFIG.continuous.min);
	});
});
