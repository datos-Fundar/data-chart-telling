import type { DotMarkerConfig } from './dot';
import type { TextMarkerConfig } from './text';

/** Every marker kind usable on any plot, axis-based or geo. */
export type BasicMarkersConfig = DotMarkerConfig | TextMarkerConfig;
