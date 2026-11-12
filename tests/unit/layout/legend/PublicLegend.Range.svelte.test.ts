import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import HeatmapPlot from '$lib/plots/correlation/heatmap/Plot.svelte';
import LegendRangeProbe from './LegendRangeProbe.svelte';
import { waitForSvg } from '../../plots/_helpers/svg';
import type { PublicLegend } from '$lib/layout/plot/PublicPlotContext';

const CELLS = Array.from({ length: 10 }, (_, i) => ({ x: `C${i}`, y: 'R', value: i * 10 }));

const valueOf = (container: Element, label: string) =>
	vi.waitFor(() => {
		const raw = container
			.querySelector(`rect[aria-label="${label}"]`)
			?.getAttribute('aria-valuenow');
		if (raw == null) throw new Error(`${label} handle not yet rendered`);
		return Number(raw);
	});

describe('useFigure().legend.setRange', () => {
	test('narrows the legend like dragging it: the handles and the range follow, and null resets', async () => {
		let legend: PublicLegend | null = null;
		const { container } = await render(HeatmapPlot, {
			width: 500,
			height: 300,
			data: CELLS,
			x: 'x',
			y: 'y',
			color: 'value',
			legend: { color: { interactive: { enabled: true, mode: 'rescale' } } },
			markers: [
				{
					type: 'component',
					component: LegendRangeProbe,
					props: {
						onLegend: (l: PublicLegend | null) => {
							legend = l;
						}
					}
				}
			]
		} as never);
		await waitForSvg(container);
		await vi.waitFor(() => expect(legend).not.toBeNull());
		await valueOf(container, 'Lower bound');
		expect(legend!.range).toBeNull();

		legend!.setRange([20, 60]);
		await vi.waitFor(async () => {
			expect(await valueOf(container, 'Lower bound')).toBe(20);
			expect(await valueOf(container, 'Upper bound')).toBe(60);
		});
		expect(legend!.range).toMatchObject({ min: 20, max: 60, mode: 'rescale' });

		legend!.setRange(null);
		await vi.waitFor(() => expect(legend!.range).toBeNull());
		await vi.waitFor(async () => {
			expect(await valueOf(container, 'Lower bound')).toBe(0);
		});
	});
});
