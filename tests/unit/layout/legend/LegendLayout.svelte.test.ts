import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LegendLayout from '$lib/layout/legend/LegendLayout.svelte';
import type { LegendSection } from '$lib/types/layout/legend';

describe('LegendLayout - sections that share a title', () => {
	test('a color and an opacity section titled alike both render', async () => {
		const sections: LegendSection[] = [
			{ type: 'continuous', channel: 'color', title: 'Temp', min: 0, max: 10 },
			{ type: 'continuous', channel: 'opacity', title: 'Temp', min: 0, max: 10, opacity: [0.2, 1] }
		];
		const { container } = render(LegendLayout, { sections });
		await expect.poll(() => container.querySelectorAll('.dct-legend__section').length).toBe(2);
	});

	test('two sections with no channel and the same title still both render', async () => {
		const sections: LegendSection[] = [
			{ type: 'continuous', title: 'Share', min: 0, max: 10 },
			{ type: 'continuous', title: 'Share', min: 0, max: 20 }
		];
		const { container } = render(LegendLayout, { sections });
		await expect.poll(() => container.querySelectorAll('.dct-legend__section').length).toBe(2);
	});
});

describe('LegendLayout - an opacity section', () => {
	test('draws its bar over a checkerboard, in the configured color', async () => {
		const sections: LegendSection[] = [
			{ type: 'continuous', title: 'Weight', min: 0, max: 10, opacity: [0.2, 1] }
		];
		const { container } = render(LegendLayout, { sections });
		await expect.poll(() => container.querySelector('pattern')).not.toBeNull();
		expect(container.querySelector('stop')?.getAttribute('stop-color')).toBe('#000');
	});

	test('a plain color ramp has no checkerboard', async () => {
		const sections: LegendSection[] = [{ type: 'continuous', title: 'Temp', min: 0, max: 10 }];
		const { container } = render(LegendLayout, { sections });
		await expect.poll(() => container.querySelector('.dct-continuous')).not.toBeNull();
		expect(container.querySelector('pattern')).toBeNull();
	});
});
