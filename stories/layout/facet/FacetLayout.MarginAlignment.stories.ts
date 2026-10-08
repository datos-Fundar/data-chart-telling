import type { Meta, StoryObj } from '@storybook/svelte-vite';
import FacetMarginAlignmentDemo, { barData, lineData, truncate } from './FacetMarginAlignmentDemo.svelte';
import { renderSource } from '../../common/docsSource';
import { estimateCategoricalAxisMargin } from '$lib/plots/utils/categoricalAxisMargin';

// `FacetMarginAlignmentDemo` renders through a wrapper, so
// `parameters.docs.source.code` overrides the "show code" panel with the
// real `<FacetLayout>` call via `renderSource` - see `stories/common/docsSource.ts`.
function barSource(aligned: boolean) {
  return renderSource('FacetLayout', {
    data: barData,
    by: 'province',
    columns: 3,
    ...(aligned
      ? {
          marginsForFacet: (rows: { category: string }[]) => ({
            left: estimateCategoricalAxisMargin(rows.map((r) => truncate(r.category))),
          }),
        }
      : {}),
  });
}

function lineSource(aligned: boolean) {
  return renderSource('FacetLayout', {
    data: lineData,
    by: 'province',
    columns: 3,
    ...(aligned
      ? {
          marginsForFacet: (rows: { value: number }[]) => ({
            left: estimateCategoricalAxisMargin(rows.map((r) => r.value.toLocaleString('en-US'))),
          }),
        }
      : {}),
  });
}

/**
 * Each facet auto-sizes its own left margin to its own axis's widest label
 * - different labels across facets, different margins, content starting at
 * different x. `marginsForFacet` measures every facet's candidate labels
 * (off-DOM, via canvas) and feeds back one shared `margins.left`.
 */
const meta = {
  title: 'Layout/Facets/MarginAlignment',
  component: FacetMarginAlignmentDemo,
  tags: ['autodocs'],
  args: { width: 900, height: 420 },
  argTypes: {
    kind: { control: { type: 'radio' }, options: ['bar', 'line'] },
    aligned: { control: 'boolean' },
    width: { control: { type: 'range', min: 400, max: 1000, step: 20 } },
    height: { control: { type: 'range', min: 300, max: 600, step: 20 } },
  },
} satisfies Meta<typeof FacetMarginAlignmentDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Categorical Y axis, one province per facet - long and short names side by side. */
export const BarMisaligned: Story = {
  args: { kind: 'bar', aligned: false },
  parameters: { docs: { source: { code: barSource(false) } } },
};

/** Same data, aligned - every bar starts at the same x. */
export const BarAligned: Story = {
  args: { kind: 'bar', aligned: true },
  parameters: { docs: { source: { code: barSource(true) } } },
};

/** Numeric Y axis, wildly different value magnitudes per facet. */
export const LineMisaligned: Story = {
  args: { kind: 'line', aligned: false },
  parameters: { docs: { source: { code: lineSource(false) } } },
};

/** Same data, aligned - every facet's content box starts at the same x. */
export const LineAligned: Story = {
  args: { kind: 'line', aligned: true },
  parameters: { docs: { source: { code: lineSource(true) } } },
};
