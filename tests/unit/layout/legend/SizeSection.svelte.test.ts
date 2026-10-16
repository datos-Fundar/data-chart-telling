import { render } from 'vitest-browser-svelte';
import { describe, test, expect, afterEach } from 'vitest';
import { resetConfiguration, setConfiguration } from '$lib/configuration/config.svelte';
import { AxisNumberFormat } from '$lib/layout/legend/AxisNumberFormat';
import SizeSection from '$lib/layout/legend/SizeSection.svelte';

describe('SizeSection - a few dots, growing with the value', () => {
	test('round values across the domain, each labelled, radius on a square-root scale', async () => {
		const { container } = await render(SizeSection, {
			section: { type: 'size', domain: [0, 1600], range: [0, 10], format: String }
		});
		const labels = [...container.querySelectorAll('.dct-size__label')].map((t) => t.textContent);
		expect(labels.length).toBeGreaterThanOrEqual(3);
		expect(labels.length).toBeLessThanOrEqual(4);
		const radii = [...container.querySelectorAll('circle')].map((c) => Number(c.getAttribute('r')));
		expect(radii).toEqual([...radii].sort((a, b) => a - b));
		expect(radii.at(-1)).toBeCloseTo(10 * Math.sqrt(Number(labels.at(-1)) / 1600));
	});

	test('rings draw unfilled in the given color; explicit values are used as they are', async () => {
		const { container } = await render(SizeSection, {
			section: {
				type: 'size',
				domain: [0, 100],
				range: [0, 10],
				values: [25, 100],
				color: 'teal',
				filled: false
			}
		});
		const circles = [...container.querySelectorAll('circle')];
		expect(circles.map((c) => c.getAttribute('fill'))).toEqual(['none', 'none']);
		expect(circles.map((c) => c.getAttribute('stroke'))).toEqual(['teal', 'teal']);
		expect(circles.map((c) => Number(c.getAttribute('r')))).toEqual([5, 10]);
	});
});

describe('SizeSection - values read as the axes write theirs', () => {
	afterEach(() => resetConfiguration());

	test('compact by axis.locale and axis.compactDisplay', async () => {
		setConfiguration({ axis: { locale: 'en-US', compactDisplay: 'short' } });
		const { container } = await render(SizeSection, {
			section: { type: 'size', domain: [0, 4000], range: [0, 10], values: [1000, 4000] }
		});
		const labels = [...container.querySelectorAll('.dct-size__label')].map((l) => l.textContent);
		expect(labels).toEqual(['1K', '4K']);
	});
});

describe('AxisNumberFormat - when ticks read compact', () => {
	test('across zero, or across orders of magnitude; not within one', () => {
		expect(AxisNumberFormat.compact([0, 50])).toBe(true);
		expect(AxisNumberFormat.compact([10, 5000])).toBe(true);
		expect(AxisNumberFormat.compact([2000, 9000])).toBe(false);
	});
});
