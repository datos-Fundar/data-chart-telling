import type { Preview } from '@storybook/svelte-vite'
import { setConfiguration } from '$lib/configuration/config.svelte'
import { THEMES } from '$lib/configuration/themes'

function isPrimitive(v: unknown): boolean {
  return v === null || typeof v !== 'object';
}

// Arrays longer than this (e.g. GeoPlot's `data` — dozens to hundreds of
// GeoJSON features, each with a coordinate ring of its own that can run into
// the thousands of points) get previewed as their first few items + an
// ellipsis marker instead of being fully stringified. Applied recursively,
// so it also catches large nested arrays (like a feature's own
// `geometry.coordinates` ring), not just the top-level `data` array — this
// is what actually made the "show code" panel hang before.
const MAX_ARRAY_PREVIEW = 3;
const ARRAY_PREVIEW_COUNT = 1;

function serialize(v: unknown, depth = 0): string {
  const pad = '  '.repeat(depth);
  const inner = '  '.repeat(depth + 1);

  // Functions: short arrow functions show their source; multi-line functions
  // (e.g. Svelte components) show just the name.
  if (typeof v === 'function') {
    const fn = v as Function & { displayName?: string; __name?: string };
    const src = fn.toString().trim();
    if (src.includes('\n')) return fn.displayName || fn.__name || fn.name || 'Component';
    return src;
  }

  if (typeof v === 'string') return `'${v}'`;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);

  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    const truncated = v.length > MAX_ARRAY_PREVIEW;
    const shown = truncated ? v.slice(0, ARRAY_PREVIEW_COUNT) : v;
    const remaining = v.length - shown.length;
    if (v.every(isPrimitive)) {
      const rendered = shown.map(i => serialize(i, depth));
      if (truncated) rendered.push(`/* …${remaining} more */`);
      return `[${rendered.join(', ')}]`;
    }
    const items = shown.map(i => `${inner}${serialize(i, depth + 1)}`);
    if (truncated) items.push(`${inner}/* …${remaining} more */`);
    return `[\n${items.join(',\n')}\n${pad}]`;
  }

  if (v !== null && typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    if (entries.every(([, val]) => isPrimitive(val))) {
      return `{ ${entries.map(([k, val]) => `${k}: ${serialize(val)}`).join(', ')} }`;
    }
    const lines = entries.map(([k, val]) => `${inner}${k}: ${serialize(val, depth + 1)}`).join(',\n');
    return `{\n${lines}\n${pad}}`;
  }

  return JSON.stringify(v);
}

const preview: Preview = {
  beforeEach: () => {
    // `DEFAULT_CONFIG` is an intentional no-op theme; apply the Default
    // preset so every story shows an opinionated look out of the box. Runs
    // before each story, so it re-asserts even after a story (e.g. the
    // Configuration demo) resets or switches the global config.
    setConfiguration(THEMES.Default);
  },
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    docs: {
      source: {
        type: 'dynamic',
        transform: (_src: string, ctx: any) => {
          const c = ctx.component as any;
          const name = (
            ctx.parameters?.docs?.source?.name
            || c?.displayName || c?.__name || c?.name
            || ctx.title?.split('/').pop()
            || 'Component'
          );
          const lines = Object.entries(ctx.args ?? {}).map(([k, v]) => `  ${k}={${serialize(v, 1)}}`);
          return lines.length ? `<${name}\n${lines.join('\n')}\n/>` : `<${name} />`;
        },
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    },

    options: {
      // Sidebar order: a learning path from the low-level primitives (Plots,
      // then the layout building blocks — legend/timeline/facets/tooltip) up
      // through styling, the ready-made Charts, and finally Orchestration,
      // which shows them all composed together. Unlisted stories fall back
      // to alphabetical order.
      storySort: {
        order: [
          'Plots',
          [
            'LinePlot',
            [
              'Series',
              'Scales',
              'Styles',
              'Segments',
              'Markers',
              [
                'Rules',
                'Deltas',
                'Custom',
              ],
              'Tooltip',
            ],
            'BarPlot',
            [
              'Series',
              'Scales',
              'Styles',
              'Segments',
              'Markers',
              [
                'Rules',
                'Hover',
              ],
              'Tooltip',
            ],
            'HeatmapPlot',
            [
              'Series',
              'Scales',
              'Styles',
              'Segments',
              'Markers',
              [
                'Rules',
                'Hover',
              ],
              'Tooltip',
            ],
            'PyramidPlot',
            [
              'Series',
              'Scales',
              'Styles',
              'Segments',
              'Markers',
              [
                'Rules',
              ],
              'Tooltip',
            ],
            'ScatterPlot',
            [
              'Series',
              'Scales',
              'Styles',
              'Segments',
              'Bubble',
              'Markers',
              [
                'Rules',
                'Hover',
                'Custom',
              ],
              'Tooltip',
            ],
            'GeoPlot',
            [
              'Series',
              'Scales',
              'Styles',
              'Segments',
              'Markers',
              [
                'Graticule',
                'Dot',
                'Vector',
                'Link',
                'Contour',
                'Inset',
                'Hover',
                'Custom',
              ],
              'Tooltip',
            ],
          ],
          'Layout',
          'Configuration',
          'Charts',
          'Orchestration'
        ],
      },
    },
  },
};

export default preview;