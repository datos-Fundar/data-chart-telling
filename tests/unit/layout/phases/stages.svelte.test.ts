import { describe, test, expect } from 'vitest';
import { runStages, PHASE_ORDER } from '$lib/layout/phases/stages';
import type { PhaseStage } from '$lib/types/layout/phases';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type State = { log: string[] };
type Ctx = { tag: string };

function stage(phase: PhaseStage<State, Ctx>['phase'], label: string): PhaseStage<State, Ctx> {
	return {
		phase,
		run: (state, ctx) => ({ log: [...state.log, `${label}:${ctx.tag}`] })
	};
}

describe('runStages', () => {
	test('runs stages in PHASE_ORDER, ignoring the order they were passed in', () => {
		const stages: PhaseStage<State, Ctx>[] = [
			stage('facet', 'facet'),
			stage('tooltip', 'tooltip'),
			stage('markers', 'markers'),
			stage('scales', 'scales'),
			stage('statistics', 'stats'),
			stage('coordinates', 'coords'),
			stage('mapping', 'mapping'),
			stage('data', 'data')
		];
		const result = runStages(stages, { log: [] }, { tag: 'x' });
		expect(result.log).toEqual([
			'data:x',
			'mapping:x',
			'stats:x',
			'scales:x',
			'markers:x',
			'coords:x',
			'tooltip:x',
			'facet:x'
		]);
	});

	test('preserves declaration order between stages that share a phase', () => {
		const stages: PhaseStage<State, Ctx>[] = [
			stage('markers', 'second'),
			stage('markers', 'first')
		];
		// declared "second" before "first" on purpose - order within a phase
		// is whatever the caller passed, runStages never reorders same-phase stages.
		const result = runStages(stages, { log: [] }, { tag: 'x' });
		expect(result.log).toEqual(['second:x', 'first:x']);
	});

	test('an empty stage list returns the input state unchanged', () => {
		const input: State = { log: [] };
		expect(runStages([], input, { tag: 'x' })).toEqual(input);
	});

	test('covers every PlotPhase in PHASE_ORDER exactly once', () => {
		expect(new Set(PHASE_ORDER).size).toBe(PHASE_ORDER.length);
	});
});
