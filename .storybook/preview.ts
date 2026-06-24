import type { Preview } from '@storybook/svelte-vite'
import { setConfiguration } from '$lib/configuration/config.svelte'
import { THEMES } from '$lib/configuration/themes'

function isPrimitive(v: unknown): boolean {
  return v === null || typeof v !== 'object';
}

function serialize(v: unknown, depth = 0): string {
  const pad = '  '.repeat(depth);
  const inner = '  '.repeat(depth + 1);

  if (typeof v === 'string') return `'${v}'`;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);

  if (Array.isArray(v)) {
    if (v.length === 0) return '[]';
    if (v.every(isPrimitive))
      return `[${v.map(i => serialize(i, depth)).join(', ')}]`;
    const items = v.map(i => `${inner}${serialize(i, depth + 1)}`).join(',\n');
    return `[\n${items}\n${pad}]`;
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
          const name = ctx.title?.split('/').pop() ?? 'Component';
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
        order: ['Plots', 'Layout', 'Configuration', 'Charts', 'Orchestration'],
      },
    },
  },
};

export default preview;