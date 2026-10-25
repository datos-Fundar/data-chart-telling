import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import SparklinePlot from '$lib/plots/evolution/sparkline/Plot.svelte';
import { waitForSvg, countDotMarks, countLinePaths } from '../../_helpers/svg';

const rows = [2020, 2021, 2022, 2023].flatMap((year, i) => [
	{ year, group: 'a', value: 10 + i },
	{ year, group: 'b', value: 20 - i }
]);
const props = { width: 300, height: 100, data: rows, x: 'year', y: 'value', color: 'group' };

describe('SparklinePlot', () => {
	test('draws a line per series and a dot on its last point only', async () => {
		const { container } = render(SparklinePlot, props);
		const svg = await waitForSvg(container);
		expect(countLinePaths(svg)).toBe(2);
		expect(countDotMarks(svg)).toBe(2);
	});

	test("writes each series' last value beside its dot", async () => {
		const { container } = render(SparklinePlot, props);
		const svg = await waitForSvg(container);
		const labels = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(labels.sort()).toEqual(['13', '17']);
	});

	test('`show: false` leaves the value out', async () => {
		const { container } = render(SparklinePlot, { ...props, styles: { values: { show: false } } });
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.text text')).toHaveLength(0);
	});

	test('has no axes and no legend, which `legend: true` brings back', async () => {
		const plain = render(SparklinePlot, props);
		const svg = await waitForSvg(plain.container);
		expect(svg.querySelectorAll('g.axis-x, g.axis-y')).toHaveLength(0);
		const withLegend = render(SparklinePlot, { ...props, legend: true });
		await waitForSvg(withLegend.container);
		const names = (c: Element) => c.textContent?.includes('B') ?? false;
		await vi.waitFor(() => expect(names(withLegend.container)).toBe(true));
		expect(names(plain.container)).toBe(false);
	});

	test('a `hover` marker answers the pointer', async () => {
		const { container } = render(SparklinePlot, {
			...props,
			markers: [{ type: 'hover' as const }]
		});
		const svg = await waitForSvg(container);
		const resting = countDotMarks(svg);
		const area = svg.querySelector('rect[pointer-events="all"]')!;
		const box = area.getBoundingClientRect();
		const init = {
			clientX: box.left + box.width * 0.2,
			clientY: box.top + box.height / 2,
			bubbles: true
		};
		area.dispatchEvent(new PointerEvent('pointermove', init));
		area.dispatchEvent(new MouseEvent('mousemove', init));
		await vi.waitFor(() => expect(countDotMarks(svg)).toBeGreaterThan(resting));
	});
});
