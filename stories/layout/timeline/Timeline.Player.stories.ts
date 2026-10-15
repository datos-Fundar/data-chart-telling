import type { Meta, StoryObj } from '@storybook/svelte-vite';
import PlayerDemo from './PlayerDemo.svelte';
import PlayerDemoSource from './PlayerDemo.svelte?raw';
import PlayerControlsDemo from './PlayerControlsDemo.svelte';
import PlayerControlsDemoSource from './PlayerControlsDemo.svelte?raw';
import PlayerCallbacksDemo from './PlayerCallbacksDemo.svelte';
import PlayerCallbacksDemoSource from './PlayerCallbacksDemo.svelte?raw';
import CustomWidgetDemo from './CustomWidgetDemo.svelte';
import CustomWidgetDemoSource from './CustomWidgetDemo.svelte?raw';
import PlayerComposerDemo from './PlayerComposerDemo.svelte';
import PlayerComposerDemoSource from './PlayerComposerDemo.svelte?raw';
import PlayerStyleDemo from './PlayerStyleDemo.svelte';
import PlayerStyleDemoSource from './PlayerStyleDemo.svelte?raw';
import { demoSource } from '../../common/docsSource';

/**
 * A timeline draws as a `'rule'` beside the plot (the default: a line with its
 * steps written along it) or as a `'player'`: a bar in the figure's chrome
 * with play and pause, the current step, a slider, and optionally a speed and a
 * loop button.
 *
 * A player keeps its own position, starting from the timeline's `progress`
 * and telling `onprogress` as it moves; setting `progress` again takes it
 * back. It is always horizontal, and it is the chrome's `timeline` block, so
 * `order` places it like the title or the legend.
 */
const meta = {
	title: 'Layout/Timeline/Player',
	tags: ['autodocs'],
	parameters: { layout: 'padded' }
} satisfies Meta;

export default meta;

/** The default player: below the plot, with play, the current year and a slider. */
export const Player: StoryObj = {
	render: () => ({ Component: PlayerDemo }),
	parameters: demoSource(PlayerDemoSource)
};

/**
 * `player.controls` lists the controls drawn - `'play'`, `'value'`,
 * `'slider'`, `'speed'` and `'loop'` - in the order given. `loop`, `speed`,
 * `speeds`, `stepDuration`, `autoplay` and `format` set how it plays and reads.
 * Add `'timeline'` to the chrome's `order` to place the bar.
 */
export const Controls: StoryObj = {
	render: () => ({ Component: PlayerControlsDemo }),
	parameters: demoSource(PlayerControlsDemoSource)
};

/**
 * The timeline tells its owner what happens: `onprogress` and `onvalue`, and on
 * `player`, `onplay`, `onspeed` and `onloop`.
 */
export const Callbacks: StoryObj = {
	render: () => ({ Component: PlayerCallbacksDemo as never }),
	parameters: demoSource(PlayerCallbacksDemoSource)
};

/**
 * To build your own widget, leave `controls` empty (the bar isn't drawn) and
 * read and drive the timeline from `useFigure().timeline` - or
 * `usePlot().timeline` - in anything inside the figure, its chrome included:
 * `play`, `pause`, `toggle`, `seek`, `seekValue`, `next`, `previous`,
 * `setSpeed`, `setLoop`, and the `value`, `progress`, `playing`, `loop` and
 * `speed` it reads.
 */
export const CustomWidget: StoryObj = {
	render: () => ({ Component: CustomWidgetDemo }),
	parameters: demoSource(CustomWidgetDemoSource)
};

/** A `PlotComposer`'s `timeline` takes the same `type` and `player`: one player for every panel. */
export const InAComposer: StoryObj = {
	render: () => ({ Component: PlayerComposerDemo }),
	parameters: demoSource(PlayerComposerDemoSource)
};

/**
 * The player is styled by the configuration's `timeline.player`: its
 * background, radius, padding and gap, the play button, the slider's track and
 * handle, and the speed and loop buttons - each also a `--dct-player-*`
 * custom property. Its `controls`, `speeds` and `stepDuration` defaults are
 * there too. The rule's own styling is in `Layout/Timeline/Rule`.
 */
export const Styling: StoryObj = {
	render: () => ({ Component: PlayerStyleDemo }),
	parameters: {
		docs: { ...demoSource(PlayerStyleDemoSource).docs, story: { inline: false, height: '450px' } }
	}
};
