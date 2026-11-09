import { render } from 'vitest-browser-svelte';
import { describe, expect, test } from 'vitest';
import { page, userEvent } from 'vitest/browser';

type StoryModule = Record<string, unknown> & {
	default?: { component?: unknown; args?: object };
};
type Story = { render?: () => { Component: never; props?: object }; args?: object };

/**
 * The stories that teach the hover - `Layout/Hover`, and the hover of each plot kind - must keep mounting, and
 * answering the pointer without an error.
 */
const FILES = import.meta.glob<StoryModule>(
	[
		'../../../stories/layout/hover/*.stories.ts',
		'../../../stories/plots/**/*.Markers.Hover.stories.ts'
	],
	{ eager: true }
);

/** What a story draws: its own render, or its file's component with its file's args under its own. */
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

describe('hover stories', () => {
	for (const [file, mod] of Object.entries(FILES)) {
		for (const [name, story] of Object.entries(mod)) {
			if (name === 'default') continue;
			test(`${file.split('/').pop()} ${name}`, async () => {
				const errors: unknown[] = [];
				const onError = (e: ErrorEvent) => errors.push(e.message);
				window.addEventListener('error', onError);
				const { Component, props } = drawn(mod, story as Story);
				const { container } = render(Component, { props: props as never });
				await expect.poll(() => container.querySelector('svg')).toBeTruthy();
				const svg = container.querySelector('svg')!;
				await userEvent.hover(page.elementLocator(svg), { force: true });
				await new Promise((r) => setTimeout(r, 250));
				expect(container.textContent).not.toContain('effect_update_depth_exceeded');
				expect(container.textContent).not.toContain('[object Object]');
				expect(container.textContent).not.toMatch(/\bNaN\b/);
				expect(container.querySelector('text.error')).toBeNull();
				await userEvent.unhover(page.elementLocator(svg));
				window.removeEventListener('error', onError);
				expect(errors).toEqual([]);
			});
		}
	}
});
