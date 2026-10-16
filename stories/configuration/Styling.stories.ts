import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ConfigDemo from './ConfigDemo.svelte';

/**
 * The package ships a single global, reactive styling configuration. Call
 * `setConfiguration({...})` (a deep-merge over the defaults) and every chart on
 * screen restyles at once - font, colours, discrete palette, continuous
 * gradient, axis, spacing, legend, tooltip and timeline.
 *
 * ```ts
 * import { setConfiguration } from '@fundar/data-chart-telling';
 *
 * setConfiguration({
 *   font: 'Georgia, serif',
 *   palette: ['#9b2226', '#bb3e03', '#ca6702'],
 *   continuous: { min: '#fff3e0', max: '#bb3e03' },
 *   title: { size: '1.9rem', weight: 700 },
 *   axis: { color: '#8a6d3b', fontSize: 13 },
 * });
 * ```
 */
const meta = {
	title: 'Configuration/Styling',
	component: ConfigDemo,
	parameters: { layout: 'padded' }
} satisfies Meta<typeof ConfigDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Switch themes to watch one `setConfiguration` call restyle both charts. */
export const ThemeSwitcher: Story = {};
