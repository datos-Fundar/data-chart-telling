import type { GeoFeature, Topology } from '$lib/types/plots/data/geo';

export function isTopology(data: unknown): data is Topology {
  return !!data && typeof data === 'object' && (data as { type?: unknown }).type === 'Topology';
}

/**
 * Converts a TopoJSON `Topology` to GeoJSON via `topojson-client`'s
 * `feature()`, loaded with a dynamic import so the package works perfectly
 * for consumers who never install `topojson-client` — it's an optional peer
 * dependency (see package.json), never statically imported.
 */
export async function topologyToGeoJson<TProps extends Record<string, unknown>>(
  topology: Topology,
  object: string,
): Promise<GeoFeature<TProps>[]> {
  const obj = topology.objects[object];
  if (!obj) {
    throw new Error(`GeoPlot: topology.objects has no key "${object}".`);
  }

  let mod: unknown;
  try {
    // @ts-expect-error — topojson-client is an optional peer dependency; its
    // type declarations are intentionally not resolved by our own build
    // (`Topology` above is typed structurally instead), so this import is
    // resolved purely at runtime.
    mod = await import('topojson-client');
  } catch {
    throw new Error(
      "GeoPlot: `data` is a TopoJSON Topology, but 'topojson-client' isn't installed. " +
        'Run `npm install topojson-client` (it\'s an optional peer dependency) or pass GeoJSON directly.',
    );
  }

  const { feature } = mod as {
    feature: (topology: unknown, object: unknown) => GeoJSON.FeatureCollection | GeoJSON.Feature;
  };
  const collection = feature(topology, obj);
  return (collection.type === 'FeatureCollection' ? collection.features : [collection]) as GeoFeature<TProps>[];
}
