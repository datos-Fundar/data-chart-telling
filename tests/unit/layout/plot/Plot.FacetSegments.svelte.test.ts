import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import SlopePlot from '$lib/plots/evolution/slope/Plot.svelte';
import LinePlot from '$lib/plots/evolution/line/Plot.svelte';
import { waitForSvg } from '../../plots/_helpers/svg';
import { Pipeline } from '$lib/phases/Pipeline';

const RAMAS = ['Alimentos', 'Textiles', 'Química'];
const DATA = RAMAS.flatMap((sector, s) =>
	['Ciudad', 'País'].flatMap((region, r) =>
		[2004, 2024].map((year) => ({
			sector,
			region,
			year,
			value: 10 + s * 5 + r * 3 + (year - 2004) / 4
		}))
	)
);

/** A segment per panel: the panel it names draws its lines in `color`, or the default when it is `null`. */
const segments = (colors: Record<string, string>) => ({
	Ciudad: RAMAS.map((sector) => ({
		facet: sector,
		styles: { stroke: { stroke: colors[sector] } }
	}))
});

const lineStrokes = (container: Element) =>
	[...container.querySelectorAll('.dct-plot')].map((panel) =>
		[...panel.querySelectorAll<SVGPathElement>('g.lines path')].map(
			(p) => p.style.stroke || p.getAttribute('stroke')
		)
	);

describe.each([
	['SlopePlot', SlopePlot],
	['LinePlot', LinePlot]
] as const)('%s in a facet - only its segments change', (_name, Plot) => {
	test('every panel is repainted with the segment its panel names', async () => {
		const props = {
			width: 900,
			height: 500,
			data: DATA,
			x: 'year',
			y: 'value',
			color: 'region',
			facet: { by: 'sector', values: RAMAS, columns: 3 }
		};
		const { container, rerender } = await render(
			Plot as never,
			{
				...props,
				segments: segments({ Alimentos: 'red', Textiles: 'red', Química: 'red' })
			} as never
		);
		await waitForSvg(container);
		await vi.waitFor(() => {
			expect(container.querySelectorAll('.dct-plot')).toHaveLength(3);
		});

		// The same data and facet, other segments: the second panel is dimmed.
		await rerender({
			segments: segments({ Alimentos: 'red', Textiles: 'blue', Química: 'red' })
		} as never);
		await vi.waitFor(() => {
			const strokes = lineStrokes(container);
			expect(strokes[0].some((s) => s?.includes('red'))).toBe(true);
			expect(strokes[1].some((s) => s?.includes('blue'))).toBe(true);
			expect(strokes[1].some((s) => s?.includes('red'))).toBe(false);
		});
	});
});

describe('Plot - what makes the data phases run again', () => {
	/** Counts the runs of the data phases, over every row, of the plots drawn while it watches. */
	function countRuns() {
		const original = Pipeline.prototype.runData;
		const count = { runs: 0 };
		Pipeline.prototype.runData = function (this: Pipeline<never>, ...args) {
			count.runs++;
			return original.apply(this, args);
		};
		return { count, restore: () => (Pipeline.prototype.runData = original) };
	}

	const props = {
		width: 900,
		height: 500,
		data: DATA,
		x: 'year',
		y: 'value',
		color: 'region',
		facet: { by: 'sector', values: RAMAS, columns: 3 }
	};
	const settle = () => new Promise((resolve) => setTimeout(resolve, 400));

	test('other segments run them once more; the same ones built again, or a pointer, do not', async () => {
		const { count, restore } = countRuns();
		try {
			const { container, rerender, unmount } = await render(
				LinePlot as never,
				{
					...props,
					segments: segments({ Alimentos: 'red', Textiles: 'red', Química: 'red' })
				} as never
			);
			await waitForSvg(container);
			await settle();
			expect(count.runs).toBe(1);

			// Another segment: once more.
			await rerender({
				segments: segments({ Alimentos: 'red', Textiles: 'blue', Química: 'red' })
			} as never);
			await settle();
			expect(count.runs).toBe(2);

			// The same segments built again: nothing to read again.
			await rerender({
				segments: segments({ Alimentos: 'red', Textiles: 'blue', Química: 'red' })
			} as never);
			await settle();
			expect(count.runs).toBe(2);
			unmount();
		} finally {
			restore();
		}
	});
});
