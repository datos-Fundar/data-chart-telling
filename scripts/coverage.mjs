// Runs the unit and browser suites in shards and merges their coverage.
// A single coverage run makes the browser drop its connection partway through.
import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const SHARDS = 4;
const projects = ['--project=unit', '--project=browser'];

function vitest(...args) {
	const { status } = spawnSync('pnpm', ['vitest', ...args], { stdio: 'inherit' });
	if (status !== 0) process.exit(status ?? 1);
}

rmSync('.vitest-reports', { recursive: true, force: true });
for (let shard = 1; shard <= SHARDS; shard++) {
	vitest('run', ...projects, '--coverage', `--shard=${shard}/${SHARDS}`, '--reporter=blob');
}
vitest('--merge-reports', '--coverage');
