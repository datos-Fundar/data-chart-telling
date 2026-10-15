import { render } from 'vitest-browser-svelte';
import { describe, test, expect } from 'vitest';
import TimelinePlayer from '$lib/layout/timeline/TimelinePlayer.svelte';
import LinePlot from '$lib/plots/line/Plot.svelte';
import { TimelineState } from '$lib/layout/timeline/TimelineState.svelte';
import type { PlayerControl } from '$lib/types/layout/timeline';

const VALUES = [2000, 2001, 2002, 2003];

function player(controls: PlayerControl[]) {
	const state = new TimelineState(() => ({ values: VALUES, type: 'player', player: { controls } }));
	return { state, ...render(TimelinePlayer, { timeline: state }) };
}

describe('TimelinePlayer', () => {
	test('draws the controls listed, in that order, and none else', async () => {
		const { container } = player(['slider', 'play', 'loop']);
		const kinds = [...container.querySelector('.dct-player')!.children].map((el) => el.className);
		expect(kinds.map((c) => c.split(' ')[0])).toEqual([
			'dct-player__slider',
			'dct-player__play',
			'dct-player__toggle'
		]);
		expect(container.querySelector('.dct-player__value')).toBeNull();
	});

	test('the play button plays and pauses the timeline, and the value shows its step', async () => {
		const { state, container } = player(['play', 'value']);
		const button = container.querySelector('.dct-player__play') as HTMLButtonElement;
		button.click();
		expect(state.playing).toBe(true);
		await expect.poll(() => container.querySelector('[aria-label="Pause"]')).not.toBeNull();
		button.click();
		expect(state.playing).toBe(false);
		expect(container.querySelector('.dct-player__value')!.textContent!.trim()).toBe('2000');
	});

	test('the slider moves it by steps, the speed button cycles, the loop button toggles', async () => {
		const { state, container } = player(['slider', 'speed', 'loop']);
		const slider = container.querySelector('input')!;
		slider.value = '2';
		slider.dispatchEvent(new Event('input', { bubbles: true }));
		expect(state.value).toBe(2002);
		(container.querySelector('[aria-label="Speed"]') as HTMLButtonElement).click();
		expect(state.speed).toBe(2);
		(container.querySelector('[aria-label="Loop"]') as HTMLButtonElement).click();
		expect(state.loop).toBe(true);
	});
});

describe('a plot with a player timeline', () => {
	const data = VALUES.map((year) => ({ year, value: year - 1990 }));
	const props = {
		width: 500,
		height: 360,
		data,
		x: 'year',
		y: 'value',
		timeline: { accessor: 'year', type: 'player', filterMode: 'upTo' }
	} as const;

	async function order(chrome: string[]) {
		const { container } = render(LinePlot, { ...props, order: chrome } as never);
		await expect.poll(() => container.querySelector('.dct-player')).not.toBeNull();
		const blocks = [...container.querySelector('.dct-figure-chrome')!.children].map((el) =>
			el.className.includes('timeline') ? 'timeline' : el.className.includes('body') ? 'plot' : ''
		);
		return blocks.filter(Boolean);
	}

	test("draws the player in the chrome, where `order` puts it", async () => {
		expect(await order(['plot', 'timeline'])).toEqual(['plot', 'timeline']);
		expect(await order(['timeline', 'plot'])).toEqual(['timeline', 'plot']);
	});

	test('tells the owner of the position as it plays and moves', async () => {
		const positions: number[] = [];
		const { container } = render(LinePlot, {
			...props,
			timeline: { ...props.timeline, onprogress: (p: number) => positions.push(p) }
		} as never);
		await expect.poll(() => container.querySelector('.dct-player')).not.toBeNull();
		const slider = container.querySelector('input')!;
		slider.value = '3';
		slider.dispatchEvent(new Event('input', { bubbles: true }));
		expect(positions).toEqual([1]);
	});
});
