import { AUTO_MARGIN_ESTIMATE } from '$lib/layout/plot/margins';
import type { MarginConfig } from '$lib/types/plots/props';

/** How far a value label's rendered box extends past the plot's own content box, in pixels, on each side (0 = no overflow). */
export type MarginOverflow = { left: number; right: number; top: number; bottom: number };

const NO_OVERFLOW: MarginOverflow = { left: 0, right: 0, top: 0, bottom: 0 };

/**
 * A generic `maxOverflow` cap for {@link createLabelMarginTracker}: half of
 * each dimension, so a facet cramped enough that its own value label can
 * never fully fit still leaves the plot's own content box the other half,
 * rather than `measured` growing without bound (see that function's own
 * `maxOverflow` doc comment). The same backstop applies regardless of *what*
 * overflows or *why* — every value-label-drawing plot (line/bar/pyramid/
 * scatter) passes this, sized off its own `width`/`height`.
 */
export function halfDimensionOverflowCap(width: number, height: number): MarginOverflow {
	return {
		left: Math.max(0, width * 0.5),
		right: Math.max(0, width * 0.5),
		top: Math.max(0, height * 0.5),
		bottom: Math.max(0, height * 0.5)
	};
}

/**
 * Watches an SVG group's rendered bounding box against the plot's own
 * content box (`bounds`) and reports how far it overflows on each side.
 * Polled across successive paints until two consecutive readings agree,
 * rather than trusted after a single frame: the group's own resolved
 * geometry (driven by svelteplot's separate reactive graph) and svelteplot's
 * own axis auto-margins can take a variable number of frames to settle —
 * more on a page with many other components competing for layout (e.g. a
 * docs page) than in an isolated story. Measuring too early can catch
 * content still at its pre-layout default position; capped so a layout that
 * genuinely never stabilizes still reports its last reading instead of
 * polling forever. Also waits for web fonts to finish loading, since glyph
 * metrics (and therefore `getBBox()`) can still reflect a fallback font's
 * narrower widths until the real font swaps in.
 */
export function watchLabelOverflow(args: {
	el: () => SVGGElement | undefined;
	bounds: () => { left: number; right: number; top: number; bottom: number } | undefined;
	onOverflow: (overflow: MarginOverflow) => void;
}): void {
	$effect(() => {
		const el = args.el();
		const bounds = args.bounds();
		const reportOverflow = args.onOverflow;
		if (!el || !bounds) return;

		const MAX_ATTEMPTS = 30;
		let cancelled = false;
		let frame: number | undefined;
		let attempt = 0;
		let lastReading: MarginOverflow | undefined;

		function measure() {
			if (cancelled) return;
			let box: { x: number; y: number; width: number; height: number };
			try {
				box = el!.getBBox();
			} catch {
				return;
			}
			// An empty group (no labels currently rendered, e.g. every series is
			// scrubbed/filtered out of view) reports getBBox() as (0,0,0,0) — the
			// SVG origin, not "no content". Reading that literally as a box sitting
			// at (0,0) would report overflow proportional to the *current* margins
			// themselves, which grows them, which remounts this group against the
			// new, larger bounds, which reports overflow again — an unbounded loop
			// with nothing rendered to justify it.
			const overflow: MarginOverflow =
				box.width === 0 && box.height === 0
					? NO_OVERFLOW
					: {
							left: Math.ceil(Math.max(0, bounds!.left - box.x)),
							right: Math.ceil(Math.max(0, box.x + box.width - bounds!.right)),
							top: Math.ceil(Math.max(0, bounds!.top - box.y)),
							bottom: Math.ceil(Math.max(0, box.y + box.height - bounds!.bottom))
						};
			attempt += 1;
			const stable =
				lastReading != null &&
				lastReading.left === overflow.left &&
				lastReading.right === overflow.right &&
				lastReading.top === overflow.top &&
				lastReading.bottom === overflow.bottom;
			lastReading = overflow;
			if (stable || attempt >= MAX_ATTEMPTS) {
				reportOverflow(overflow);
			} else {
				frame = requestAnimationFrame(measure);
			}
		}

		const fontsReady = document.fonts?.ready ?? Promise.resolve();
		fontsReady.then(() => {
			if (cancelled) return;
			frame = requestAnimationFrame(measure);
		});
		return () => {
			cancelled = true;
			if (frame !== undefined) cancelAnimationFrame(frame);
		};
	});
}

