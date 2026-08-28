import type { Meta, StoryObj } from '@storybook/svelte-vite';
import FacetDemo, { dataForGroupCount } from './FacetDemo.svelte';
import { renderSource } from '../../common/docsSource';

// `FacetDemo` renders through a wrapper, so `parameters.docs.source.code`
// overrides the "show code" panel with the real `<FacetLayout>` call via
// `renderSource` — see `stories/common/docsSource.ts`.
function carouselSource(visible: number) {
  return renderSource('FacetLayout', {
    data: dataForGroupCount(6),
    by: 'group',
    columns: 3,
    mode: 'carousel',
    visible,
  });
}

/** `mode: 'carousel'` — `visible` facets show at a time; swipe/drag to browse the rest. */
const meta = {
  title: 'Layout/Facets/Carousel',
  component: FacetDemo,
  tags: ['autodocs'],
  args: { width: 720, height: 480, groupCount: 6, columns: 3, mode: 'carousel' as const },
  argTypes: {
    width: { control: { type: 'range', min: 400, max: 1000, step: 20 } },
    height: { control: { type: 'range', min: 300, max: 800, step: 20 } },
    groupCount: { control: false },
    columns: { control: false },
    mode: { control: false },
    visible: { control: { type: 'range', min: 1, max: 4, step: 1 } },
  },
} satisfies Meta<typeof FacetDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One facet visible at a time. */
export const OneVisible: Story = {
  args: { visible: 1 },
  parameters: { docs: { source: { code: carouselSource(1) } } },
};

/** Two facets visible at once. */
export const TwoVisible: Story = {
  args: { visible: 2 },
  parameters: { docs: { source: { code: carouselSource(2) } } },
};

/** Fully custom `indicator` snippet replacing the default badge. */
export const CustomIndicator: Story = {
  args: { visible: 1, customIndicator: true },
  parameters: { docs: { source: { code: carouselSource(1) } } },
};
