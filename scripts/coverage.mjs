// Runs the unit and browser suites in shards and merges their coverage.
// A single coverage run makes the browser drop its connection partway through.
import { rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const SHARDS = 4;
const projects = ['--project=unit', '--project=browser'];

let failed = false;

// Keeps going after a failure so the merge step can print the failing tests (blob shards do not).
function vitest(...args) {
	const { status } = spawnSync('pnpm', ['vitest', ...args], { stdio: 'inherit' });
	if (status !== 0) failed = true;
}

rmSync('.vitest-reports', { recursive: true, force: true });
for (let shard = 1; shard <= SHARDS; shard++) {
	vitest('run', ...projects, '--coverage', `--shard=${shard}/${SHARDS}`, '--reporter=blob');
}
vitest('--merge-reports', '--coverage');
if (failed) process.exit(1);
