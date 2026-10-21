import type { BasicMarkersConfig } from '$lib/types/markers/basic/basicMarkersConfig';
import type { LineMarkerConfig } from './line';
import type { BarMarkerConfig } from './bar';
import type { CellMarkerConfig } from './cell';
import type { RectMarkerConfig } from './rect';
import type { RegressionMarkerConfig } from './regression';
import type { BollingerMarkerConfig } from './bollinger';
import type { AreaMarkerConfig } from './area';
import type { DensityMarkerConfig } from './density';
import type { BoxMarkerConfig } from './box';
import type { HullMarkerConfig } from './hull';
import type { DifferenceMarkerConfig } from './difference';
import type { ArrowMarkerConfig } from './arrow';
import type { BrushMarkerConfig } from './brush';
import type { DelaunayLinkMarkerConfig } from './delaunayLink';
import type { DelaunayMeshMarkerConfig } from './delaunayMesh';
import type { VoronoiMarkerConfig } from './voronoi';
import type { VoronoiMeshMarkerConfig } from './voronoiMesh';
import type { ImageMarkerConfig } from './image';
import type { RasterMarkerConfig } from './raster';
import type { TickMarkerConfig } from './tick';
import type { TrailMarkerConfig } from './trail';
import type { WaffleMarkerConfig } from './waffle';
import type { ViolinMarkerConfig } from './violin';
import type { RuleMarkerConfig } from './rule';
import type { HoverMarkerConfig } from './hover';
import type { CustomComponentMarkerConfig } from './component';
import type { DeltaMarkerConfig } from './delta';

/** Every marker kind an axis-based plot can render. */
export type AxisBasedMarkersConfig =
	| BasicMarkersConfig
	| LineMarkerConfig
	| BarMarkerConfig
	| CellMarkerConfig
	| RectMarkerConfig
	| RegressionMarkerConfig
	| BollingerMarkerConfig
	| AreaMarkerConfig
	| DensityMarkerConfig
	| BoxMarkerConfig
	| HullMarkerConfig
	| DifferenceMarkerConfig
	| ArrowMarkerConfig
	| BrushMarkerConfig
	| DelaunayLinkMarkerConfig
	| DelaunayMeshMarkerConfig
	| VoronoiMarkerConfig
	| VoronoiMeshMarkerConfig
	| ImageMarkerConfig
	| RasterMarkerConfig
	| TickMarkerConfig
	| TrailMarkerConfig
	| WaffleMarkerConfig
	| ViolinMarkerConfig
	| RuleMarkerConfig
	| HoverMarkerConfig
	| CustomComponentMarkerConfig
	| DeltaMarkerConfig;
