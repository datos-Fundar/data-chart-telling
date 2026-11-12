import { describe, test, expect } from 'vitest';
import { SharedStepScales } from '$lib/phases/sharedScales/SharedStepScales';

describe('SharedStepScales.over', () => {
	const whole = {
		P1: { x: { domain: [0, 160], nice: false }, y: { domain: ['A', 'B'] } },
		P2: { x: { domain: [0, 160], nice: false }, y: { domain: ['A', 'B'] } }
	};
	const step = (hiP1: number, hiP2: number) => ({
		P1: { x: { domain: [0, hiP1], nice: false }, y: { domain: ['A'] } },
		P2: { x: { domain: [0, hiP2], nice: false }, y: { domain: ['B'] } }
	});

	test('a numeric extent is the widest any step reaches, per panel', () => {
		const out = SharedStepScales.over(whole, ['y'], [step(60, 40), step(50, 80)]) as typeof whole;
		expect(out.P1.x.domain).toEqual([0, 60]);
		expect(out.P2.x.domain).toEqual([0, 80]);
		expect(out.P1.x.nice).toBe(false);
	});

	test('a band axis keeps the whole run domain, which holds every category', () => {
		const out = SharedStepScales.over(whole, ['y'], [step(60, 40), step(50, 80)]) as typeof whole;
		expect(out.P1.y.domain).toEqual(['A', 'B']);
	});

	test('a categorical domain keeps the whole run one whatever the axes', () => {
		const out = SharedStepScales.over(whole, [], [step(60, 40)]) as typeof whole;
		expect(out.P1.y.domain).toEqual(['A', 'B']);
	});

	test('a date extent stays dates', () => {
		const dates = { '': { x: { domain: [new Date(0), new Date(1000)] } } };
		const steps = [
			{ '': { x: { domain: [new Date(100), new Date(300)] } } },
			{ '': { x: { domain: [new Date(50), new Date(200)] } } }
		];
		const out = SharedStepScales.over(dates, [], steps) as typeof dates;
		expect(out[''].x.domain).toEqual([new Date(50), new Date(300)]);
	});

	test('a channel no step has keeps the whole run domain', () => {
		const out = SharedStepScales.over(whole, ['y'], [{}, undefined]) as typeof whole;
		expect(out.P1.x.domain).toEqual([0, 160]);
	});

	test('without a whole run there is nothing to widen', () => {
		expect(SharedStepScales.over(undefined, [], [])).toBeUndefined();
	});
});
