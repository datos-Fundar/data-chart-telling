import type { PlotRowContext } from '$lib/types/layout/context';
import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import BarPlot from '$lib/plots/ranking/bar/Plot.svelte';
import { waitForSvg } from '../../_helpers/svg';

const ROWS = [
	{ bar: 'Q1', group: 'food', share: 25 },
	{ bar: 'Q1', group: 'housing', share: 23 },
	{ bar: 'Q2', group: 'food', share: 21 },
	{ bar: 'Q2', group: 'housing', share: 22 }
];
const props = {
	width: 400,
	height: 300,
	data: ROWS,
	x: 'bar',
	y: 'share',
	color: 'group',
	transforms: [{ type: 'stackY' }]
};

describe('BarPlot - the row a value label is written from', () => {
	test('`values.format` gets the row, with the fields of the data, along with the value and the series', async () => {
		const calls: { value: number; series: string; row?: Record<string, unknown> }[] = [];
		const { container } = await render(BarPlot, {
			...props,
			styles: {
				values: {
					show: true,
					layout: 'box',
					format: (
						value: number,
						_number: unknown,
						{ series, row }: { series?: string; row?: Record<string, unknown> }
					) => {
						calls.push({ value, series: series!, row });
						return `${value}`;
					}
				}
			}
		} as never);
		await waitForSvg(container);
		await vi.waitFor(() => expect(calls.length).toBeGreaterThanOrEqual(4));
		// Each label is its row's own value, not the running total of the stack.
		for (const { value, series, row } of calls) {
			expect(row?.group).toBe(series);
			expect(row?.share).toBe(value);
			expect(['Q1', 'Q2']).toContain(row?.bar);
		}
	});

	test('a format that gives no text for some rows leaves those pieces unlabelled', async () => {
		const { container } = await render(BarPlot, {
			...props,
			styles: {
				values: {
					show: true,
					layout: 'box',
					format: (value: number, _number: unknown, context: PlotRowContext) =>
						context.row?.bar === 'Q1' && context.row?.group === 'housing' ? `${value} %` : ''
				}
			}
		} as never);
		await waitForSvg(container);
		await vi.waitFor(() => {
			const labels = [...container.querySelectorAll('text')]
				.map((text) => text.textContent?.trim())
				.filter((text) => text?.endsWith('%'));
			expect(labels).toEqual(['23 %']);
		});
	});
});
