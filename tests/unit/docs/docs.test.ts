import { describe, test, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(__dirname, '../../..');
const read = (file: string) => readFileSync(resolve(root, file), 'utf8');
const pages = readdirSync(resolve(root, 'docs')).filter((f) => f.endsWith('.md'));
// Pages for people working on the library, not using it: left out of the LLM index.
const CONTRIBUTOR = new Set(['architecture.md', 'development.md']);
const usage = pages.filter((f) => !CONTRIBUTOR.has(f));
// A page per plot kind lives in the folder of its category, checked like the rest.
const nested = readdirSync(resolve(root, 'docs/plots'), { recursive: true })
	.map(String)
	.filter((f) => f.endsWith('.md'));
const documents = [
	'README.md',
	...pages.map((f) => `docs/${f}`),
	...nested.map((f) => `docs/plots/${f}`)
];

/** GitHub's heading anchor: lowercase, punctuation dropped, spaces to dashes. */
const slug = (heading: string) =>
	heading
		.toLowerCase()
		.replace(/`/g, '')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/\s/g, '-');

const headings = (file: string) =>
	[...read(file).matchAll(/^#{1,6}\s+(.+)$/gm)].map(([, heading]) => slug(heading));

describe('documentation', () => {
	test('the README links every docs page', () => {
		const readme = read('README.md');
		for (const page of pages) expect(readme, page).toContain(`docs/${page}`);
	});

	test.each(documents)('%s: every local link and anchor resolves', (file) => {
		const text = read(file).replace(/```[\s\S]*?```/g, '');
		const links = [...text.matchAll(/\]\((?!https?:|mailto:)([^)\s]+)\)/g)].map(([, link]) => link);
		for (const link of links) {
			const [path, anchor] = link.split('#');
			const target = path ? resolve(root, dirname(file), path) : resolve(root, file);
			expect(existsSync(target), `${file} -> ${link}`).toBe(true);
			if (anchor && target.endsWith('.md')) {
				const relative = target.slice(root.length + 1);
				expect(headings(relative), `${file} -> ${link}`).toContain(anchor);
			}
		}
	});

	test('theming lists every CSS variable the configuration sets', () => {
		const source = read('src/lib/configuration/config.svelte.ts');
		const vars = [...source.matchAll(/'(--dct-[a-z0-9-]+)':/g)].map(([, name]) => name);
		const theming = read('docs/theming.md');
		expect(vars.length).toBeGreaterThan(50);
		for (const name of vars) expect(theming, name).toContain(`\`${name}\``);
	});

	test('llms-full.txt names every docs page', () => {
		const guide = read('llms-full.txt');
		for (const page of usage) expect(guide, page).toContain(page);
	});
});
