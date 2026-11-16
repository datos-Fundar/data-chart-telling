// Runs the stories' visual check (`--project=visual`) in shards, one after another, passing on its own arguments
// (`--update` takes the stories as they are as the new references). A single run of every story makes the browser drop
// its connection partway through, as a single coverage run does.
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const SHARDS = 3;
const VITEST = fileURLToPath(new URL('../node_modules/vitest/vitest.mjs', import.meta.url));
const REFERENCES = fileURLToPath(new URL('../.visual/reference', import.meta.url));

const args = process.argv.slice(2);
// A machine with no references yet takes the stories as they are as its first ones, instead of failing every story;
// a story that raises an error while it draws still fails.
if (!existsSync(REFERENCES) && !args.includes('--update') && !args.includes('-u')) {
	console.log(
		'No references in .visual/reference yet: taking the stories as they are now as the first ones.\n'
	);
	args.push('--update');
}

let failed = false;

// Keeps going after a failure, so every shard reports its own.
for (let shard = 1; shard <= SHARDS; shard++) {
	// Vitest run by this same Node: no shell, so it starts alike on every system.
	const { status } = spawnSync(
		process.execPath,
		[VITEST, 'run', '--project=visual', `--shard=${shard}/${SHARDS}`, ...args],
		{ stdio: 'inherit' }
	);
	if (status !== 0) failed = true;
}

process.exit(failed ? 1 : 0);
