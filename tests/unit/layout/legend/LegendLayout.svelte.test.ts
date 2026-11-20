import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
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

describe("LegendLayout - a continuous section with `width: 'fill'`", () => {
	const barWidth = (container: Element) =>
		Number(container.querySelector('.dct-continuous svg')!.getAttribute('width'));
	const sections = (width?: number | 'fill'): LegendSection[] => [
		{ type: 'continuous', min: 0, max: 100, ...(width === undefined ? {} : { width }) }
	];

	test('is as wide as the container, and follows it as it resizes', async () => {
		const { container } = render(LegendLayout, { sections: sections('fill') });
		(container as HTMLElement).style.width = '400px';
		await vi.waitFor(() => expect(barWidth(container)).toBe(400));
		(container as HTMLElement).style.width = '250px';
		await vi.waitFor(() => expect(barWidth(container)).toBe(250));
	});

	test('a number or nothing keeps its own width', async () => {
		const own = render(LegendLayout, { sections: sections(220) });
		(own.container as HTMLElement).style.width = '400px';
		expect(barWidth(own.container)).toBe(220);
		const unset = render(LegendLayout, { sections: sections() });
		(unset.container as HTMLElement).style.width = '400px';
		expect(barWidth(unset.container)).toBe(170);
	});
});
