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
		await settle(300);
		const start = cameraTransform(container);

		track.scrollTop = track.scrollHeight;
		await settle(500);
		const far = cameraTransform(container);
		expect(far).not.toBe(start);

		track.scrollTop = 0;
		await vi.waitFor(() => expect(cameraTransform(container)).toBe(start), { timeout: 3000 });
	});
});
