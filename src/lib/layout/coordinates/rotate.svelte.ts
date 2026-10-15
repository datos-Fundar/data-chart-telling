export type GeoRotate = [number, number, number];

/**
 * Wires drag-to-rotate onto a DOM node for orthographic-style projections,
 * exposing the resulting `[lambda, phi, gamma]` as reactive Svelte state -
 * the caller feeds it back into the projection's own `rotate` config (see
 * `GeoPlot`'s own `Plot.svelte`). Plain pointer events rather than d3-drag: a
 * single-pointer drag-delta-to-rotation-delta conversion doesn't need
 * d3-drag's multi-touch gesture machinery, and this package doesn't
 * otherwise depend on it.
 *
 * Sensitivity is a fixed degrees-per-pixel constant scaled by the current
 * pan/zoom `scale` (so dragging feels consistent whether zoomed in or out)
 * - not derived from the projection's own fitted scale, which isn't
 * exposed back up to this layer. Known v1 simplification, in the same
 * spirit as `createGeoZoom`'s own "v1 limitation" - good enough to spin
 * the globe, not tuned to feel identical across wildly different
 * width/height/domain combinations.
 */
export function createGeoRotate(args: {
	enabled: () => boolean;
	baseRotate: () => GeoRotate;
	scale: () => number;
	node: () => HTMLElement | null;
}) {
	let rotate = $state<GeoRotate>(args.baseRotate());

	// Reset to the configured base rotation whenever it changes (e.g. a
	// Storybook control edit) - but only while not actively enabled, so this
	// doesn't fight the user's own in-progress drag.
	$effect(() => {
		if (!args.enabled()) rotate = args.baseRotate();
	});

	$effect(() => {
		const el = args.node();
		if (!args.enabled() || !el) return;

		// `dragging`/`start`/`startRotate` are deliberately plain closure
		// variables, not `$state` - this effect must NOT read the reactive
		// `rotate` value anywhere in its own synchronous body (only inside the
		// event-handler closures below, which aren't part of dependency
		// tracking). Reading it here would make every `rotate` write from
		// `onPointerMove` re-trigger this very effect mid-drag, tearing down
		// and rebuilding the listeners - and losing `dragging`'s `true` state
		// - on every pixel of movement.
		let dragging = false;
		let start = { x: 0, y: 0 };
		let startRotate: GeoRotate = [0, 0, 0];

		function onPointerDown(event: PointerEvent) {
			if (event.button !== 0) return;
			dragging = true;
			start = { x: event.clientX, y: event.clientY };
			startRotate = rotate;
			el!.setPointerCapture(event.pointerId);
		}

		function onPointerMove(event: PointerEvent) {
			if (!dragging) return;
			const degPerPixel = 0.3 / Math.max(args.scale(), 0.1);
			const dLambda = (event.clientX - start.x) * degPerPixel;
			const dPhi = (event.clientY - start.y) * degPerPixel;
			const [lambda0, phi0, gamma0] = startRotate;
			rotate = [lambda0 + dLambda, Math.max(-90, Math.min(90, phi0 - dPhi)), gamma0];
		}

		function onPointerUp(event: PointerEvent) {
			dragging = false;
			el!.releasePointerCapture(event.pointerId);
		}

		el.addEventListener('pointerdown', onPointerDown);
		el.addEventListener('pointermove', onPointerMove);
		el.addEventListener('pointerup', onPointerUp);
		el.addEventListener('pointercancel', onPointerUp);

		return () => {
			el.removeEventListener('pointerdown', onPointerDown);
			el.removeEventListener('pointermove', onPointerMove);
			el.removeEventListener('pointerup', onPointerUp);
			el.removeEventListener('pointercancel', onPointerUp);
		};
	});

	return {
		get rotate() {
			return rotate;
		}
	};
}
