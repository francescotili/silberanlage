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
  Highest,
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

/**
 * Enum for the log levels
 */
export enum LogLevel {
  Verbose,
  Standard,
}

/**
 * Enum for log importance
 */
export enum LogImportance {
  Error,
  Warn,
  Normal,
}

/**
 * Enum for output rendering
 */
export enum Graphics {
  /**
   * ASCII Graphics
   */
  ASCII,
  /**
   * CSS Graphics
   */
  CSS,
  /**
   * 3D Graphics
   */
  ThreeJS,
}
