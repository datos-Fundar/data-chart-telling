// Flat heatmap cells over time, with a scenario facet dimension — used by the
// HeatmapChart/tooltip/configuration/orchestration stories.

export type HeatCell = {
  year: number;
  scenario: string; // facet dimension
  rooms: number; // x
  people: number; // y
  pct: number; // value
};

export const HEAT_CELLS: HeatCell[] = ['Base', 'Proyectado'].flatMap((scenario, si) =>
  [1991, 2001, 2010, 2022].flatMap((year, yi) =>
    [1, 2, 3, 4].flatMap((rooms) =>
      [1, 2, 3, 4].map((people) => {
        const closeness = 4 - Math.abs(rooms - people);
        const drift = (yi + si) * 0.6;
        return {
          year,
          scenario,
          rooms,
          people,
          pct: Math.max(0, Math.round((closeness + drift) * 3)) / 100,
        };
      }),
    ),
  ),
);