/**
 * Tracks value-label overflow reported by (possibly several, e.g. one per
 * series) {@link watchLabelOverflow} calls and grows a local margin override
 * to fit it — monotonically, since shrinking it back would re-expose the
 * overflow that caused the growth in the first place, oscillating between
 * "shrink margin → overflow reappears → grow margin → …". Each side is only
 * ever set when the caller's own `margins` prop hasn't already pinned it, so
 * an explicit caller override always wins over this auto-grown one.
 *
 * That monotonic growth is only sound for a *stable* dataset — it assumes
 * every reading describes the same thing being measured, just possibly at an
 * earlier, not-yet-settled frame. It stops being sound once the caller's own
 * data changes identity underneath it (e.g. a timeline scrubber revealing a
 * different slice of rows on every tick): an overflow measured against
 * *that* frame's rendered labels doesn't describe the next frame's, so
 * carrying it forward forever can leave a plot permanently — and wrongly —
 * margin-inflated by whatever the single most cluttered frame it ever
 * passed through needed, long after scrubbing away from it. `resetKey`, if
 * given, is compared by identity on every call; a change drops `measured`
 * back to zero so the next frame's overflow is measured fresh against only
 * what's actually on screen now. Pass whatever reactive value identifies
 * "what's currently being plotted" for the caller (e.g. its own resolved
 * series list) — a plain reference/value comparison, not a deep one, so it
 * only need change identity when the rendered content actually does.
 */
