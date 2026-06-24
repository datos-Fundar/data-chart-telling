import type { Preview } from '@storybook/svelte-vite'
import { setConfiguration } from '$lib/configuration/config.svelte'
import { THEMES } from '$lib/configuration/themes'

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