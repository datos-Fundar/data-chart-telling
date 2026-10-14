import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import LinePlot from '$lib/plots/line/Plot.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { waitForSvg } from '../../_helpers/svg';

// A pinned `scales.y.domain` (the shape a timeline-scrubbing caller uses -
// see `ValueLabels.reachAtSeriesEnds`) is what
// lets the floor stay stable across `data` revealing more of the same
// range, tick by tick, instead of tracking whatever's currently visible.
const renderProps = {
	width: 400,
	height: 300,
	styles: { values: { show: true }, frame: true } satisfies AxisBasedStylesConfig,
	scales: { y: { domain: [0, 1_000_000] as [number, number] } }
};

function seriesUpTo(year: number) {
	const years = [2016, 2017, 2018, 2019, 2020].filter((y) => y <= year);
	return [
		{
			name: 'a',
			x: 'year' as const,
			y: 'value' as const,
			data: years.map((y) => ({ year: y, value: y * 100 }))
		},
		{
			name: 'b',
			x: 'year' as const,
			y: 'value' as const,
			data: years.map((y) => ({ year: y, value: y * 50 }))
		}
	];
}

describe('LinePlot - rightward value labels reserve room up front', () => {
	test("the right margin already fits the pinned domain's widest label on the very first render", async () => {
		const withLabels = await render(LinePlot, { ...renderProps, series: seriesUpTo(2016) });
		const withoutLabels = await render(LinePlot, {
			...renderProps,
			series: seriesUpTo(2016),
			styles: { frame: true } satisfies AxisBasedStylesConfig
		});
		await waitForSvg(withLabels.container);
		await waitForSvg(withoutLabels.container);
		const width = (c: Element) => Number(c.querySelector('rect.frame')?.getAttribute('width'));
		expect(width(withLabels.container)).toBeLessThan(width(withoutLabels.container));
	});

	test('settles onto a stable margin within the first tick of a timeline scrubber, not one per tick', async () => {
		// The precomputed floor gets the plot within ~1-2px on mount and on
		// every subsequent tick - close enough that the residual DOM-measured
		// fallback (see `PlotMargins.watch`) needs at most one more
		// correction, on whichever render first has real declutter/connector
		// geometry to measure, not one on every tick thereafter. Before the
		// floor existed, *every* tick below remounted (verified by diffing
		// against the pre-floor implementation) - this asserts the fix: at
		// most one remount total across the whole scrub, and only in this
		// first stretch.
		const { container, rerender } = await render(LinePlot, {
			...renderProps,
			series: seriesUpTo(2016)
		});
		await waitForSvg(container);
		await new Promise((r) => setTimeout(r, 300));

		await rerender({ series: seriesUpTo(2017) });
		await new Promise((r) => setTimeout(r, 300));
		const svg = container.querySelector('.dct-plot svg')!;

		for (const year of [2018, 2019, 2020]) {
			await rerender({ series: seriesUpTo(year) });
			await new Promise((r) => setTimeout(r, 150));
		}

		expect(svg.isConnected).toBe(true);
		expect(container.querySelector('.dct-plot svg')).toBe(svg);
	});
});

describe('LinePlot - leftward value labels reserve room up front', () => {
	test("the left margin already fits the pinned domain's widest label on the very first render", async () => {
		const props = {
			...renderProps,
			styles: {
				values: { show: true, anchor: 'end' as const },
				frame: true
			} satisfies AxisBasedStylesConfig,
			series: seriesUpTo(2016)
		};
		const withLabels = await render(LinePlot, props);
		const withoutLabels = await render(LinePlot, {
			...props,
			styles: { frame: true } satisfies AxisBasedStylesConfig
		});
		await waitForSvg(withLabels.container);
		await waitForSvg(withoutLabels.container);
		const width = (c: Element) => Number(c.querySelector('rect.frame')?.getAttribute('width'));
		expect(width(withLabels.container)).toBeLessThan(width(withoutLabels.container));
	});
});

describe("LinePlot - a value label's own vertical reach reserves room up front", () => {
	// A value pinned at the y domain's own top extreme.
	function seriesAtTop() {
		return [
			{
				name: 'a',
				x: 'year' as const,
				y: 'value' as const,
				data: [{ year: 2016, value: 1_000_000 }]
			}
		];
	}

	test('the top margin already fits the label on the very first render', async () => {
		// `label: false` isolates this test from the y-axis's own auto-title
		// (a real string field name, 'value', now that it's forwarded raw -
		// see the axis-title fix) - this test is about the value label's own
		// margin reservation specifically, not about axis titles, and the
		// title would otherwise already reserve some of the same top margin
		// in both renders, shrinking the gap this assertion looks for.
		const scales = { y: { domain: [0, 1_000_000] as [number, number], label: false as const } };
		const withLabels = await render(LinePlot, { ...renderProps, scales, series: seriesAtTop() });
		const withoutLabels = await render(LinePlot, {
			...renderProps,
			scales,
			series: seriesAtTop(),
			styles: { frame: true } satisfies AxisBasedStylesConfig
		});
		await waitForSvg(withLabels.container);
		await waitForSvg(withoutLabels.container);
		const height = (c: Element) => Number(c.querySelector('rect.frame')?.getAttribute('height'));
		expect(height(withLabels.container)).toBeLessThan(height(withoutLabels.container));
	});

	test('settles without a remount as a timeline scrubber reveals more of the pinned domain', async () => {
		function seriesUpToAtTop(year: number) {
			const years = [2016, 2017, 2018, 2019, 2020].filter((y) => y <= year);
			return [
				{
					name: 'a',
					x: 'year' as const,
					y: 'value' as const,
					data: years.map((y) => ({ year: y, value: y === 2016 ? 1_000_000 : y * 100 }))
				}
			];
		}
		const { container, rerender } = await render(LinePlot, {
			...renderProps,
			series: seriesUpToAtTop(2016)
		});
		await waitForSvg(container);
		await new Promise((r) => setTimeout(r, 300));

		await rerender({ series: seriesUpToAtTop(2017) });
		await new Promise((r) => setTimeout(r, 300));
		const svg = container.querySelector('.dct-plot svg')!;

		for (const year of [2018, 2019, 2020]) {
			await rerender({ series: seriesUpToAtTop(year) });
			await new Promise((r) => setTimeout(r, 150));
		}

		expect(svg.isConnected).toBe(true);
		expect(container.querySelector('.dct-plot svg')).toBe(svg);
	});
});
