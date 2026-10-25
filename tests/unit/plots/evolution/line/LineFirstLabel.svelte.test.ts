import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { waitForSvg } from '../../_helpers/svg';

const data = [2008, 2009, 2010].map((year, i) => ({ year, value: 70 + i * 3 }));
const props = { width: 500, height: 300, data, x: 'year', y: 'value' };
const connectors = (svg: SVGElement) => svg.querySelectorAll('path[stroke-linecap="square"]');

describe('LinePlot value labels', () => {
	test("a label on a series' first point goes out to a lane, clear of its line", async () => {
		const { container } = render(LinePlot, {
			...props,
			styles: { values: { show: true, select: ['first', 'last'] } }
		});
		const svg = await waitForSvg(container);
		expect(connectors(svg)).toHaveLength(1);
		const dot = svg.querySelector('g.lines path')!.getBoundingClientRect();
		const [first] = Array.from(svg.querySelectorAll('g.text text')).map((t) =>
			t.getBoundingClientRect()
		);
		// Out past the start of the line by more than the gap beside a last point's label.
		expect(first.left - dot.left).toBeGreaterThan(20);
	});

	test("a label on a series' last point stays beside it", async () => {
		const { container } = render(LinePlot, { ...props, styles: { values: { show: true } } });
		expect(connectors(await waitForSvg(container))).toHaveLength(0);
	});
});

describe('LinePlot value labels set before their point', () => {
	/** The left margin the plot settled on. */
	async function leftMargin(select?: 'last' | 'first') {
		const { container } = render(LinePlot, {
			...props,
			styles: { values: { show: true, anchor: 'end', select } }
		});
		const svg = await waitForSvg(container);
		await new Promise((resolve) => setTimeout(resolve, 400));
		return (
			svg.querySelector('g.lines path')!.getBoundingClientRect().left -
			svg.getBoundingClientRect().left
		);
	}

	test("a last point's label leaves the left margin alone", async () => {
		expect(await leftMargin('last')).toBeLessThan(await leftMargin('first'));
	});
});
