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
 * The default timeline: a rule beside the plot - a line with the steps written
 * along it and the current one emphasised. A plot's `timeline` slices its rows
 * by `accessor` and follows `progress` (`0`-`1`) across the steps; `orientation`
 * says which way the rule runs, `thickness` how much room it takes, and `show`
 * hides it. For a bar with play, pause and a slider, see `Layout/Timeline/Player`.
 */
const meta = {
  title: 'Layout/Timeline/Rule',
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta;

export default meta;

/** A vertical rule - the default for plots that are wider than tall. */
export const Vertical: StoryObj = {
  render: () => ({ Component: RuleDemo, props: { orientation: 'vertical' } }),
  parameters: demoSource(RuleDemoSource),
};

/** A horizontal rule - typical below a plot on narrow layouts. */
export const Horizontal: StoryObj = {
  render: () => ({ Component: RuleDemo, props: { orientation: 'horizontal' } }),
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
