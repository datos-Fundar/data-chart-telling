import type { AnyRowContext, PlotRowContext } from '$lib/types/layout/context';
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
import type { RibbonMarkerConfig } from './ribbon';
import type { RuleMarkerConfig } from './rule';
import type { BandMarkerConfig } from './band';
import type { HoverMarkerConfig } from './hover';
import type { CustomComponentMarkerConfig } from './component';
import type { DeltaMarkerConfig } from './delta';

/**
 * Every marker kind an axis-based plot can render, its functions of a row reading `TContext`: what the plot kind
 * knows of each row. A plot kind gives its own, so a marker written on it reads it without naming it.
 */
export type AxisBasedMarkersConfig<TContext extends PlotRowContext = AnyRowContext> =
	| BasicMarkersConfig<TContext>
	| LineMarkerConfig<TContext>
	| BarMarkerConfig<TContext>
	| CellMarkerConfig<TContext>
	| RectMarkerConfig<TContext>
	| RegressionMarkerConfig<TContext>
	| BollingerMarkerConfig<TContext>
	| AreaMarkerConfig<TContext>
	| DensityMarkerConfig<TContext>
	| BoxMarkerConfig<TContext>
	| HullMarkerConfig<TContext>
	| DifferenceMarkerConfig<TContext>
	| ArrowMarkerConfig<TContext>
	| BrushMarkerConfig<TContext>
	| DelaunayLinkMarkerConfig<TContext>
	| DelaunayMeshMarkerConfig<TContext>
	| VoronoiMarkerConfig<TContext>
	| VoronoiMeshMarkerConfig<TContext>
	| ImageMarkerConfig<TContext>
	| RasterMarkerConfig<TContext>
	| TickMarkerConfig<TContext>
	| TrailMarkerConfig<TContext>
	| WaffleMarkerConfig<TContext>
	| ViolinMarkerConfig<TContext>
	| RibbonMarkerConfig<TContext>
	| RuleMarkerConfig<TContext>
	| BandMarkerConfig<TContext>
	| HoverMarkerConfig<TContext>
	| CustomComponentMarkerConfig
	| DeltaMarkerConfig;
