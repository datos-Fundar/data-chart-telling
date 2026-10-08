import type { Meta, StoryObj } from '@storybook/svelte-vite';
import TimelineBox from './TimelineBox.svelte';
import TimelineLayoutDemo from './TimelineLayoutDemo.svelte';
import TimelineLayoutInterpolatedDemo from './TimelineLayoutInterpolatedDemo.svelte';

/**
 * `Timeline` is the purely visual scrubber strip: a baseline rule plus the
 * ordered step labels, with the current one emphasised. It has no notion of
 * data - `TimelineLayout` is the layer that couples it to a `progress` value
 * and slices a dataset down to the selected step for whatever plot you give it.
 */
const meta = {
  title: 'Layout/Timeline',
  component: TimelineBox,
  tags: ['autodocs'],
  args: {
    values: [2018, 2019, 2020, 2021, 2022],
    currentValue: 2020,
  },
} satisfies Meta<typeof TimelineBox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A vertical gutter - the default for charts that are wider than tall. */
export const Vertical: Story = {
  args: { orientation: 'vertical', width: 60, height: 360 },
};

/** A horizontal strip - typical below a chart on narrow/mobile layouts. */
export const Horizontal: Story = {
  args: { orientation: 'horizontal', width: 600, height: 60 },
};

/** `TimelineLayout` coupled to a draggable scrubber and a real plot (vertical). */
export const InteractiveVertical: StoryObj = {
  render: () => ({ Component: TimelineLayoutDemo, props: { orientation: 'vertical' } }),
};

/** Same coupling, horizontal orientation. */
export const InteractiveHorizontal: StoryObj = {
  render: () => ({ Component: TimelineLayoutDemo, props: { orientation: 'horizontal' } }),
};

/**
 * `interpolate` tweens each category's bar between its real values at the
 * two years bracketing the scrub position, instead of snapping straight from
 * one snapshot to the next - the data here skips 2019/2021 on purpose, so
 * the tween visibly bridges years that don't exist in the dataset.
 */
export const Interpolated: StoryObj = {
  render: () => ({ Component: TimelineLayoutInterpolatedDemo, props: { orientation: 'horizontal' } }),
};
