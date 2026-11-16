import { afterEach, beforeEach, expect } from 'vitest';
import { page } from 'vitest/browser';

// Every story, once it has run, must have drawn without an error and look as its reference screenshot does
// (`pnpm test:visual`). The references live in `.visual/`, on this machine only: `pnpm test:visual:update` takes the
// stories as they are now as the new references.

// The stories write their code in `ui-monospace`, which Chromium does not know, or in the browser's own `monospace`: both
// fall to a font of the system, which may come in after a screenshot. Named as a font of its own, it is loaded before
// every screenshot (`document.fonts`).
const monospace = document.createElement('style');
monospace.textContent = [
	"@font-face { font-family: 'ui-monospace'; src: local('Consolas'), local('Courier New'); }",
	// The browser's own monospace text (`<code>`), in the same font, under whatever font a story gives it.
	":where(code, kbd, samp, pre) { font-family: 'ui-monospace'; }"
].join('\n');
document.head.append(monospace);

/** The errors a story raised while it drew: thrown and left uncaught, or logged. */
let errors: string[] = [];
const onError = (event: ErrorEvent) => errors.push(String(event.error?.message ?? event.message));
const onRejection = (event: PromiseRejectionEvent) =>
	errors.push(String(event.reason?.message ?? event.reason));
const consoleError = console.error;

beforeEach(() => {
	errors = [];
	window.addEventListener('error', onError);
	window.addEventListener('unhandledrejection', onRejection);
	console.error = (...args: unknown[]) => {
		errors.push(args.map(String).join(' '));
		consoleError(...args);
	};
});

afterEach(async () => {
	window.removeEventListener('error', onError);
	window.removeEventListener('unhandledrejection', onRejection);
	console.error = consoleError;
	// A Svelte error a story shows in place of itself (a loop of effects, say) links to its page on svelte.dev.
	const shown = document.body.textContent?.match(/\S*svelte\.dev\/e\/\S+/)?.[0];
	// Each error once, the first few: a loop of effects logs hundreds.
	const raised = [...new Set([...errors, ...(shown ? [`shown: ${shown}`] : [])])].slice(0, 5);
	expect(raised, 'errors while it drew').toEqual([]);
	// A text written before its font arrives is drawn in another one: the story is taken once every font is in.
	await document.fonts.ready;
	const root = document.querySelector('#storybook-root') ?? document.body;
	await expect.element(page.elementLocator(root)).toMatchScreenshot();
});
