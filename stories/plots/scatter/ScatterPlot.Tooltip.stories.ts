import type { Meta, StoryObj } from '@storybook/svelte-vite';
import ScatterPlot from '$lib/plots/scatter/Plot.svelte';
import RichTooltip from './RichTooltip.svelte';
import { COUNTRIES, AMERICAS, type CountryPoint } from './data';

// ── Meta ──────────────────────────────────────────────────────────────────────

const meta = {
  title: 'Plots/ScatterPlot/Tooltip',
  component: ScatterPlot,
  tags: ['autodocs'],
  args: {
    width: 940,
    height: 500,
    data: AMERICAS,
    x: 'gdpPerCapita',
    y: 'lifeExpectancy',
  },
  argTypes: {
    width: { control: { type: 'range', min: 300, max: 940, step: 50 } },
    height: { control: { type: 'range', min: 200, max: 700, step: 50 } },
    data: { control: false },
    tooltip: { control: false },
  },
  parameters: {
    docs: { source: { name: 'ScatterPlot' } },
  },
} satisfies Meta<typeof ScatterPlot>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Stories ───────────────────────────────────────────────────────────────────

/** No tooltip — hovering over the plot produces no floating label. The default when `tooltip` is omitted. */
export const NoTooltip: Story = {
  args: {},
};

/**
 * Native tooltip — `format` receives the nearest hovered row and returns
 * plain text. `strategy` defaults to `'punctual'` for scatter, since points
 * scatter freely across x/y rather than sharing discrete x values: the
 * tooltip follows the single nearest point, not a whole vertical slice.
 */
export const BasicTooltip: Story = {
  args: {
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { country, gdpPerCapita, lifeExpectancy } = row as CountryPoint;
        return `${country}: $${gdpPerCapita.toFixed(1)}k, ${lifeExpectancy.toFixed(1)} yr`;
      },
    },
  },
};

/** Multi-line `format` — `\n` splits the tooltip into a heading and a body. */
export const RichFormat: Story = {
  args: {
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { country, gdpPerCapita, lifeExpectancy, population } = row as CountryPoint;
        return `${country}\nGDP: $${gdpPerCapita.toFixed(1)}k · Life exp.: ${lifeExpectancy.toFixed(1)} yr\nPop.: ${population}M`;
      },
    },
  },
};

/** Grouped data — `z` renders one point cloud per region; the tooltip follows whichever region's point is nearest the cursor. */
export const GroupedByRegion: Story = {
  args: {
    data: COUNTRIES,
    z: 'region',
    tooltip: {
      facetId: '',
      sync: false,
      format: (row) => {
        const { country, region, lifeExpectancy } = row as CountryPoint;
        return `${country} (${region}): ${lifeExpectancy.toFixed(1)} yr`;
      },
    },
  },
};

/**
 * Fully custom HTML tooltip via `content` — replaces the default floating
 * label with an arbitrary snippet: a coloured header, a metric list, and a
 * footnote. `format` is still required by the type but ignored once
 * `content` is set. See `RichTooltip.svelte` for the markup — the library
 * automatically drops its own dark tooltip box (background/padding/border)
 * whenever `content` is set, so the custom card fully owns the look.
 */
export const CustomContent: StoryObj = {
  render: () => ({ Component: RichTooltip }),
};

/**
 * `anchorX`/`anchorY` override the system default (`'right'`/`'bottom'`).
 * Here it's pinned above-and-to-the-left of the cursor instead — still
 * falls back toward the opposite side (via the centered position) if the
 * cursor gets close enough to an edge that the preferred side would
 * overflow.
 */
export const CustomAnchor: Story = {
  args: {
    tooltip: {
      facetId: '',
      sync: false,
      anchorX: 'left',
      anchorY: 'top',
      format: (row) => {
        const { country, gdpPerCapita, lifeExpectancy } = row as CountryPoint;
        return `${country}: $${gdpPerCapita.toFixed(1)}k, ${lifeExpectancy.toFixed(1)} yr`;
      },
    },
  },
};
