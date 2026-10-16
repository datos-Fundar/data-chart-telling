import { describe, test, expect } from 'vitest';
import { HoverState } from '$lib/layout/hover/HoverState.svelte';

describe('HoverState - isolated series', () => {
	test('a series isolated in one scope reads only there', () => {
		const hover = new HoverState();
		hover.isolate('a', 'panel-0');
		expect(hover.isolatedIn('panel-0')).toBe('a');
		expect(hover.isolatedIn('panel-1')).toBeNull();
	});

	test('a synced hover isolates it in every scope', () => {
		const hover = new HoverState();
		hover.sync = true;
		hover.isolate('a', 'panel-0');
		expect(hover.isolatedIn('panel-1')).toBe('a');
	});

	test('null ends it', () => {
		const hover = new HoverState();
		hover.isolate('a', '');
		hover.isolate(null, '');
		expect(hover.isolatedIn('')).toBeNull();
	});
});
