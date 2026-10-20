import { test, expect } from 'vitest';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';

const root = resolve(__dirname, '../../..');

test('example snippets in README.md and docs/ match their files', () => {
	const run = spawnSync('node', ['scripts/sync-examples.mjs', '--check'], {
		cwd: root,
		encoding: 'utf8'
	});
	expect(run.stdout).toBe('');
	expect(run.status).toBe(0);
});
