import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LinePlotMarginsProbe from './LinePlotMarginsProbe.svelte';
import type { AxisBasedStylesConfig } from '$lib/types/layout/styles';
import { waitForSvg } from '../../_helpers/svg';

// Clustered final-year values - several declutter lanes are needed there,
// reaching well past the content box on the right, exactly the shape of
// overflow a timeline-scrubbing caller wants to capture once (at its
// "reference" render) and hold fixed afterwards via `bind:margins`.
const CLUSTERED = [
	{
		name: 'a',
		x: 'year' as const,
		y: 'value' as const,
		data: [
			{ year: 2016, value: 1 },
			{ year: 2017, value: 3 },
			{ year: 2018, value: 6 },
			{ year: 2019, value: 8 },
			{ year: 2020, value: 4.9 }
		]
	},
	{
		name: 'b',
		x: 'year' as const,
		y: 'value' as const,
		data: [
			{ year: 2016, value: 18 },
			{ year: 2017, value: 14 },
			{ year: 2018, value: 10 },
			{ year: 2019, value: 7 },
			{ year: 2020, value: 5.0 }
		]
	},
	{
		name: 'c',
		x: 'year' as const,
		y: 'value' as const,
		data: [
			{ year: 2016, value: 9 },
			{ year: 2017, value: 11 },
			{ year: 2018, value: 2 },
			{ year: 2019, value: 15 },
			{ year: 2020, value: 5.1 }
		]
	}
];

// Widely spaced, single point per series - nothing to declutter, no lane
// reach, nothing that should ever need extra margin on its own. Kept clear
// of the y domain's own edges (0-20) so it doesn't incidentally trigger its
// own top/bottom overflow - this fixture is only testing what `bind:margins`
// is actually scoped to (left/right, per the caller's own use case), not
// every side a value label could ever overflow.
const SETTLED = [
	{ name: 'a', x: 'year' as const, y: 'value' as const, data: [{ year: 2016, value: 8 }] },
	{ name: 'b', x: 'year' as const, y: 'value' as const, data: [{ year: 2016, value: 12 }] }
];

const renderProps = {
	width: 400,
	height: 300,
	styles: { values: { show: true }, frame: true } satisfies AxisBasedStylesConfig,
	scales: { y: { domain: [0, 20] as [number, number] } }
};

function probeMargins(container: Element): unknown {
	const raw = container
		.querySelector('[data-testid="margins-probe"]')
		?.getAttribute('data-margins');
	return raw ? JSON.parse(raw) : null;
}

describe('LinePlot - bindable margins (capture-and-freeze)', () => {
	test('never trips effect_update_depth_exceeded while the margin settles', async () => {
		const errors: unknown[][] = [];
		const spy = vi.spyOn(console, 'error').mockImplementation((...args) => {
			errors.push(args);
		});
		try {
			await render(LinePlotMarginsProbe, { ...renderProps, series: CLUSTERED });
			// The read-write cycle (if it looped) would trip within the first
			// several settle frames, well inside this window.
			await new Promise((r) => setTimeout(r, 800));
		} finally {
			spy.mockRestore();
		}
		const messages = errors.map((args) => args.map(String).join(' ')).join('\n');
		expect(messages).not.toMatch(/effect_update_depth_exceeded/);
	});

	test('bind:margins captures the resolved margin once it settles', async () => {
		// A precomputed floor (from the pinned `scales.y.domain`) seeds the
		// tracker synchronously, so capture no longer waits on DOM-measured
		// overflow to arrive asynchronously - no assertion of "still null right
		// after mount" here, unlike before that floor existed.
		const { container } = await render(LinePlotMarginsProbe, { ...renderProps, series: CLUSTERED });
		await waitForSvg(container);
		await new Promise((r) => setTimeout(r, 600));
		const captured = probeMargins(container) as { right?: number } | null;
		expect(captured).not.toBeNull();
		expect(captured!.right).toBeGreaterThan(0);
	});

	test('a captured margin stays fixed across a later render with different (simpler) data', async () => {
		const { container, rerender } = await render(LinePlotMarginsProbe, {
			...renderProps,
			series: CLUSTERED
		});
		await waitForSvg(container);
		await new Promise((r) => setTimeout(r, 600));
		const capturedWidth = Number(container.querySelector('rect.frame')?.getAttribute('width'));
		const capturedMargins = probeMargins(container);

		await rerender({ ...renderProps, series: SETTLED });
		await new Promise((r) => setTimeout(r, 600));

		// The bound `margins` value itself never changed...
		expect(probeMargins(container)).toEqual(capturedMargins);
		// ...and neither did the rendered content box, even though `SETTLED`
		// on its own would need far less room.
		const afterWidth = Number(container.querySelector('rect.frame')?.getAttribute('width'));
		expect(afterWidth).toBe(capturedWidth);
	});
});
