import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LineOmitLegendDemo from '../../../../../stories/plots/line/LineOmitLegendDemo.svelte';

// Omitting one series via the legend must not recolor the remaining series.

function waitForPlotSvg(container: Element): Promise<SVGElement> {
	let svg: SVGElement | undefined;
	return vi
		.waitFor(
			() => {
				svg = Array.from(container.querySelectorAll('svg')).find(
					(s) =>
						!s.classList.contains('dct-discrete__swatch') &&
						!s.classList.contains('dct-discrete__eye')
				);
				if (!svg || svg.querySelectorAll('g.lines path').length === 0) {
					throw new Error('plot not yet rendered');
				}
			},
			{ timeout: 3000, interval: 50 }
		)
		.then(() => svg!);
}

function strokeColors(svg: SVGElement): (string | undefined)[] {
	return Array.from(svg.querySelectorAll<SVGPathElement>('g.lines path')).map(
		(p) => p.getAttribute('style')?.match(/stroke: (rgb\([^)]+\))/)?.[1]
	);
}

describe("LinePlot – omitting a series keeps the remaining one's color stable", () => {
	test('omitting "Female" does not recolor "Male"\' line', async () => {
		const { container } = await render(LineOmitLegendDemo);
		const svg = await waitForPlotSvg(container);

		const before = strokeColors(svg);
		expect(before).toHaveLength(2);
		const maleColorBefore = before[1];
		expect(maleColorBefore).toBeTruthy();

		const femaleItem = Array.from(container.querySelectorAll<HTMLElement>('[role="button"]')).find(
			(el) => el.textContent?.includes('Female')
		);
		expect(femaleItem).toBeTruthy();
		femaleItem!.click();

		await vi.waitFor(() => {
			if (strokeColors(svg).length !== 1) throw new Error('female line not yet omitted');
		});

		const after = strokeColors(svg);
		expect(after).toEqual([maleColorBefore]);
	});
});
