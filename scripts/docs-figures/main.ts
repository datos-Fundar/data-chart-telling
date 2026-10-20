import { mount, type Component } from 'svelte';
import { setConfiguration } from '@fundar/data-chart-telling';
import options from './figures.json';

// Figures are in English, so axes write numbers and dates in English too.
setConfiguration({ axis: { locale: 'en-US' } });

/** Where a figure asks the pointer to rest before its screenshot, in pixels from its top-left corner. */
export type FigureMeta = { hover?: { x: number; y: number }; click?: string };

/** `LineByRegion` as `line-by-region`: an example's image name. */
const kebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const nameOf = (path: string) => path.split('/').pop()!.replace('.svelte', '');

// Every example is a figure, named after it; `figures/` holds the few that are not examples.
const examples = import.meta.glob<{ default: Component }>('../../examples/*.svelte', {
	eager: true
});
const own = import.meta.glob<{ default: Component }>('./figures/*.svelte', { eager: true });
const figures = new Map<string, Component>([
	...Object.entries(examples).map(([path, mod]) => [kebab(nameOf(path)), mod.default] as const),
	...Object.entries(own).map(([path, mod]) => [nameOf(path), mod.default] as const)
]);

const name = new URLSearchParams(location.search).get('fig') ?? '';
const figure = figures.get(name);
if (!figure) throw new Error(`No figure named "${name}"`);

mount(figure, { target: document.getElementById('fig')! });
const meta: Record<string, FigureMeta> = options.meta;
document.body.dataset.meta = JSON.stringify(meta[name] ?? {});
document.body.dataset.ready = 'true';
