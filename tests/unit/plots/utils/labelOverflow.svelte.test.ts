import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import LabelMarginTrackerProbe from './LabelMarginTrackerProbe.svelte';
import type { MarginOverflow } from '$lib/plots/utils/labelOverflow.svelte';

const NO_OVERFLOW = { left: 0, right: 0, top: 0, bottom: 0 };
const probe = (container: Element) => container.querySelector('[data-testid="probe"]')!;
const right = (container: Element) => Number(probe(container).getAttribute('data-right'));

describe('createLabelMarginTracker – maxOverflow cap', () => {
	test('a report() made while the cap is shrunk must not corrupt the tracked value', async () => {
		// Regression test: `maxOverflow` used to be applied *inside* `report()`,
		// clamping the tracked `measured` value itself down whenever the cap
		// shrank — e.g. a real window resize, where `halfDimensionOverflowCap`'s
		// `width`-derived cap moves on every frame. Since `measured` is supposed
		// to be strictly monotonic (see `createLabelMarginTracker`'s own doc
		// comment on why shrinking it back oscillates: "shrink margin → overflow
		// reappears → grow margin → …"), a `report()` landing while the cap is
		// transiently shrunk (exactly what `watchLabelOverflow`'s async,
		// multi-frame DOM re-measurement can do mid-resize, entirely decoupled
		// from whatever `width` does afterwards) could permanently clamp
		// `measured` down — even once the window widens back out — since
		// nothing else automatically re-reports the larger, already-known
		// overflow. In production that mutual re-triggering (shrink → clamp →
		// re-expose overflow → regrow → …) was fast enough to trip Svelte's
		// `effect_update_depth_exceeded` guard on a faceted line chart during a
		// rapid resize. The fix moved the cap to a read-only clamp applied only
		// when turning `measured` into the applied margin, in `resolvedMargins`
		// — never written back into `measured` itself.
		let report!: (overflow: MarginOverflow) => void;
		const { container, rerender } = await render(LabelMarginTrackerProbe, {
			width: 1000,
			onReady: (r) => {
				report = r;
			}
		});

		// A large, real overflow (a wide label) reported while the cap (half of
		// 1000) is nowhere near limiting — `measured` grows to fit it.
		report({ ...NO_OVERFLOW, right: 300 });
		await vi.waitFor(() => expect(right(container)).toBeGreaterThan(0));
		const grown = right(container);

		// The window shrinks — no new report, so the *applied* margin clamps
		// down (correct: `resolvedMargins` reacts to `width` live), but nothing
		// has touched the tracked value yet.
		await rerender({ width: 40 });
		await vi.waitFor(() => expect(right(container)).toBeLessThan(grown));

		// A fresh DOM measurement lands *while the window is still narrow* —
		// exactly the async, multi-frame timing `watchLabelOverflow` can produce
		// mid-resize — reporting the same real overflow (the label itself never
		// shrank). Called directly, not through anything reactive to `width`.
		report({ ...NO_OVERFLOW, right: 300 });
		await new Promise((r) => setTimeout(r, 0));

		// The window widens back out, with no further report — nothing here
		// re-asserts the already-known overflow. If the cap had corrupted
		// `measured` while shrunk (the bug), this reads back clamped-and-stuck
		// rather than fully restored.
		await rerender({ width: 1000 });
		await vi.waitFor(() => expect(right(container)).toBe(grown));
	});

	test('the applied margin never exceeds the current cap', async () => {
		let report!: (overflow: MarginOverflow) => void;
		const { container, rerender } = await render(LabelMarginTrackerProbe, {
			width: 1000,
			onReady: (r) => {
				report = r;
			}
		});
		report({ ...NO_OVERFLOW, right: 5000 });
		// `halfDimensionOverflowCap` caps at `width * 0.5` — the applied margin
		// (which also adds a fixed `AUTO_MARGIN_ESTIMATE` on top, see
		// `createLabelMarginTracker`'s own doc comment) must still stay bounded
		// by roughly that, not the full 5000px overflow.
		await vi.waitFor(() => expect(right(container)).toBeLessThan(1000));

		await rerender({ width: 100 });
		await vi.waitFor(() => expect(right(container)).toBeLessThan(150));
	});
});
