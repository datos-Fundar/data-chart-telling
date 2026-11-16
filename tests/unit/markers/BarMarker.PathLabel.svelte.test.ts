import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import Plot from '$lib/plots/generic/Plot.svelte';
import { waitForSvg } from '../plots/_helpers/svg';

const ROWS = [
	{ name: 'up', value: 3 },
	{ name: 'down', value: -2 }
];

async function draw(label: Record<string, unknown>) {
	const { container } = await render(Plot, {
		width: 400,
		height: 300,
		scales: { x: { type: 'band', domain: ['up', 'down'] }, y: { domain: [-4, 4] } },
		markers: [
			{
				type: 'bar',
				role: 'segment',
				data: ROWS,
				x: 'name',
				y1: 0,
				y2: 'value',
				label: {
					layout: 'path',
					text: (d: { name: string }) => `label ${d.name}`,
					styles: { fill: 'black' },
					...label
				}
			}
		]
	} as never);
	const svg = await waitForSvg(container);
	const box = (selector: string, text?: string) => {
		const el = [...svg.querySelectorAll<SVGGraphicsElement>(selector)].find(
			(node) => text === undefined || node.textContent === text
		);
		return el?.getBoundingClientRect();
	};
	await expect.poll(() => box('text', 'label down')).toBeTruthy();
	const bars = [...svg.querySelectorAll<SVGGraphicsElement>('g.bar-y rect, g.bar-y path')].map(
		(el) => el.getBoundingClientRect()
	);
	const [up, down] = [...bars].sort((a, b) => a.left - b.left);
	return { up, down, upText: box('text', 'label up')!, downText: box('text', 'label down')! };
}

describe('a bar marker - path labels', () => {
	test("'tip' is the end each row's value runs to, whatever its sign", async () => {
		const { up, down, upText, downText } = await draw({ edge: 'tip' });
		expect(upText.bottom).toBeLessThanOrEqual(up.top + 1);
		expect(downText.top).toBeGreaterThanOrEqual(down.bottom - 1);
	});

	test("'base' is the end at zero", async () => {
		const { up, down, upText, downText } = await draw({ edge: 'base', side: 'inside' });
		expect(Math.abs(upText.bottom - up.bottom)).toBeLessThan(8);
		expect(Math.abs(downText.top - down.top)).toBeLessThan(8);
	});
});

describe('a bar marker - path labels on the side facing the middle', () => {
	test("'inner' is the side facing the plot's middle across, 'outer' the other one", async () => {
		const inner = await draw({ edge: 'inner' });
		// 'up' stands on the left half, 'down' on the right one.
		expect(inner.upText.left).toBeGreaterThanOrEqual(inner.up.right - 1);
		expect(inner.downText.right).toBeLessThanOrEqual(inner.down.left + 1);

		const outer = await draw({ edge: 'outer' });
		expect(outer.upText.right).toBeLessThanOrEqual(outer.up.left + 1);
		expect(outer.downText.left).toBeGreaterThanOrEqual(outer.down.right - 1);
	});
});
