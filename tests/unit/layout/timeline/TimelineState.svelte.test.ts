import { describe, test, expect, vi } from 'vitest';
import { TimelineState, type TimelineSettings } from '$lib/layout/timeline/TimelineState.svelte';

const VALUES = [2000, 2001, 2002, 2003, 2004];

function make(settings: Partial<TimelineSettings> = {}) {
	let current: TimelineSettings = { values: VALUES, ...settings };
	const state = new TimelineState(() => current);
	return { state, set: (next: Partial<TimelineSettings>) => (current = { ...current, ...next }) };
}

describe('TimelineState - how it draws', () => {
	test('is a player unless its owner asks for a rule', () => {
		expect(make().state.type).toBe('player');
		expect(make({ type: 'rule' }).state.type).toBe('rule');
	});
});

describe('TimelineState - where it is', () => {
	test("follows the owner's progress, and lands on the step it is at", () => {
		const { state, set } = make({ progress: 0.5 });
		expect(state.index).toBe(2);
		expect(state.value).toBe(2002);
		set({ progress: 1 });
		expect(state.value).toBe(2004);
	});

	test('moving it is its own until the owner sets another position', () => {
		const onprogress = vi.fn();
		const { state, set } = make({ progress: 0, onprogress });
		state.seekIndex(3);
		expect(state.value).toBe(2003);
		expect(onprogress).toHaveBeenCalledWith(0.75);
		set({ progress: 0.25 });
		expect(state.value).toBe(2001);
	});

	test('seeks by value to the closest step, and steps next and previous', () => {
		const { state } = make();
		state.seekValue(2002.9);
		expect(state.value).toBe(2003);
		state.next();
		state.next();
		expect(state.value).toBe(2004);
		state.previous();
		expect(state.value).toBe(2003);
	});

	test('without values of its own it takes the steps its plots report', () => {
		const state = new TimelineState(() => ({}));
		expect(state.value).toBeUndefined();
		state.setSteps([1, 2, 3]);
		state.seek(1);
		expect(state.value).toBe(3);
	});
});

describe('TimelineState - playing', () => {
	test('advances by the step duration, scaled by speed', () => {
		const { state } = make({ player: { stepDuration: 100 } });
		state.play();
		state.advance(100);
		expect(state.value).toBe(2001);
		state.setSpeed(2);
		state.advance(100);
		expect(state.value).toBe(2003);
	});

	test('stops at the last step, or starts over when looping', () => {
		const onplay = vi.fn();
		const stopping = make({ player: { stepDuration: 100, onplay } });
		stopping.state.play();
		stopping.state.advance(200);
		stopping.state.advance(200);
		stopping.state.advance(200);
		stopping.state.advance(200);
		expect(stopping.state.value).toBe(2004);
		expect(stopping.state.playing).toBe(false);
		expect(onplay).toHaveBeenLastCalledWith(false);

		const looping = make({ player: { stepDuration: 100, loop: true } });
		looping.state.play();
		looping.state.seek(0.99);
		looping.state.advance(100);
		expect(looping.state.playing).toBe(true);
		expect(looping.state.progress).toBeLessThan(0.3);
	});

	test('playing from the end starts from the first step', () => {
		const { state } = make({ progress: 1 });
		state.play();
		expect(state.progress).toBe(0);
		expect(state.playing).toBe(true);
	});

	test('does not play without at least two steps', () => {
		const { state } = make({ values: [2000] });
		state.play();
		expect(state.playing).toBe(false);
	});

	test('cycles through its speeds and tells the owner', () => {
		const onspeed = vi.fn();
		const { state } = make({ player: { speeds: [1, 2, 4], onspeed } });
		state.cycleSpeed();
		state.cycleSpeed();
		state.cycleSpeed();
		expect(onspeed.mock.calls.map(([s]) => s)).toEqual([2, 4, 1]);
	});

	test("starts from the owner's loop and speed, and tells it of changes", () => {
		const onloop = vi.fn();
		const { state } = make({ player: { loop: true, speed: 2, onloop } });
		expect(state.loop).toBe(true);
		expect(state.speed).toBe(2);
		state.setLoop(false);
		expect(onloop).toHaveBeenCalledWith(false);
	});
});
