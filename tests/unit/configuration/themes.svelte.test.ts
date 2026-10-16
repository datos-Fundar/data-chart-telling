import { describe, test, expect } from 'vitest';
import { DEFAULT_CONFIG } from '$lib/configuration/config.svelte';
import { SYSTEM_FONT } from '$lib/configuration/fonts';
import { THEMES } from '$lib/configuration/themes';

describe('fonts', () => {
	test("the configuration follows the host's font, and the Default theme sets a system sans-serif", () => {
		expect(DEFAULT_CONFIG.font).toBe('inherit');
		expect(THEMES.Default.font).toBe(SYSTEM_FONT);
		expect(SYSTEM_FONT).toContain('sans-serif');
	});
});
