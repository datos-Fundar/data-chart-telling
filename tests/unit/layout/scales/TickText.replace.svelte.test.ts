import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { waitForSvg } from '../../plots/_helpers/svg';

const LONG = 'Ciudad Autónoma de Buenos Aires';
const data = [LONG, 'Córdoba', 'Jujuy', 'Salta'].map((name, i) => ({ name, value: 10 + i * 5 }));

const drawn = (svg: SVGElement) =>
	[...svg.querySelectorAll('text')].map((text) => text.textContent ?? '');

describe('scales.y.replace', () => {
	test('swaps text in the labels of a category axis', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 240,
			data,
			x: 'value',
			y: 'name',
			scales: { y: { replace: { [LONG]: 'CABA' } }, x: { nice: false } }
		} as never);
		const svg = await waitForSvg(container);
		await vi.waitFor(() => expect(drawn(svg)).toContain('CABA'));
		expect(drawn(svg)).not.toContain(LONG);
		expect(drawn(svg)).toContain('Jujuy');
	});

	test('goes before the cut, and the margin is kept for what the swaps left', async () => {
		const { container } = await render(BarPlot, {
			width: 400,
			height: 240,
			data,
			x: 'value',
			y: 'name',
			scales: { y: { replace: { [LONG]: 'CABA' }, maxWidth: 200 }, x: { nice: false } }
		} as never);
		const svg = await waitForSvg(container);
		await vi.waitFor(() => expect(drawn(svg)).toContain('CABA'));
		const left = svg.getBoundingClientRect().left;
		const bars = [...svg.querySelectorAll('g.bar-x rect, g.bar-y rect')];
		const margin = Math.min(...bars.map((bar) => bar.getBoundingClientRect().left)) - left;
		// "Córdoba" is the widest label left: far from the 200px cap, and from the long name's room.
		expect(margin).toBeLessThan(120);
	});
});
