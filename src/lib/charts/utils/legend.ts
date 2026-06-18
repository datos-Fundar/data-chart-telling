import type {
  DiscreteLegendSection,
  LegendItem,
} from '$lib/types/charts/legend';
import type { SymbolType } from '$lib/types/plots/styles';

/**
 * A small categorical palette used when the caller groups by `z` but does not
 * supply explicit colours. Kept deliberately short and high-contrast.
 */
export const DEFAULT_PALETTE = [
  '#4f46e5',
  '#e6580d',
  '#16a34a',
  '#dc2626',
  '#0891b2',
  '#9333ea',
  '#ca8a04',
  '#db2777',
] as const;

/** Resolves a stable colour for a group, falling back to the palette by index. */
export function colorResolver(
  colors: Record<string, string> | undefined,
  palette: readonly string[] = DEFAULT_PALETTE,
): (name: string, index: number) => string {
  return (name, index) =>
    colors?.[name] ?? palette[index % palette.length];
}

/** Builds a discrete legend section from a group→colour map. */
export function discreteLegendFromColors(
  colors: Record<string, string>,
  options: {
    title?: string;
    columns?: number;
    symbol?: SymbolType;
    labels?: Record<string, string>;
  } = {},
): DiscreteLegendSection {
  const items: LegendItem[] = Object.entries(colors).map(([name, color]) => ({
    name,
    label: options.labels?.[name] ?? name,
    color,
    symbol: options.symbol ?? 'line',
  }));
  return {
    type: 'discrete',
    title: options.title,
    items,
    columns: options.columns ?? Math.min(items.length, 4),
  };
}
