import type { Meta, StoryObj } from '@storybook/svelte-vite';
import RuleDemo from './RuleDemo.svelte';
import RuleDemoSource from './RuleDemo.svelte?raw';
import TimelineLayoutDemo from './TimelineLayoutDemo.svelte';
import TimelineLayoutDemoSource from './TimelineLayoutDemo.svelte?raw';
import TimelineLayoutInterpolatedDemo from './TimelineLayoutInterpolatedDemo.svelte';
import TimelineLayoutInterpolatedDemoSource from './TimelineLayoutInterpolatedDemo.svelte?raw';
import RuleStyleDemo from './RuleStyleDemo.svelte';
import RuleStyleDemoSource from './RuleStyleDemo.svelte?raw';
import { demoSource } from '../../common/docsSource';

/**
 * `type: 'rule'` draws the timeline as a rule beside the plot - a line with the
 * steps written along it and the current one emphasised. A plot's `timeline` slices its rows
 * by `accessor` and follows `progress` (`0`-`1`) across the steps; `orientation`
 * says which way the rule runs, `thickness` how much room it takes, and `show`
 * hides it. The default timeline is the player, a bar with play, pause and a
 * slider: see `Layout/Timeline/Player`.
 */
const meta = {
  title: 'Layout/Timeline/Rule',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

/**
 * A vertical rule - the rule's default orientation, suited to plots that are wider than tall. It sits to
 * the right of the plot: a vertical timeline is the same as putting
 * `'(plot, timeline)'` in the chrome's `order`, which it configures for you.
 */
export const Vertical: StoryObj = {
  render: () => ({ Component: RuleDemo, props: { orientation: 'vertical' } }),
  parameters: demoSource(RuleDemoSource),
};

/** A horizontal rule - typical below a plot on narrow layouts. It takes the `timeline` block's place in the chrome's `order`, below the plot by default. */
export const Horizontal: StoryObj = {
  render: () => ({ Component: RuleDemo, props: { orientation: 'horizontal' } }),
  parameters: demoSource(RuleDemoSource),
};

/**
 * To keep a vertical rule but on the left, say so in `order`: a row that
 * places the timeline and the plot yourself, `'(timeline, plot)'`, wins over
 * the one the vertical rule would set up.
 */
export const LeftOfThePlot: StoryObj = {
  render: () => ({
    Component: RuleDemo,
    props: { orientation: 'vertical', order: ['title', '(timeline, plot)'] },
  }),
  parameters: demoSource(RuleDemoSource),
};

/** A horizontal rule is the `timeline` block, so `order` moves it like any other - here above the plot. */
export const AboveThePlot: StoryObj = {
  render: () => ({
    Component: RuleDemo,
    props: { orientation: 'horizontal', order: ['title', 'timeline', 'plot'] },
  }),
  parameters: demoSource(RuleDemoSource),
};

/** `TimelineLayout` coupled to a draggable scrubber and a real plot (vertical). */
export const InteractiveVertical: StoryObj = {
  render: () => ({ Component: TimelineLayoutDemo, props: { orientation: 'vertical' } }),
  parameters: demoSource(TimelineLayoutDemoSource),
};

/** Same coupling, horizontal orientation. */
export const InteractiveHorizontal: StoryObj = {
  render: () => ({ Component: TimelineLayoutDemo, props: { orientation: 'horizontal' } }),
  parameters: demoSource(TimelineLayoutDemoSource),
};

/**
 * `interpolate` tweens each category's bar between its real values at the
 * two years bracketing the scrub position, instead of snapping straight from
 * one snapshot to the next - the data here skips 2019/2021 on purpose, so
 * the tween visibly bridges years that don't exist in the dataset.
 */
export const Interpolated: StoryObj = {
  render: () => ({ Component: TimelineLayoutInterpolatedDemo, props: { orientation: 'horizontal' } }),
  parameters: demoSource(TimelineLayoutInterpolatedDemoSource),
};

/**
 * The rule is styled by the configuration's `timeline`: `axisColor` and
 * `activeColor` for the line and the current step, `thickness` and `gap` for
 * the gutter it takes, and `rule` for the line's width and opacity and the
 * steps' font sizes, weight and opacity. For the player bar, see
 * `Layout/Timeline/Player`.
 */
export const Styling: StoryObj = {
  render: () => ({ Component: RuleStyleDemo }),
  parameters: {
    docs: { ...demoSource(RuleStyleDemoSource).docs, story: { inline: false, height: '800px' } },
  },
};
