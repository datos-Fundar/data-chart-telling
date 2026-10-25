import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';

type Row = { metric: string; year: number; value: number };
const DATA: Row[] = ['GDP', 'Employment'].flatMap((metric, i) =>
	[2018, 2019, 2020].map((year, j) => ({ metric, year, value: 10 + i * 5 + j }))
);

describe('Plot - own legend', () => {
	test('toggling a legend item dims its series in the plot', async () => {
		const { container } = await render(LinePlot, {
			width: 500,
			height: 300,
			data: DATA,
			x: 'year',
			y: 'value',
			color: 'metric',
			legend: [
				{
					type: 'discrete',
					interactive: { enabled: true, disabled: { mode: 'dim', style: { opacity: 0.1 } } },
					items: [
						{ name: 'GDP', symbol: 'line' },
						{ name: 'Employment', symbol: 'line' }
					]
				}
			]
		});
		await vi.waitFor(() => expect(container.querySelectorAll('.dct-plot path').length).toBe(2));
		const item = [...container.querySelectorAll('[role="button"], button')].find((el) =>
			el.textContent?.includes('Employment')
		) as HTMLElement;
		item.click();
		await vi.waitFor(() => {
			const opacities = [...container.querySelectorAll<SVGPathElement>('.dct-plot path')].map(
				(p) => p.style.strokeOpacity
			);
			expect(opacities).toEqual(['1', '0.1']);
		});
	});
});
