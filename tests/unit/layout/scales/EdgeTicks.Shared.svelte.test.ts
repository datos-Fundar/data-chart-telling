import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { waitForSvg } from '../../plots/_helpers/svg';

const YEARS = [1869, 1880, 1895, 1905, 1923];
const ROWS = YEARS.map((year, i) => ({ year, value: 10 + i * 5 }));
const props = {
	width: 600,
	height: 300,
	legend: false,
	data: ROWS,
	x: 'year',
	y: 'value',
	timeline: { accessor: 'year', scales: 'shared' }
};
const xLabels = (container: Element) =>
	[...container.querySelectorAll('g.x-axis g.tick text, [class*="axis-x"] g.tick text')].map((t) =>
		t.textContent?.trim()
	);

describe('Edge ticks on a domain the timeline shares', () => {
	test('draw the first and last values when the author leaves `nice` off', async () => {
		const { container } = await render(LinePlot, {
			...props,
			scales: { x: { nice: false, edgeTicks: { collision: 'drop-nice' } } }
		} as never);
		await waitForSvg(container);
		await vi.waitFor(() => {
			const labels = xLabels(container);
			expect(labels).toContain('1869');
			expect(labels).toContain('1923');
		});
	});

	test('are off when the author pins `scales.x.domain`', async () => {
		const { container } = await render(LinePlot, {
			...props,
			scales: { x: { domain: [1860, 1930], edgeTicks: { collision: 'drop-nice' } } }
		} as never);
		await waitForSvg(container);
		await vi.waitFor(() => expect(xLabels(container).length).toBeGreaterThan(0));
		expect(xLabels(container)).not.toContain('1869');
		expect(xLabels(container)).not.toContain('1923');
	});
});
