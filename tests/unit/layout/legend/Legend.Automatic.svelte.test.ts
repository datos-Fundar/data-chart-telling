import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import { waitForSvg } from '../../plots/_helpers/svg';

const ROWS = [
	{ year: 2020, value: 1, sex: 'female' },
	{ year: 2021, value: 2, sex: 'female' },
	{ year: 2020, value: 3, sex: 'male' },
	{ year: 2021, value: 4, sex: 'male' }
];
const props = { width: 500, height: 300, data: ROWS, x: 'year', y: 'value', color: 'sex' };
const legendText = (container: Element) =>
	container.querySelector('.dct-figure-chrome__legend')?.textContent ?? null;

describe('Figure legend', () => {
	test('by default, a plot shows the legend it reads off its series', async () => {
		const { container } = await render(LinePlot, props as never);
		await waitForSvg(container);
		await vi.waitFor(() => {
			expect(legendText(container)).toContain('Female');
			expect(legendText(container)).toContain('Male');
		});
	});

	test('`legend: true` is the same automatic legend', async () => {
		const { container } = await render(LinePlot, { ...props, legend: true } as never);
		await vi.waitFor(() => expect(legendText(container)).toContain('Female'));
	});

	test('`legend: false` shows none', async () => {
		const { container } = await render(LinePlot, { ...props, legend: false } as never);
		await waitForSvg(container);
		await new Promise((r) => setTimeout(r, 200));
		expect(legendText(container)).toBeNull();
	});

	test('a single series shows none', async () => {
		const { container } = await render(LinePlot, {
			...props,
			color: undefined,
			data: ROWS.slice(0, 2)
		} as never);
		await waitForSvg(container);
		await new Promise((r) => setTimeout(r, 200));
		expect(legendText(container)).toBeNull();
	});

	test('a list of sections shows exactly those', async () => {
		const { container } = await render(LinePlot, {
			...props,
			legend: [{ type: 'discrete', items: [{ name: 'custom' }, { name: 'other' }] }]
		} as never);
		await vi.waitFor(() => expect(legendText(container)).toContain('Custom'));
		expect(legendText(container)).not.toContain('Female');
	});

	test('`{ items }` adds to the automatic legend instead of replacing it', async () => {
		const { container } = await render(LinePlot, {
			...props,
			legend: { items: [{ name: 'note', label: 'A note' }] }
		} as never);
		await vi.waitFor(() => {
			expect(legendText(container)).toContain('Female');
			expect(legendText(container)).toContain('A note');
		});
	});

	test('a segment and a marker that name themselves join the automatic legend', async () => {
		const { container } = await render(LinePlot, {
			...props,
			segments: {
				female: [
					{ areas: [{ x: { from: 2021 } }], styles: { stroke: 'gold' }, legend: 'Female, 2021 on' }
				]
			},
			markers: [{ type: 'rule', y: 2.5, legend: 'Threshold' }]
		} as never);
		await vi.waitFor(() => {
			expect(legendText(container)).toContain('Female, 2021 on');
			expect(legendText(container)).toContain('Threshold');
		});
	});
});
