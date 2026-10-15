import type { Meta, StoryObj } from '@storybook/svelte-vite';
import LocaleDemo from './LocaleDemo.svelte';

/**
 * `axis.locale` and `axis.compactDisplay` control every axis's automatic
 * (no explicit `scales.x`/`scales.y` `tickFormat`) tick label, and the values
 * of a legend's size section. Set once,
 * globally, through the same `setConfiguration` used for styling:
 *
 * ```ts
 * import { setConfiguration } from '@fundar/data-chart-telling';
 *
 * setConfiguration({ axis: { locale: 'es-AR', compactDisplay: 'short' } });
 * ```
 *
 * `locale` defaults to `'es-AR'`. `compactDisplay` defaults to `'short'`
 * (abbreviated, e.g. `'1 M'`) rather than `'long'` (spelled out, e.g.
 * `'1 millón'`). Whether a given axis abbreviates at all stays svelteplot's
 * own per-axis call, based on that axis's value range.
 *
 * Each story below switches `locale` live with a button, but fixes its own
 * `compactDisplay` - unlike `locale`, it's read once when a chart mounts,
 * so it can't be switched on an already-rendered one. The configuration is
 * global, so each story renders in a frame of its own here: on one shared
 * page, the last story to load would set it for all of them.
 */
const meta = {
	title: 'Configuration/Locale',
	component: LocaleDemo,
	tags: ['autodocs'],
	parameters: {
		layout: 'padded',
		docs: { story: { inline: false, height: '600px' } }
	}
} satisfies Meta<typeof LocaleDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

const LOWER_MAGNITUDES_DATA = [
	{ region: 'Hundreds', value: 100 },
	{ region: 'Thousands', value: 2_000 }
];

/** Switches `axis.locale` on hundreds and thousands, on one axis. `compactDisplay: 'short'` (fixed). */
export const LowerMagnitudesShort: Story = {
	args: { compactDisplay: 'short', data: LOWER_MAGNITUDES_DATA }
};

/** Same data, `compactDisplay: 'long'` (fixed) instead. */
export const LowerMagnitudesLong: Story = {
	args: { compactDisplay: 'long', data: LOWER_MAGNITUDES_DATA }
};

const MEDIUM_MAGNITUDES_DATA = [
	{ region: 'Hundred-thousands', value: 300_000 },
	{ region: 'Millions', value: 2_500_000 }
];

/** Switches `axis.locale` across hundred-thousands and millions, on one axis. `compactDisplay: 'short'` (fixed). */
export const MediumMagnitudesShort: Story = {
	args: { compactDisplay: 'short', data: MEDIUM_MAGNITUDES_DATA }
};

/** Same data, `compactDisplay: 'long'` (fixed) instead. */
export const MediumMagnitudesLong: Story = {
	args: { compactDisplay: 'long', data: MEDIUM_MAGNITUDES_DATA }
};

const HIGHER_MAGNITUDES_DATA = [
	{ region: 'A', value: 590_000_000_000 },
	{ region: 'B', value: 780_000_000_000 },
	{ region: 'C', value: 610_000_000_000 },
	{ region: 'D', value: 990_000_000_000 },
	{ region: 'E', value: 1_010_000_000_000 }
];

/** Switches `axis.locale` on values in the hundreds of billions to over a trillion. `compactDisplay: 'short'` (fixed). */
export const HigherMagnitudesShort: Story = {
	args: { compactDisplay: 'short', data: HIGHER_MAGNITUDES_DATA }
};

/** Same data, `compactDisplay: 'long'` (fixed) instead. */
export const HigherMagnitudesLong: Story = {
	args: { compactDisplay: 'long', data: HIGHER_MAGNITUDES_DATA }
};
