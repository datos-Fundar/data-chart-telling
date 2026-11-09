import { render } from 'vitest-browser-svelte';
import type { PlotRowContext } from '$lib';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { FEMALE_PROVINCE_VALUES, MALE_PROVINCE_VALUES } from '$datasets';
import { waitForSvg } from '../../../_helpers/svg';

const SERIES = [
	{ name: 'female', x: 'province' as const, y: 'value' as const, data: FEMALE_PROVINCE_VALUES },
	{ name: 'male', x: 'province' as const, y: 'value' as const, data: MALE_PROVINCE_VALUES }
];

const opacities = (svg: Element, selector: string) =>
	Array.from(svg.querySelectorAll(selector)).map((el) => Number(getComputedStyle(el).fillOpacity));

describe('BarPlot - the labels of its bars, hovered', () => {
	test('hovering a label dims every other series - its bars and its labels - with hoverIsolate', async () => {
		const { container } = await render(BarPlot, {
			width: 600,
			height: 320,
			series: SERIES,
			// Every label shows: `format` writes the series on it, so they can be told apart.
			styles: {
				values: {
					show: true,
					hoverIsolate: true,
					format: (value: number, _number: unknown, context: PlotRowContext) =>
						`${context.series} ${value}`
				}
			}
		});
		const svg = await waitForSvg(container);
		const labels = () => Array.from(svg.querySelectorAll<SVGTextElement>('g.text text'));
		await expect.poll(() => labels().length).toBeGreaterThan(0);
		expect(opacities(svg, 'g.text text').every((opacity) => opacity === 1)).toBe(true);

		const own = labels().find((t) => t.textContent?.startsWith('female'))!;
		own.closest('g[role="presentation"]')!.dispatchEvent(new PointerEvent('pointerenter'));
		await vi.waitFor(() => {
			const other = labels().find((t) => t.textContent?.startsWith('male'))!;
			expect(Number(getComputedStyle(other).fillOpacity)).toBeLessThan(1);
		});
		const female = labels().filter((t) => t.textContent?.startsWith('female'));
		expect(female.every((t) => Number(getComputedStyle(t).fillOpacity) === 1)).toBe(true);
		// The bars of the other series dim with its labels.
		expect(Math.min(...opacities(svg, 'g.bar-y rect, g.bar-x rect'))).toBeLessThan(1);

		own.closest('g[role="presentation"]')!.dispatchEvent(new PointerEvent('pointerleave'));
		await vi.waitFor(() => {
			expect(opacities(svg, 'g.text text').every((opacity) => opacity === 1)).toBe(true);
		});
	});

	test('a label listens for no pointer without hoverIsolate, so the bars keep it', async () => {
		const { container } = await render(BarPlot, {
			width: 600,
			height: 320,
			series: SERIES,
			styles: { values: { show: true } }
		});
		const svg = await waitForSvg(container);
		await expect.poll(() => svg.querySelectorAll('g.text text').length).toBeGreaterThan(0);
		const label = svg.querySelector('g.text text')!;
		expect(getComputedStyle(label).pointerEvents).toBe('none');
	});
});
