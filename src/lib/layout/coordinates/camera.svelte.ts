import type { GeoCameraTransition } from '$lib/types/plots/camera';
import { resolveEasing } from '$lib/utils/interpolate';
import type { GeoRotate } from './rotate.svelte';
import type { GeoZoomTransform } from './zoom.svelte';

function clamp01(t: number): number {
	return t < 0 ? 0 : t > 1 ? 1 : t;
}

/**
 * Tweens `T` toward `target()`, either auto-playing over `transition().duration`
 * or, when `transition().progress` is set, as a pure function of it.
 * Interrupting mid-flight continues from the current value. Shared by
 * `createCameraTransformTween`/`createCameraRotateTween`.
 */
function tweenState<T>(args: {
	target: () => T | undefined;
	transition: () => GeoCameraTransition | undefined;
	lerp: (from: T, to: T, t: number, direction: 'shortest' | 'longest') => T;
	equals: (a: T, b: T) => boolean;
}) {
	let current = $state<T | undefined>(undefined);
	// Mirrors `current` without being reactive - read this, not `current`,
	// inside the effect below, or the async `tick()` write to `current` would
	// re-trigger this very effect (see `rotate.svelte.ts`'s own warning).
	let lastValue: T | undefined;
	let from: T | undefined;
	let to: T | undefined;
	let raf: number | undefined;

	function setCurrent(value: T) {
		current = value;
		lastValue = value;
	}

	$effect(() => {
		const target = args.target();
		if (target === undefined) return;
		const transition = args.transition();
		const progress = transition?.progress;
		const direction = transition?.direction ?? 'shortest';

		const changed = to === undefined || !args.equals(to, target);
		if (changed) {
			// At progress 0 every easing resolves to `from`, so a target
			// correction while idle there must re-snapshot `from` too, or it
			// stays pinned to a stale value.
			const atStart = progress != null && clamp01(progress) <= 0;
			from = atStart ? target : (lastValue ?? target);
			to = target;
		}

		if (raf != null) {
			cancelAnimationFrame(raf);
			raf = undefined;
		}

		if (progress != null) {
			setCurrent(
				args.lerp(from!, to!, resolveEasing(transition?.easing)(clamp01(progress)), direction)
			);
			return;
		}

		if (!changed) return;
		const duration = Math.max(0, transition?.duration ?? 750);
		const easing = resolveEasing(transition?.easing);
		const startFrom = from!;
		const endTo = to!;
		const start = performance.now();

		function tick(now: number) {
			const t = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
			setCurrent(args.lerp(startFrom, endTo, easing(t), direction));
			raf = t < 1 ? requestAnimationFrame(tick) : undefined;
		}
		raf = requestAnimationFrame(tick);

		return () => {
			if (raf != null) cancelAnimationFrame(raf);
		};
	});

	return {
		get current() {
			return current;
		}
	};
}

function lerpTransform(from: GeoZoomTransform, to: GeoZoomTransform, t: number): GeoZoomTransform {
	return {
		x: from.x + (to.x - from.x) * t,
		y: from.y + (to.y - from.y) * t,
		k: from.k + (to.k - from.k) * t
	};
}

function transformEquals(a: GeoZoomTransform, b: GeoZoomTransform): boolean {
	return a.x === b.x && a.y === b.y && a.k === b.k;
}

/** Signed angular delta from `a` to `b` in degrees - the smaller one for `'shortest'`, the way around it for `'longest'`. */
function angleDelta(a: number, b: number, direction: 'shortest' | 'longest'): number {
	const shortest = ((((b - a + 180) % 360) + 360) % 360) - 180;
	if (direction === 'shortest') return shortest;
	return shortest > 0 ? shortest - 360 : shortest + 360;
}

function lerpRotate(
	from: GeoRotate,
	to: GeoRotate,
	t: number,
	direction: 'shortest' | 'longest'
): GeoRotate {
	return [
		from[0] + angleDelta(from[0], to[0], direction) * t,
		from[1] + (to[1] - from[1]) * t,
		from[2] + (to[2] - from[2]) * t
	];
}

function rotateEquals(a: GeoRotate, b: GeoRotate): boolean {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
}

/** Tweens the camera's pixel-space `{x,y,k}` transform toward `target()` - see `tweenState`'s doc comment for the two transition modes. */
export function createCameraTransformTween(args: {
	target: () => GeoZoomTransform | undefined;
	transition: () => GeoCameraTransition | undefined;
}) {
	return tweenState<GeoZoomTransform>({ ...args, lerp: lerpTransform, equals: transformEquals });
}

/** Tweens the camera's `[lambda, phi, gamma]` rotate toward `target()`, honoring `transition().direction`. */
export function createCameraRotateTween(args: {
	target: () => GeoRotate | undefined;
	transition: () => GeoCameraTransition | undefined;
}) {
	return tweenState<GeoRotate>({ ...args, lerp: lerpRotate, equals: rotateEquals });
}
