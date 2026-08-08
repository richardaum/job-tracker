type TourDefinition = {
  id: string;
  phases: readonly [string, ...string[]];
  dataSources?: Readonly<Record<string, string>>;
};

export type TourRegistry = Readonly<Record<string, TourDefinition>>;
export type TourSession = { id: string; phase: string };
export type ActiveTour = TourDefinition & { phase: string };
