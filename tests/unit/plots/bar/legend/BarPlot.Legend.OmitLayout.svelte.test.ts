import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/bar/Plot.svelte';
import BarOmitLegendDemo from '../../../../../stories/plots/bar/BarOmitLegendDemo.svelte';
import BarOmitStackedLegendDemo from '../../../../../stories/plots/bar/BarOmitStackedLegendDemo.svelte';
import { MALE_LIFE_EXPECTANCY_BY_PROVINCE } from '../../../../../stories/plots/bar/data';

// Omitting a series via the legend must reflow grouped/stacked bars exactly
// like a plain single-series render.

async function waitForSvg(container: Element): Promise<SVGElement> {
	let svg: SVGElement | undefined;
	await vi.waitFor(
		() => {
			svg = Array.from(container.querySelectorAll('svg')).find(
				(s) =>
					!s.classList.contains('dct-discrete__swatch') &&
					!s.classList.contains('dct-discrete__eye')
			);
			if (!svg || svg.querySelectorAll('g.bar-y rect').length === 0) {
				throw new Error('plot not yet rendered');
			}
		},
		{ timeout: 3000, interval: 50 }
	);
	return svg!;
}

function barTransforms(svg: SVGElement): string[] {
	return Array.from(svg.querySelectorAll('g.bar-y rect'))
		.map((r) => r.getAttribute('transform') ?? '')
		.sort();
}

function femaleLegendItem(container: Element): HTMLElement {
	const item = Array.from(container.querySelectorAll<HTMLElement>('[role="button"]')).find((el) =>
		el.textContent?.includes('Female')
	);
	if (!item) throw new Error('legend item "Female" not found');
	return item;
}

describe('BarPlot – omitting a series in grouped/stacked layout', () => {
	test('grouped: bars are actually grouped, and omitting "Female" reflows "Male" exactly like a plain single-series render', async () => {
		const { container } = await render(BarOmitLegendDemo);
		const svg = await waitForSvg(container);

		const beforeXs = Array.from(svg.querySelectorAll('g.bar-y rect')).map(
			(r) => r.getAttribute('transform')?.match(/translate\(([\d.]+)/)?.[1]
		);
		expect(new Set(beforeXs).size).toBe(beforeXs.length);

		femaleLegendItem(container).click();
		await vi.waitFor(() => {
			if (svg.querySelectorAll('g.bar-y rect').length !== MALE_LIFE_EXPECTANCY_BY_PROVINCE.length) {
				throw new Error('female bars not yet omitted');
			}
		});

		const { container: refContainer } = await render(BarPlot, {
			width: 950,
			height: 500,
			series: [{ name: 'male', x: 'province', y: 'value', data: MALE_LIFE_EXPECTANCY_BY_PROVINCE }],
			scales: { grouping: { seriesLayout: 'grouped' } }
		});
		const refSvg = await waitForSvg(refContainer);

		expect(barTransforms(svg)).toEqual(barTransforms(refSvg));
	});

	test('stacked: omitting "Female" reflows "Male" exactly like a plain single-series render, not a gap left in its old segment', async () => {
		const { container } = await render(BarOmitStackedLegendDemo);
		const svg = await waitForSvg(container);

		femaleLegendItem(container).click();
		await vi.waitFor(() => {
			if (svg.querySelectorAll('g.bar-y rect').length !== MALE_LIFE_EXPECTANCY_BY_PROVINCE.length) {
				throw new Error('female bars not yet omitted');
			}
		});

		const { container: refContainer } = await render(BarPlot, {
			width: 950,
			height: 500,
			series: [{ name: 'male', x: 'province', y: 'value', data: MALE_LIFE_EXPECTANCY_BY_PROVINCE }],
			scales: { grouping: { seriesLayout: 'stacked' } }
		});
		const refSvg = await waitForSvg(refContainer);

		expect(barTransforms(svg)).toEqual(barTransforms(refSvg));
	});
});
