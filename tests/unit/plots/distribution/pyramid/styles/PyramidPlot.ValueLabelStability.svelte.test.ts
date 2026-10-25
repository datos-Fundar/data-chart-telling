import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import PyramidPlot from '$lib/plots/distribution/pyramid/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { waitForSvg } from '../../../_helpers/svg';

function seriesWithMax(max: number) {
	return {
		data: [
			{ ageGroup: 'A', pct: max, sex: 'female' },
			{ ageGroup: 'A', pct: max * 0.8, sex: 'male' }
		],
		x: 'pct' as const,
		y: 'ageGroup' as const,
		color: 'sex' as const
	};
}

function frameX(container: Element): number {
	return Number(
		container
			.querySelector('rect.frame')
			?.getAttribute('transform')
			?.match(/translate\(([\d.]+)/)?.[1]
	);
}

describe('PyramidPlot - outside-anchored value labels reserve room up front', () => {
	test('the left margin already fits the widest label on the very first render', async () => {
		const withLabels = await render(PyramidPlot, {
			width: 500,
			height: 300,
			...seriesWithMax(87),
			styles: { values: { show: true }, frame: true } satisfies AxisBasedStylesConfig
		});
		const withoutLabels = await render(PyramidPlot, {
			width: 500,
			height: 300,
			...seriesWithMax(87),
			styles: { frame: true } satisfies AxisBasedStylesConfig
		});
		await waitForSvg(withLabels.container);
		await waitForSvg(withoutLabels.container);
		expect(frameX(withLabels.container)).toBeGreaterThan(frameX(withoutLabels.container));
	});

	test('does not remount the plot when the data changes to a smaller value', async () => {
		const { container, rerender } = await render(PyramidPlot, {
			width: 500,
			height: 300,
			...seriesWithMax(87),
			styles: { values: { show: true }, frame: true } satisfies AxisBasedStylesConfig
		});
		const svg = await waitForSvg(container);
		await new Promise((r) => setTimeout(r, 300));

		await rerender({ ...seriesWithMax(12) });
		await new Promise((r) => setTimeout(r, 300));

		expect(svg.isConnected).toBe(true);
		expect(container.querySelector('.dct-plot svg')).toBe(svg);
	});
});
