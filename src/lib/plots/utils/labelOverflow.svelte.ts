import { AUTO_MARGIN_ESTIMATE } from '$lib/layout/plot/margins';
import type { MarginConfig } from '$lib/types/plots/props';

/** How far a value label's rendered box extends past the plot's own content box, in pixels, on each side (0 = no overflow). */
export type MarginOverflow = { left: number; right: number; top: number; bottom: number };

const NO_OVERFLOW: MarginOverflow = { left: 0, right: 0, top: 0, bottom: 0 };

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
 */
export function createLabelMarginTracker(margins: () => MarginConfig | undefined) {
	let measured = $state<MarginOverflow>(NO_OVERFLOW);

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
	const resolvedMargins = $derived.by((): MarginConfig | undefined => {
		const base = margins();
		if (measured.left <= 0 && measured.right <= 0 && measured.top <= 0 && measured.bottom <= 0)
			return base;
		const out: MarginConfig = { ...base };
		if (measured.right > 0 && base?.right === undefined)
			out.right = AUTO_MARGIN_ESTIMATE.right + measured.right;
		if (measured.left > 0 && base?.left === undefined)
			out.left = AUTO_MARGIN_ESTIMATE.left + measured.left;
		if (measured.top > 0 && base?.top === undefined)
			out.top = AUTO_MARGIN_ESTIMATE.top + measured.top;
		if (measured.bottom > 0 && base?.bottom === undefined)
			out.bottom = AUTO_MARGIN_ESTIMATE.bottom + measured.bottom;
		return out;
	});

	// Bundles `resolvedMargins` with a remount key derived from `measured`,
	// ready to spread straight onto `<BasePlotLayout>` as its `margins`/
	// `marginRemountKey` props (see that prop's doc comment for *why* a
	// remount key is needed here at all) — keeps the caller from re-deriving
	// the same key by hand, and from having to know it's `measured` that key
	// must track.
	const plotProps = $derived.by(() => ({
		margins: resolvedMargins,
		marginRemountKey: JSON.stringify(measured)
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
