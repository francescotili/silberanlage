/**
 * Describe the type of processes
 */
export enum Process {
  /** Parts need to be silver coated */
  Silver,
  /** In addition to silver, parts first need a copper coating */
  Copper,
  /** Parts that has to few silver, they need to silver coated again */
  Rework,
  /** Process to fill the plant using the empty drum */
  PlantFilling,
  /** Process to not load any new Auftrag and finish all running processes */
  PlantEmptying,
}

/**
 * Enum to store Priority levels
 */
export enum Priority {
  Low,
  Normal,
  High,
}

/**
 * Enum to store the types of Scheduler
 */
export enum Scheduler {
  FCFS,
  FCFSPrio,
}

/**
 * Enum to describe the simulation status
 */
export enum SimulationStatus {
  Running,
  Paused,
  Ready,
}
