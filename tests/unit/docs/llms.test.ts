import { describe, test, expect } from 'vitest';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

// Pages for people working on the library, not using it.
const CONTRIBUTOR = new Set(['architecture.md', 'development.md']);
const root = resolve(__dirname, '../../..');
const read = (file: string) => readFileSync(resolve(root, file), 'utf8');

const indexSource = read('src/lib/index.ts');
const exported = new Set(
	[...indexSource.matchAll(/export\s+(?!type\b)\{([^}]*)\}/g)].flatMap(([, names]) =>
		names
			.split(',')
			.map(
				(n) =>
					n
						.trim()
						.split(/\s+as\s+/)
						.pop()!
			)
			.filter(Boolean)
	)
);

describe('llms.txt', () => {
	const index = read('llms.txt');

	test('every local link resolves (dist is built, so skipped)', () => {
		const links = [...index.matchAll(/\]\(\.\/([^)]+)\)/g)].map(([, link]) => link);
		expect(links.length).toBeGreaterThan(0);
		for (const link of links.filter((l) => !l.startsWith('dist/'))) {
			expect(existsSync(resolve(root, link)), link).toBe(true);
		}
	});

	test('lists every example', () => {
		// `geo` holds the map boundaries the stories draw, left out of the package.
		const examples = readdirSync(resolve(root, 'examples')).filter(
			(f) => f !== 'LegendReader.svelte' && f !== 'TooltipCard.svelte' && f !== 'geo'
		);
		for (const file of examples) expect(index, file).toContain(`./examples/${file}`);
	});

	test('lists every docs page', () => {
		for (const file of readdirSync(resolve(root, 'docs')).filter(
			(f) => f.endsWith('.md') && !CONTRIBUTOR.has(f)
		))
			expect(index, file).toContain(`./docs/${file}`);
	});

	test('is published with the package', () => {
		const { files } = JSON.parse(read('package.json')) as { files: string[] };
		for (const file of ['dist', 'docs', 'examples', 'llms.txt', 'llms-full.txt'])
			expect(files).toContain(file);
	});
});

describe('llms-full.txt', () => {
	const guide = read('llms-full.txt');

	test('names only exports that exist', () => {
		const names = [
			...guide.matchAll(/`((?:use[A-Z]\w+|\w+Plot|PlotComposer|\w*Configuration|THEMES))[`(]/g)
		].map(([, name]) => name);
		expect(names.length).toBeGreaterThan(0);
		for (const name of new Set(names)) expect(exported.has(name), name).toBe(true);
	});

	test('every example it mentions exists', () => {
		const files = [...guide.matchAll(/`(\w+\.svelte)`/g)].map(([, file]) => file);
		expect(files.length).toBeGreaterThan(0);
		for (const file of new Set(files))
			expect(existsSync(resolve(root, 'examples', file)), file).toBe(true);
	});
});
