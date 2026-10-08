import { AUTO_MARGIN_ESTIMATE } from '$lib/layout/base/margins';
import type { MarginConfig } from '$lib/types/plots/props';

/** How far a value label's rendered box extends past the plot's own content box, in pixels, on each side (0 = no overflow). */
export type MarginOverflow = { left: number; right: number; top: number; bottom: number };

const NO_OVERFLOW: MarginOverflow = { left: 0, right: 0, top: 0, bottom: 0 };

/** `maxOverflow` cap for {@link createLabelMarginTracker}: half of each dimension. */
export function halfDimensionOverflowCap(width: number, height: number): MarginOverflow {
	return {
		left: Math.max(0, width * 0.5),
		right: Math.max(0, width * 0.5),
		top: Math.max(0, height * 0.5),
		bottom: Math.max(0, height * 0.5)
	};
}

/**
 * Reports how far an SVG group's bounding box overflows the plot's content
 * box (`bounds`) on each side, once its readings settle.
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
			// An empty group reports a (0,0,0,0) box: no overflow.
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
 * Grows a local margin override to fit the value-label overflow reported by
 * {@link watchLabelOverflow}; it only grows, and a side the caller's
 * `margins` pins is left alone. A change of `resetKey` (compared by
 * identity) resets the growth to `floor`.
 */
export function createLabelMarginTracker(
	margins: () => MarginConfig | undefined,
	resetKey?: () => unknown,
	/** Overflow estimated from the full dataset; growth starts from and resets to it. */
	floor?: () => MarginOverflow,
	/** Most the margin can grow on each side. Defaults to `Infinity`. */
	maxOverflow?: () => MarginOverflow
) {
	const floorValue = () => floor?.() ?? NO_OVERFLOW;
	let measured = $state<MarginOverflow>(floorValue());

	// The first run is not a reset.
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

	// Grows `measured` only; `maxOverflow` is applied in `resolvedMargins`.
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

	// The applied margin: `AUTO_MARGIN_ESTIMATE` plus `measured`, capped by `maxOverflow`.
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

	// `resolvedMargins` plus a remount key, ready to spread onto `<BasePlotLayout>`.
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
