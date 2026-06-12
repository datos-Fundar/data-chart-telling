export type SymbolType = 'circle' | 'square' | 'triangle' | 'line';
export type LineStyle = 'solid' | 'dashed' | 'dotted' | 'dashdot';

export type LineStrokeStyle = {
  stroke?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokeDasharray?: string | LineStyle;
};

export type LineDotStyle = {
  dotRadius?: number;
  dotFill?: string;
  dotSymbol?: SymbolType;
  dotStroke?: string;
  dotStrokeWidth?: number;
};
