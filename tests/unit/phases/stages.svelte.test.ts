import { describe, test, expect, vi } from 'vitest';
import { Pipeline } from '$lib/phases/Pipeline';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import type { PhaseStage } from '$lib/types/phases';
import { runStages } from '../plots/_helpers/stages';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type State = { log: string[] };
type Env = { tag: string };

function stage(phase: PhaseStage<State, Env>['phase'], label: string): PhaseStage<State, Env> {
	return {
		phase,
		run: (state, env) => ({ log: [...state.log, `${label}:${env.tag}`] })
	};
}

describe('Pipeline', () => {
	test('runs stages in Pipeline.ORDER, ignoring the order they were passed in', () => {
		const stages: PhaseStage<State, Env>[] = [
			stage('facet', 'facet'),
			stage('tooltip', 'tooltip'),
			stage('markers', 'markers'),
			stage('scales', 'scales'),
			stage('statistics', 'stats'),
			stage('coordinates', 'coords'),
			stage('mapping', 'mapping'),
			stage('data', 'data')
		];
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const result = runStages(new Pipeline(stages), { log: [] }, { tag: 'x' });
		warn.mockRestore();
		expect(result.log).toEqual([
			'facet:x',
			'data:x',
			'mapping:x',
			'stats:x',
			'scales:x',
			'markers:x',
			'coords:x',
			'tooltip:x'
		]);
	});

	test('preserves declaration order between stages that share a phase', () => {
		const stages: PhaseStage<State, Env>[] = [
			stage('markers', 'second'),
			stage('markers', 'first')
		];
		// declared "second" before "first" on purpose - order within a phase
		// is whatever the caller passed, a Pipeline never reorders same-phase stages.
		const result = runStages(new Pipeline(stages), { log: [] }, { tag: 'x' });
		expect(result.log).toEqual(['second:x', 'first:x']);
	});

	test('an empty stage list returns the input state unchanged', () => {
		const input: State = { log: [] };
		expect(runStages(new Pipeline<State, Env>([]), input, { tag: 'x' })).toEqual(input);
	});

	test('covers every PlotPhase in Pipeline.ORDER exactly once', () => {
		expect(new Set(Pipeline.ORDER).size).toBe(Pipeline.ORDER.length);
	});
});

describe('Pipeline.interpolation', () => {
	test('a kind that gives its tween as a function of its props gets it back as is', () => {
		type Link = { id: string; n: number };
		const value = (link: Link) => link.n;
		const key = (link: Link) => link.id;
		const pipeline = new Pipeline<State, Env>([], {
			timeline: { interpolation: () => ({ value, key }) as never }
		});
		const tween = pipeline.interpolation({ data: [{ id: 'a', n: 1 }] }, DEFAULT_CONFIG);
		expect(tween).toEqual({ value, key });
	});

	test('a plot without data tweens nothing', () => {
		const pipeline = new Pipeline<State, Env>([], {
			timeline: { interpolation: () => ({ value: () => 0 }) }
		});
		expect(pipeline.interpolation({}, DEFAULT_CONFIG)).toBeUndefined();
	});
});
