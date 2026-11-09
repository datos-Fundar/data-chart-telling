import { render } from 'vitest-browser-svelte';
import { describe, expect, test } from 'vitest';

type StoryModule = Record<string, unknown> & {
	default?: { component?: unknown; args?: object };
};
type Story = { render?: () => { Component: never; props?: object }; args?: object };

/**
 * Every plot kind's tooltip stories must write what they read - a value the plot works out (a density's estimate,
 * a bin's edges) as much as a field of the data - never `NaN` or `undefined`.
 */
const FILES = import.meta.glob<StoryModule>(
	[
		'../../../stories/plots/**/*.Tooltip.stories.ts',
		'../../../stories/configuration/state/*.stories.ts'
	],
	{ eager: true }
);

function drawn(mod: StoryModule, story: Story): { Component: never; props: object } {
	if (story.render) {
		const { Component, props } = story.render();
		return { Component, props: props ?? {} };
	}
	return {
		Component: mod.default!.component as never,
		props: { ...mod.default!.args, ...story.args }
	};
}

describe('tooltip stories', () => {
	for (const [file, mod] of Object.entries(FILES)) {
		for (const [name, story] of Object.entries(mod)) {
			if (name === 'default') continue;
			test(`${file.split('/').pop()} ${name}`, async () => {
				const { Component, props } = drawn(mod, story as Story);
				const { container } = render(Component, { props: props as never });
				await expect.poll(() => container.querySelector('svg')).toBeTruthy();
				await expect.poll(() => container.querySelector('.dct-plot svg')).toBeTruthy();
				// The plot's own svg, not a legend's swatch.
				const svg = container.querySelector('.dct-plot svg')!;
				const rect = svg.getBoundingClientRect();
				// A sweep across the plot, reading the tooltip at each stop.
				const texts: string[] = [];
				for (const fx of [0.2, 0.35, 0.5, 0.65, 0.8]) {
					for (const fy of [0.3, 0.5, 0.7]) {
						const clientX = rect.left + rect.width * fx;
						const clientY = rect.top + rect.height * fy;
						const target = document.elementFromPoint(clientX, clientY) ?? svg;
						for (const type of ['pointerover', 'pointerenter', 'pointermove']) {
							target.dispatchEvent(new PointerEvent(type, { bubbles: true, clientX, clientY }));
						}
						await new Promise((r) => setTimeout(r, 40));
						for (const tip of container.querySelectorAll('.dct-tooltip')) {
							texts.push(tip.textContent ?? '');
						}
					}
				}
				if (texts.length === 0) throw new Error('NOTIP');
				for (const text of texts) {
					expect(text).not.toMatch(/\bNaN\b/);
					expect(text).not.toMatch(/\bundefined\b/);
				}
			});
		}
	}
});