export function createLabelMarginTracker(
	margins: () => MarginConfig | undefined,
	resetKey?: () => unknown,
	/**
	 * A precomputed overflow estimate — from the full dataset, not just the
	 * current frame — used as the reset target instead of zero. Since it's
	 * derived from stable inputs, a `resetKey` change resets `measured` back
	 * to roughly the same value instead of zero, so DOM growth rarely needs
	 * to re-detect and re-grow it (which would otherwise remount the plot on
	 * every reset). DOM measurement can still grow past it for whatever this
	 * estimate doesn't cover.
	 */
	floor?: () => MarginOverflow,
	/**
	 * Ceiling on how far `measured` can grow on each side, independent of
	 * `floor`. Without one, a cell too small to ever fully fit its own label
	 * (e.g. a narrow facet) keeps reporting overflow after every growth-
	 * triggered remount — since the label's absolute size never shrinks —
	 * and `measured` grows without bound, eventually leaving nothing for the
	 * plot's own content box. Capping it trades a permanently-clipped label
	 * in that case for a plot that still renders. Pass `Infinity` on a side
	 * (the default) to leave it uncapped.
	 */
	maxOverflow?: () => MarginOverflow
) {
	const floorValue = () => floor?.() ?? NO_OVERFLOW;
	let measured = $state<MarginOverflow>(floorValue());

	// Skips the reset on the very first run (there's nothing to reset yet,
	// and `measured` already starts at the floor) so only a later, genuine
	// change to `resetKey` clears accumulated growth.
	let resetKeyInitialized = false;
	let lastResetKey: unknown;
	$effect(() => {
		const key = resetKey?.();
		if (!resetKeyInitialized) {
			resetKeyInitialized = true;
			lastResetKey = key;
			return;
		}
		if (key !== lastResetKey) {
			lastResetKey = key;
			measured = floorValue();
		}
	});

	// Pure `Math.max` — no `maxOverflow` cap here. `measured` is a *tracked*
	// value, not the applied margin, and must stay strictly monotonic
	// regardless of anything else changing (see this function's own doc
	// comment on why shrinking it back oscillates). `maxOverflow` is
	// typically sized off the plot's own live `width`/`height` (see
	// `halfDimensionOverflowCap`), which moves continuously during a resize
	// — capping *here* would let a shrinking cap force `measured` down mid-
	// resize, immediately re-exposing the overflow that grew it in the first
	// place and re-triggering growth, over and over, fast enough to trip
	// Svelte's `effect_update_depth_exceeded` guard. The cap is applied only
	// where it can't feed back into `measured` itself — see `resolvedMargins`.
	function report(overflow: MarginOverflow) {
		const next: MarginOverflow = {
			left: Math.max(measured.left, overflow.left),
			right: Math.max(measured.right, overflow.right),
			top: Math.max(measured.top, overflow.top),
			bottom: Math.max(measured.bottom, overflow.bottom)
		};
		if (
			next.left !== measured.left ||
			next.right !== measured.right ||
			next.top !== measured.top ||
			next.bottom !== measured.bottom
		) {
			measured = next;
		}
	}

	// `measured` is overflow *past* the current margin, not the total margin
	// needed — grown on top of `AUTO_MARGIN_ESTIMATE` (the same fallback
	// svelteplot's own 'auto' sizing is estimated by elsewhere), not the raw
	// overflow alone, or growth would silently replace whatever room 'auto'
	// would have reserved for the axis itself (tick labels, title) with a
	// number that only accounts for the value label. `AUTO_MARGIN_ESTIMATE` is
	// a fixed constant, not `numericMargins`' own already-grown value, so this
	// can't compound into unbounded growth across repeated reports.
	//
	// `maxOverflow`, if given, clamps `measured` down to a live cap *here*,
	// read-only — every render re-reads the current cap and applies it fresh
	// to the unclamped, monotonically-tracked `measured`, without ever
	// writing the clamped value back into `measured` itself (see `report`'s
	// own doc comment for why that distinction matters).
	const resolvedMargins = $derived.by((): MarginConfig | undefined => {
		const base = margins();
		const cap = maxOverflow?.() ?? {
			left: Infinity,
			right: Infinity,
			top: Infinity,
			bottom: Infinity
		};
		const clamped: MarginOverflow = {
			left: Math.min(measured.left, cap.left),
			right: Math.min(measured.right, cap.right),
			top: Math.min(measured.top, cap.top),
			bottom: Math.min(measured.bottom, cap.bottom)
		};
		if (clamped.left <= 0 && clamped.right <= 0 && clamped.top <= 0 && clamped.bottom <= 0)
			return base;
		const out: MarginConfig = { ...base };
		if (clamped.right > 0 && base?.right === undefined)
			out.right = AUTO_MARGIN_ESTIMATE.right + clamped.right;
		if (clamped.left > 0 && base?.left === undefined)
			out.left = AUTO_MARGIN_ESTIMATE.left + clamped.left;
		if (clamped.top > 0 && base?.top === undefined)
			out.top = AUTO_MARGIN_ESTIMATE.top + clamped.top;
		if (clamped.bottom > 0 && base?.bottom === undefined)
			out.bottom = AUTO_MARGIN_ESTIMATE.bottom + clamped.bottom;
		return out;
	});

	// Bundles `resolvedMargins` with a remount key, ready to spread straight
	// onto `<BasePlotLayout>` as its `margins`/`marginRemountKey` props (see
	// that prop's doc comment for *why* a remount key is needed here at all)
	// — keeps the caller from re-deriving the same key by hand. Keyed off
	// `resolvedMargins` itself (the actually-applied value) rather than raw
	// `measured` — with a `maxOverflow` cap in play, `measured` can keep
	// climbing past the point where it's clamped without the applied margin
	// changing at all, and remounting for that would be pure waste. Also
	// tracks the caller's own `margins()` — a caller that changes its
	// explicit margins prop after mount (e.g. locking in a previously-
	// measured value) needs that picked up just as cleanly as internal
	// growth does; `resolvedMargins` alone already reflects that too, but
	// spelling it out keeps the key's intent obvious.
	const plotProps = $derived.by(() => ({
		margins: resolvedMargins,
		marginRemountKey: JSON.stringify({ base: margins(), resolvedMargins })
	}));

	return {
		report,
		get resolvedMargins() {
			return resolvedMargins;
		},
		get plotProps() {
			return plotProps;
		}
	};
}
