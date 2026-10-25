import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import { waitForSvg, countDotMarks } from '../../_helpers/svg';

const rows = [
	{ period: '1991', group: 'Young', share: 19 },
	{ period: '2022', group: 'Young', share: 17.4 },
	{ period: '1991', group: 'Old', share: 16.5 },
	{ period: '2022', group: 'Old', share: 18.9 }
];

const props = { width: 500, height: 300, data: rows, x: 'period', y: 'share', color: 'group' };

describe('SlopePlot', () => {
	test('draws a line per series with a dot at each of its two ends', async () => {
		const { container } = render(SlopePlot, props);
		const svg = await waitForSvg(container);
		expect(svg.querySelectorAll('g.lines path')).toHaveLength(2);
		expect(countDotMarks(svg)).toBe(4);
	});

	test('labels both ends of every series', async () => {
		const { container } = render(SlopePlot, { ...props, styles: { values: { show: true } } });
		const svg = await waitForSvg(container);
		const texts = Array.from(svg.querySelectorAll('g.text text')).map((t) => t.textContent);
		expect(texts.sort()).toEqual(['Old - 16.5', 'Old - 18.9', 'Young - 17.4', 'Young - 19']);
	});

	test('writes the first labels before their dots and the last ones after', async () => {
		const { container } = render(SlopePlot, { ...props, styles: { values: { show: true } } });
		const svg = await waitForSvg(container);
		const anchors = new Map(
			Array.from(svg.querySelectorAll('g.text text')).map((t) => [
				t.textContent,
				getComputedStyle(t).textAnchor
			])
		);
		expect(anchors.get('Young - 19')).toBe('end');
		expect(anchors.get('Young - 17.4')).toBe('start');
	});

	test('routes the connector of a spread-apart label from the middle of its position', async () => {
		const close = [
			{ period: '1991', group: 'Young', share: 10 },
			{ period: '2022', group: 'Young', share: 18.1 },
			{ period: '1991', group: 'Old', share: 20 },
			{ period: '2022', group: 'Old', share: 18 }
		];
		const { container } = render(SlopePlot, {
			...props,
			data: close,
			styles: { values: { show: true } }
		});
		const svg = await waitForSvg(container);
		const connectors = Array.from(svg.querySelectorAll('path[stroke-linecap="square"]')).map(
			(path) => path.getBoundingClientRect()
		);
		const centres = Array.from(svg.querySelectorAll('g.dot path')).map((dot) => {
			const box = dot.getBoundingClientRect();
			return box.left + box.width / 2;
		});
		// A connector runs out from its dot, to either side.
		const near = (x: number, edge: number) => Math.abs(x - edge) < 1.5;
		const fromDot = (box: DOMRect) => centres.some((x) => near(x, box.left) || near(x, box.right));
		expect(connectors.length).toBeGreaterThan(0);
		expect(connectors.every(fromDot)).toBe(true);
	});

	test('hovering a label dims the other series when `hoverIsolate` is on', async () => {
		const { container } = render(SlopePlot, {
			...props,
			styles: { values: { show: true, hoverIsolate: true } }
		});
		const svg = await waitForSvg(container);
		const dotOpacities = () =>
			Array.from(svg.querySelectorAll('g.dot path')).map((dot) =>
				Number(getComputedStyle(dot).fillOpacity)
			);
		expect(dotOpacities().every((opacity) => opacity === 1)).toBe(true);
		const label = Array.from(svg.querySelectorAll('g.text text')).find((t) =>
			t.textContent?.startsWith('Young')
		)!;
		label.closest('g[role="presentation"]')!.dispatchEvent(new PointerEvent('pointerenter'));
		await vi.waitFor(() => {
			const other = Array.from(container.querySelectorAll('g.text text')).find((t) =>
				t.textContent?.startsWith('Old')
			);
			expect(other?.getAttribute('style')).toContain('fill-opacity: 0.12');
		});
		// The line and dots of the other series dim with its label.
		await vi.waitFor(() => {
			const now = container.querySelector('.dct-plot svg')!;
			const strokes = Array.from(now.querySelectorAll('g.lines path')).map(
				(line) => getComputedStyle(line).strokeOpacity
			);
			const fills = Array.from(now.querySelectorAll('g.dot path')).map(
				(dot) => getComputedStyle(dot).fillOpacity
			);
			expect(strokes.map(Number).sort()).toEqual([0.12, 1]);
			expect(fills.map(Number).sort()).toEqual([0.12, 0.12, 1, 1]);
		});
	});
});
