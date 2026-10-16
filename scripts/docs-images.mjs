// Renders each figure in scripts/docs-figures/figures to docs/images/<name>.png.
// Usage: pnpm docs:images [name ...]   (no names: every figure)
import { createServer } from 'vite';
import { svelte, vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { chromium } from 'playwright';
import { readdirSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const figures = resolve(root, 'scripts/docs-figures');
const out = resolve(root, 'docs/images');
mkdirSync(out, { recursive: true });

const all = readdirSync(resolve(figures, 'figures'))
	.filter((f) => f.endsWith('.svelte'))
	.map((f) => f.replace('.svelte', ''));
const wanted = process.argv.slice(2);
const names = wanted.length ? all.filter((n) => wanted.includes(n)) : all;

const server = await createServer({
	configFile: false,
	root: figures,
	logLevel: 'error',
	plugins: [svelte({ preprocess: vitePreprocess() })],
	resolve: {
		alias: {
			$lib: resolve(root, 'src/lib'),
			'@fundar/data-chart-telling': resolve(root, 'src/lib/index.ts')
		}
	},
	server: { port: 5199, strictPort: true, fs: { allow: [root] } }
});
await server.listen();

const browser = await chromium.launch();
const context = await browser.newContext({
	deviceScaleFactor: 2,
	viewport: { width: 1100, height: 900 }
});
let failed = 0;
for (const name of names) {
	const page = await context.newPage();
	const errors = [];
	page.on('pageerror', (e) => errors.push(e.message));
	page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
	try {
		await page.goto(`http://localhost:5199/?fig=${name}`);
		await page.waitForSelector('body[data-ready="true"]', { timeout: 10000 });
		const meta = JSON.parse(await page.evaluate(() => document.body.dataset.meta ?? '{}'));
		const box = await page.locator('#fig').boundingBox();
		if (meta.click) await page.locator(meta.click).first().click();
		if (meta.hover) await page.mouse.move(box.x + meta.hover.x, box.y + meta.hover.y);
		await page.waitForTimeout(meta.hover || meta.click ? 900 : 250);
		await page.locator('#fig').screenshot({ path: resolve(out, `${name}.png`) });
		if (errors.length) throw new Error(errors[0]);
		console.log(`ok   ${name}`);
	} catch (e) {
		failed++;
		console.log(`FAIL ${name}: ${e.message.split('\n')[0]}`);
	}
	await page.close();
}
await browser.close();
await server.close();
process.exit(failed ? 1 : 0);
