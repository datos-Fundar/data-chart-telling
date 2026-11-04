import { render } from 'vitest-browser-svelte';
import { describe, test, expect, vi } from 'vitest';
import CameraTransitionDemo from '../../../../../stories/plots/map/geo/coordinates/CameraTransitionDemo.svelte';
import CameraScrollDemo from '../../../../../stories/plots/map/geo/coordinates/CameraScrollDemo.svelte';

/**
 * Where the camera has put the map: the outline of the first feature it draws, and the transform
 * carrying the drawn features to the view while it moves (the outline is only redrawn once it settles).
 */
const cameraTransform = (container: Element) => {
	const path = container.querySelector('svg g[clip-path] path');
	if (!path) return undefined;
	const carry = path.closest('g[clip-path] > g')?.getAttribute('transform') ?? '';
	return `${carry}|${path.getAttribute('d')}`;
};

const settle = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The camera's view once it has settled somewhere other than `from`: the outline is redrawn and nothing carries
 * it any more. A fixed wait is not enough - on a loaded machine the camera has not left where it was drawn, or
 * is still on its way, and the view read then is not the one it ends on.
 */
const settled = async (container: Element, from?: string) => {
	await vi.waitFor(
		() => {
			const view = cameraTransform(container);
			expect(view?.startsWith('|') && view !== from).toBe(true);
		},
		{ timeout: 8000 }
	);
	return cameraTransform(container);
};

describe('GeoPlot - camera', () => {
	test('a new target flies there over the transition and settles on it', async () => {
		const { container } = render(CameraTransitionDemo, { duration: 400 } as never);
		await vi.waitFor(() => expect(cameraTransform(container)).toBeTruthy());
		await settle(300);
		const before = cameraTransform(container);

		(container.querySelector('button') as HTMLButtonElement).click();
		await settle(150);
		const midway = cameraTransform(container);
		expect(midway).not.toBe(before);

		await settle(600);
		const after = cameraTransform(container);
		expect(after).not.toBe(midway);
		await settle(200);
		expect(cameraTransform(container)).toBe(after);
	});

	test('scrolling back up returns the camera to where it started', async () => {
		const { container } = render(CameraScrollDemo, { height: 300 } as never);
		const track = container.querySelector('.scroll-track') as HTMLElement;
		await vi.waitFor(() => expect(cameraTransform(container)).toBeTruthy());
		// The map is first drawn whole, and the camera flies from there to the first scene.
		const drawn = cameraTransform(container);
		const start = await settled(container, drawn);

		track.scrollTop = track.scrollHeight;
		const far = await settled(container, start);
		expect(far).not.toBe(start);

		track.scrollTop = 0;
		await vi.waitFor(() => expect(cameraTransform(container)).toBe(start), { timeout: 8000 });
	});
});
