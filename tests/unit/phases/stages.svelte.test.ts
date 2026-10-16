import { describe, test, expect, vi } from 'vitest';
import { Pipeline } from '$lib/phases/Pipeline';
import type { PhaseStage } from '$lib/types/phases';
import { runStages } from '../plots/_helpers/stages';

// ── Fixtures ─────────────────────────────────────────────────────────────────

type State = { log: string[] };
type Ctx = { tag: string };

function stage(phase: PhaseStage<State, Ctx>['phase'], label: string): PhaseStage<State, Ctx> {
	return {
		phase,
		run: (state, ctx) => ({ log: [...state.log, `${label}:${ctx.tag}`] })
	};
}

describe('Pipeline', () => {
	test('runs stages in Pipeline.ORDER, ignoring the order they were passed in', () => {
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
		const stages: PhaseStage<State, Ctx>[] = [
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
		expect(runStages(new Pipeline<State, Ctx>([]), input, { tag: 'x' })).toEqual(input);
	});

	test('covers every PlotPhase in Pipeline.ORDER exactly once', () => {
		expect(new Set(Pipeline.ORDER).size).toBe(Pipeline.ORDER.length);
	});
});
