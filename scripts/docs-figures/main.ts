import { mount, type Component } from 'svelte';
import { setConfiguration } from '@fundar/data-chart-telling';

// Figures are in English, so axes write numbers and dates in English too.
setConfiguration({ axis: { locale: 'en-US' } });

/** Where a figure asks the pointer to rest before its screenshot, in pixels from its top-left corner. */
export type FigureMeta = { hover?: { x: number; y: number }; click?: string };

const modules = import.meta.glob<{ default: Component; meta?: FigureMeta }>('./figures/*.svelte', {
	eager: true
});

const name = new URLSearchParams(location.search).get('fig') ?? '';
const found = Object.entries(modules).find(([path]) => path === `./figures/${name}.svelte`);
if (!found) throw new Error(`No figure named "${name}"`);

mount(found[1].default, { target: document.getElementById('fig')! });
document.body.dataset.meta = JSON.stringify(found[1].meta ?? {});
document.body.dataset.ready = 'true';
