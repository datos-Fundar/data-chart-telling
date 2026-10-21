import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import DensityPlot from '$lib/plots/distribution/density/Plot.svelte';
import { waitForSvg } from '../../_helpers/svg';

const rows = Array.from({ length: 40 }, (_, i) => ({
	v: 10 + ((i * 7) % 23),
	g: i % 2 === 0 ? 'A' : 'B'
}));

const base = { width: 400, height: 300, data: rows };

/** The paths svelteplot draws for one mark kind: areas carry the class `area`, lines sit in `g.lines`. */
function paths(svg: SVGElement, kind: 'areas' | 'lines') {
	return Array.from(svg.querySelectorAll(kind === 'areas' ? 'path.area' : 'g.lines path'));
}

describe('DensityPlot', () => {
	test('draws one filled area for a flat plot', async () => {
		const { container } = render(DensityPlot, { ...base, x: 'v' });
		const svg = await waitForSvg(container);
		expect(paths(svg, 'areas')).toHaveLength(1);
		expect(paths(svg, 'lines')).toHaveLength(0);
	});

	test('grouping draws one area per group', async () => {
		const { container } = render(DensityPlot, { ...base, x: 'v', grouping: 'g' });
		const svg = await waitForSvg(container);
		expect(paths(svg, 'areas')).toHaveLength(2);
	});

	test('`styles.mark: "line"` draws lines instead of areas', async () => {
		const { container } = render(DensityPlot, {
			...base,
			x: 'v',
			grouping: 'g',
			styles: { mark: 'line' }
		});
		const svg = await waitForSvg(container);
		expect(paths(svg, 'lines')).toHaveLength(2);
		expect(paths(svg, 'areas')).toHaveLength(0);
	});

	test('a plot given only `y` draws a horizontal curve growing from the left', async () => {
		const { container } = render(DensityPlot, { ...base, y: 'v' });
		const svg = await waitForSvg(container);
		const [area] = paths(svg, 'areas');
		const box = area.getBoundingClientRect();
		expect(box.height).toBeGreaterThan(box.width / 4);
		const axis = svg.querySelector('g.axis-y')!.getBoundingClientRect();
		expect(box.left).toBeGreaterThanOrEqual(axis.left);
	});

	test('a `densityX` transform given here is merged over the default one', async () => {
		const narrow = render(DensityPlot, {
			...base,
			x: 'v',
			transforms: [{ type: 'densityX' as const, bandwidth: 0.5 }]
		});
		const wide = render(DensityPlot, {
			...base,
			x: 'v',
			transforms: [{ type: 'densityX' as const, bandwidth: 8 }]
		});
		const [a] = paths(await waitForSvg(narrow.container), 'areas');
		const [b] = paths(await waitForSvg(wide.container), 'areas');
		expect(a.getAttribute('d')).not.toBe(b.getAttribute('d'));
	});

	test('a series-based plot estimates each series on its own', async () => {
		const { container } = render(DensityPlot, {
			width: 400,
			height: 300,
			series: [
				{ name: 'A', x: 'v', y: 'v', data: rows.filter((r) => r.g === 'A') },
				{ name: 'B', x: 'v', y: 'v', data: rows.filter((r) => r.g === 'B') }
			]
		});
		const svg = await waitForSvg(container);
		expect(paths(svg, 'areas')).toHaveLength(2);
	});
});
