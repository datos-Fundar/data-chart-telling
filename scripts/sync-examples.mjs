// Copies the source of each example into the Markdown blocks that show it, so a snippet
// in the README or docs/ is always the real, runnable file. A block is marked with
//
//   <!-- example: examples/Name.svelte -->
//   ...anything, replaced on every run...
//   <!-- /example -->
//
// Usage: pnpm docs:examples          (rewrite the blocks)
//        pnpm docs:examples --check  (fail when a block is out of date)
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const check = process.argv.includes('--check');

const BLOCK = /(<!-- example: (\S+) -->\n)[\s\S]*?(<!-- \/example -->)/g;

const markdownFiles = [
	resolve(root, 'README.md'),
	...readdirSync(resolve(root, 'docs'), { recursive: true })
		.filter((file) => String(file).endsWith('.md'))
		.map((file) => resolve(root, 'docs', String(file)))
];

let stale = 0;
for (const file of markdownFiles) {
	const text = readFileSync(file, 'utf8');
	const synced = text.replace(BLOCK, (_, open, examplePath, close) => {
		const source = readFileSync(resolve(root, examplePath), 'utf8').trimEnd();
		const lang = examplePath.split('.').pop();
		return `${open}\n\`\`\`${lang}\n${source}\n\`\`\`\n\n${close}`;
	});
	if (synced === text) continue;
	stale++;
	if (check) console.log(`out of date: ${relative(root, file)}`);
	else writeFileSync(file, synced);
}

if (check && stale) {
	console.log('Run `pnpm docs:examples` to copy the examples into the docs.');
	process.exit(1);
}
